/*
# Core Schema: Profiles, Courses, Modules, Lessons, Progress, Storage

## Overview
This migration creates the foundational database schema for Research Bridge,
an educational LMS platform. It establishes user profiles, the course/module/lesson
hierarchy, lesson progress tracking, and storage buckets.

## New Tables
1. `profiles` — User profile info (name, avatar, bio) linked to auth.users
2. `courses` — Top-level educational courses
3. `modules` — Course modules (sections within a course)
4. `lessons` — Individual lessons within modules (video, text, objectives)
5. `lesson_progress` — Tracks each student's completion status per lesson

## Functions
1. `is_admin()` — Returns true if the current JWT has role='admin' in app_metadata
2. `handle_new_user()` — Auto-creates a profile when a user registers (SECURITY DEFINER trigger)
3. `handle_updated_at()` — Auto-updates updated_at timestamp on row changes

## Security
- RLS enabled on all tables
- Students can read published content; admins can read/write all content
- Students can only see/modify their own lesson progress
- Profile creation is automated via trigger (users cannot create profiles directly)
- Role is stored in auth.users.raw_app_meta_data (user-immutable), NOT in profiles table

## Storage Buckets
- `lesson-videos` (public) — for lesson video files
- `submission-files` (private) — for student submission uploads
- `resource-files` (public) — for research resource downloads
- `announcement-attachments` (public) — for announcement attachments

## Notes
1. The is_admin() function reads from auth.jwt() app_metadata — this is set
   by the admin bootstrap edge function using the service role key.
2. New user registration auto-creates a profile via the on_auth_user_created trigger.
3. The profiles table has no role column — role lives in JWT app_metadata only.
*/

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- PROFILES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  bio text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_admin_profiles" ON public.profiles;
CREATE POLICY "select_own_or_admin_profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_admin_profile" ON public.profiles;
CREATE POLICY "delete_admin_profile" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Auto-create profile on user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger for profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- COURSES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  thumbnail_url text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_courses" ON public.courses;
CREATE POLICY "select_courses" ON public.courses
  FOR SELECT TO authenticated
  USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "insert_courses_admin" ON public.courses;
CREATE POLICY "insert_courses_admin" ON public.courses
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_courses_admin" ON public.courses;
CREATE POLICY "update_courses_admin" ON public.courses
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_courses_admin" ON public.courses;
CREATE POLICY "delete_courses_admin" ON public.courses
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS courses_updated_at ON public.courses;
CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_sort_order ON public.courses(sort_order);

-- ============================================================
-- MODULES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_modules" ON public.modules;
CREATE POLICY "select_modules" ON public.modules
  FOR SELECT TO authenticated
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = modules.course_id
        AND courses.is_published = true
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "insert_modules_admin" ON public.modules;
CREATE POLICY "insert_modules_admin" ON public.modules
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_modules_admin" ON public.modules;
CREATE POLICY "update_modules_admin" ON public.modules
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_modules_admin" ON public.modules;
CREATE POLICY "delete_modules_admin" ON public.modules
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS modules_updated_at ON public.modules;
CREATE TRIGGER modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_modules_course ON public.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_sort_order ON public.modules(course_id, sort_order);

-- ============================================================
-- LESSONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  learning_objectives text[] NOT NULL DEFAULT '{}',
  video_url text,
  video_path text,
  text_content text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_lessons" ON public.lessons;
CREATE POLICY "select_lessons" ON public.lessons
  FOR SELECT TO authenticated
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.modules
      JOIN public.courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id
        AND modules.is_published = true
        AND courses.is_published = true
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "insert_lessons_admin" ON public.lessons;
CREATE POLICY "insert_lessons_admin" ON public.lessons
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_lessons_admin" ON public.lessons;
CREATE POLICY "update_lessons_admin" ON public.lessons
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_lessons_admin" ON public.lessons;
CREATE POLICY "delete_lessons_admin" ON public.lessons
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS lessons_updated_at ON public.lessons;
CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_sort_order ON public.lessons(module_id, sort_order);

-- ============================================================
-- LESSON PROGRESS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_admin_progress" ON public.lesson_progress;
CREATE POLICY "select_own_or_admin_progress" ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "insert_own_progress" ON public.lesson_progress;
CREATE POLICY "insert_own_progress" ON public.lesson_progress
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_or_admin_progress" ON public.lesson_progress;
CREATE POLICY "update_own_or_admin_progress" ON public.lesson_progress
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "delete_admin_progress" ON public.lesson_progress;
CREATE POLICY "delete_admin_progress" ON public.lesson_progress
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS lesson_progress_updated_at ON public.lesson_progress;
CREATE TRIGGER lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON public.lesson_progress(lesson_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('lesson-videos', 'lesson-videos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES
  ('submission-files', 'submission-files', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES
  ('resource-files', 'resource-files', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES
  ('announcement-attachments', 'announcement-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for lesson-videos (admin write, public read)
DROP POLICY IF EXISTS "read_lesson_videos" ON storage.objects;
CREATE POLICY "read_lesson_videos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'lesson-videos');

DROP POLICY IF EXISTS "write_lesson_videos_admin" ON storage.objects;
CREATE POLICY "write_lesson_videos_admin" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lesson-videos' AND public.is_admin());

DROP POLICY IF EXISTS "update_lesson_videos_admin" ON storage.objects;
CREATE POLICY "update_lesson_videos_admin" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'lesson-videos' AND public.is_admin())
  WITH CHECK (bucket_id = 'lesson-videos' AND public.is_admin());

DROP POLICY IF EXISTS "delete_lesson_videos_admin" ON storage.objects;
CREATE POLICY "delete_lesson_videos_admin" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'lesson-videos' AND public.is_admin());

-- Storage policies for submission-files (student writes own, admin reads all)
DROP POLICY IF EXISTS "read_submission_files" ON storage.objects;
CREATE POLICY "read_submission_files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'submission-files'
    AND (
      public.is_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "write_submission_files_owner" ON storage.objects;
CREATE POLICY "write_submission_files_owner" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'submission-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "delete_submission_files_owner_admin" ON storage.objects;
CREATE POLICY "delete_submission_files_owner_admin" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'submission-files'
    AND (
      public.is_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- Storage policies for resource-files (admin write, public read)
DROP POLICY IF EXISTS "read_resource_files" ON storage.objects;
CREATE POLICY "read_resource_files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resource-files');

DROP POLICY IF EXISTS "write_resource_files_admin" ON storage.objects;
CREATE POLICY "write_resource_files_admin" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resource-files' AND public.is_admin());

DROP POLICY IF EXISTS "update_resource_files_admin" ON storage.objects;
CREATE POLICY "update_resource_files_admin" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'resource-files' AND public.is_admin())
  WITH CHECK (bucket_id = 'resource-files' AND public.is_admin());

DROP POLICY IF EXISTS "delete_resource_files_admin" ON storage.objects;
CREATE POLICY "delete_resource_files_admin" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'resource-files' AND public.is_admin());

-- Storage policies for announcement-attachments (admin write, public read)
DROP POLICY IF EXISTS "read_announcement_attachments" ON storage.objects;
CREATE POLICY "read_announcement_attachments" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'announcement-attachments');

DROP POLICY IF EXISTS "write_announcement_attachments_admin" ON storage.objects;
CREATE POLICY "write_announcement_attachments_admin" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'announcement-attachments' AND public.is_admin());

DROP POLICY IF EXISTS "delete_announcement_attachments_admin" ON storage.objects;
CREATE POLICY "delete_announcement_attachments_admin" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'announcement-attachments' AND public.is_admin());