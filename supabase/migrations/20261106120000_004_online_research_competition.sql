/*
# Online Research Paper Competition

## New table
`competition_entries` — one entry per participant account: registration details,
research details, uploaded paper and poster, declarations/consents, and the
organizer-controlled review state (status, note, award, gallery publishing).

Every entry gets a human-readable submission ID (RB-0001, RB-0002, …) that
organizers use to match records (e.g. in an exported Google Sheet).

## New view
`competition_gallery` — the public-safe columns of entries that an organizer
published AND whose author consented to public display. Readable by anyone.
No emails, ages, or private notes are exposed.

## Storage
`competition-files` (private) — `<user_id>/paper/...`, `<user_id>/poster/...`.
Owners and admins can read; anyone can read a poster (or a paper, if the author
consented to sharing it) once its entry is published.

## Security
- Participants can create and edit only their own entry, and only while it is a
  draft, submitted, or returned for correction.
- A trigger stops participants from changing organizer-controlled columns
  (status beyond draft/submitted, organizer_note, award, is_published).
- Admins (is_admin()) can read and update everything.
*/

CREATE SEQUENCE IF NOT EXISTS public.competition_entry_seq START 1;
GRANT USAGE, SELECT ON SEQUENCE public.competition_entry_seq TO authenticated;

CREATE TABLE IF NOT EXISTS public.competition_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_code text NOT NULL UNIQUE, -- set by trigger: RB-0001, RB-0002, ...

  -- Participant
  full_name text NOT NULL DEFAULT '',
  display_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  school text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  age_group text NOT NULL DEFAULT '',
  grade_level text NOT NULL DEFAULT '',

  -- Research
  project_title text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  is_collaborative boolean NOT NULL DEFAULT false,
  collaborators text NOT NULL DEFAULT '',
  abstract text NOT NULL DEFAULT '',

  -- Materials
  paper_path text,
  paper_name text,
  poster_path text,
  poster_name text,
  video_url text NOT NULL DEFAULT '',

  -- Declarations & consent
  contribution_confirmed boolean NOT NULL DEFAULT false,
  ai_disclosure text NOT NULL DEFAULT '',
  ethics_confirmed boolean NOT NULL DEFAULT false,
  public_display_consent boolean NOT NULL DEFAULT false,
  paper_public_consent boolean NOT NULL DEFAULT false,
  guardian_consent boolean NOT NULL DEFAULT false,

  -- Organizer-controlled
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'returned', 'eligible', 'ineligible')),
  organizer_note text NOT NULL DEFAULT '',
  award text CHECK (award IN ('first', 'second', 'third')),
  is_published boolean NOT NULL DEFAULT false,

  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS competition_entries_status_idx ON public.competition_entries (status);
CREATE INDEX IF NOT EXISTS competition_entries_category_idx ON public.competition_entries (category);

DROP TRIGGER IF EXISTS competition_entries_updated_at ON public.competition_entries;
CREATE TRIGGER competition_entries_updated_at
  BEFORE UPDATE ON public.competition_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Assigns the submission ID and stops participants from touching
-- organizer-controlled columns.
CREATE OR REPLACE FUNCTION public.guard_competition_entry()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.submission_code IS NULL OR NOT public.is_admin() THEN
      NEW.submission_code := 'RB-' || lpad(nextval('public.competition_entry_seq')::text, 4, '0');
    END IF;

    IF NOT public.is_admin() THEN
      IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'You can only create your own entry';
      END IF;
      IF NEW.status NOT IN ('draft', 'submitted') THEN
        NEW.status := 'draft';
      END IF;
      NEW.organizer_note := '';
      NEW.award := NULL;
      NEW.is_published := false;
    END IF;

    IF NEW.status = 'submitted' THEN
      NEW.submitted_at := now();
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE
  IF NOT public.is_admin() THEN
    IF OLD.status NOT IN ('draft', 'submitted', 'returned') THEN
      RAISE EXCEPTION 'This entry is locked while it is being reviewed';
    END IF;
    IF NEW.status NOT IN ('draft', 'submitted') THEN
      RAISE EXCEPTION 'Invalid status';
    END IF;
    NEW.user_id := OLD.user_id;
    NEW.submission_code := OLD.submission_code;
    NEW.organizer_note := OLD.organizer_note;
    NEW.award := OLD.award;
    NEW.is_published := OLD.is_published;
    NEW.created_at := OLD.created_at;
  END IF;

  IF NEW.status = 'submitted' AND OLD.status IS DISTINCT FROM 'submitted' THEN
    NEW.submitted_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS competition_entries_guard ON public.competition_entries;
CREATE TRIGGER competition_entries_guard
  BEFORE INSERT OR UPDATE ON public.competition_entries
  FOR EACH ROW EXECUTE FUNCTION public.guard_competition_entry();

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.competition_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_admin_competition_entries" ON public.competition_entries;
CREATE POLICY "select_own_or_admin_competition_entries" ON public.competition_entries
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "insert_own_competition_entry" ON public.competition_entries;
CREATE POLICY "insert_own_competition_entry" ON public.competition_entries
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "update_own_or_admin_competition_entry" ON public.competition_entries;
CREATE POLICY "update_own_or_admin_competition_entry" ON public.competition_entries
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "delete_admin_competition_entry" ON public.competition_entries;
CREATE POLICY "delete_admin_competition_entry" ON public.competition_entries
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ============================================================
-- PUBLIC GALLERY VIEW (public-safe columns only)
-- ============================================================

DROP VIEW IF EXISTS public.competition_gallery;
CREATE VIEW public.competition_gallery AS
  SELECT
    id,
    submission_code,
    COALESCE(NULLIF(display_name, ''), full_name) AS author,
    CASE WHEN is_collaborative THEN collaborators ELSE '' END AS collaborators,
    project_title,
    category,
    abstract,
    poster_path,
    CASE WHEN paper_public_consent THEN paper_path ELSE NULL END AS paper_path,
    video_url,
    award,
    country
  FROM public.competition_entries
  WHERE is_published = true
    AND public_display_consent = true
    AND status = 'eligible';

GRANT SELECT ON public.competition_gallery TO anon, authenticated;

-- Used by storage policies; SECURITY DEFINER so anonymous visitors can check
-- whether a file belongs to a published entry without reading the table.
CREATE OR REPLACE FUNCTION public.is_public_competition_file(object_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.competition_entries e
    WHERE e.is_published
      AND e.public_display_consent
      AND e.status = 'eligible'
      AND (e.poster_path = object_name
           OR (e.paper_public_consent AND e.paper_path = object_name))
  );
$$;

-- ============================================================
-- STORAGE
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('competition-files', 'competition-files', false, 26214400,
   ARRAY['application/pdf',
         'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "read_competition_files" ON storage.objects;
CREATE POLICY "read_competition_files" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (
    bucket_id = 'competition-files'
    AND (
      public.is_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_public_competition_file(name)
    )
  );

DROP POLICY IF EXISTS "insert_competition_files_owner" ON storage.objects;
CREATE POLICY "insert_competition_files_owner" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'competition-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "update_competition_files_owner" ON storage.objects;
CREATE POLICY "update_competition_files_owner" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'competition-files' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'competition-files' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "delete_competition_files_owner_admin" ON storage.objects;
CREATE POLICY "delete_competition_files_owner_admin" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'competition-files'
    AND (public.is_admin() OR (storage.foldername(name))[1] = auth.uid()::text)
  );
