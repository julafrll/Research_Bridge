/*
# Research Resources, Announcements, Notifications Schema

## Overview
This migration adds the Research Hub (resource library), announcements system,
and in-app notifications.

## New Tables
1. `research_resources` — Educational articles, fact cards, links, downloads
   with categories (Research Methodology, Academic Writing, etc.)
2. `announcements` — Admin-published announcements with title, content, date
3. `notifications` — In-app notifications for students (grades, feedback,
   new assignments, deadlines, announcements, revision requests)

## Security
- RLS enabled on all tables
- Published research resources: all authenticated users can read
- Published announcements: all authenticated users can read
- Notifications: students can only see their own; admins can see all
- Only admins can create/edit/delete resources and announcements
- Notifications are created by admin actions or the system (via SECURITY DEFINER functions)

## Notification Types
- new_assignment, upcoming_deadline, new_lesson, announcement,
  grade_published, feedback_published, revision_requested
*/

-- ============================================================
-- RESEARCH RESOURCES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.research_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Research Methodology' CHECK (
    category IN (
      'Research Methodology',
      'Academic Writing',
      'Research Questions',
      'Literature Reviews',
      'Research Ethics',
      'Citations and Referencing',
      'Data Collection and Analysis',
      'Research Tools',
      'Interesting Research Facts'
    )
  ),
  resource_type text NOT NULL DEFAULT 'article' CHECK (
    resource_type IN ('article', 'fact_card', 'link', 'download')
  ),
  external_link text,
  file_path text,
  image_url text,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.research_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_research_resources" ON public.research_resources;
CREATE POLICY "select_research_resources" ON public.research_resources
  FOR SELECT TO authenticated
  USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "insert_research_resources_admin" ON public.research_resources;
CREATE POLICY "insert_research_resources_admin" ON public.research_resources
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_research_resources_admin" ON public.research_resources;
CREATE POLICY "update_research_resources_admin" ON public.research_resources
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_research_resources_admin" ON public.research_resources;
CREATE POLICY "delete_research_resources_admin" ON public.research_resources
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS research_resources_updated_at ON public.research_resources;
CREATE TRIGGER research_resources_updated_at
  BEFORE UPDATE ON public.research_resources
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_resources_category ON public.research_resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_published ON public.research_resources(is_published);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON public.research_resources(is_featured);

-- ============================================================
-- ANNOUNCEMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  attachment_path text,
  attachment_name text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_announcements" ON public.announcements;
CREATE POLICY "select_announcements" ON public.announcements
  FOR SELECT TO authenticated
  USING (
    (is_published = true AND published_at <= now())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "insert_announcements_admin" ON public.announcements;
CREATE POLICY "insert_announcements_admin" ON public.announcements
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_announcements_admin" ON public.announcements;
CREATE POLICY "update_announcements_admin" ON public.announcements
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_announcements_admin" ON public.announcements;
CREATE POLICY "delete_announcements_admin" ON public.announcements
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS announcements_updated_at ON public.announcements;
CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON public.announcements(published_at);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (
    type IN (
      'new_assignment',
      'upcoming_deadline',
      'new_lesson',
      'announcement',
      'grade_published',
      'feedback_published',
      'revision_requested'
    )
  ),
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  link text,
  related_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_admin_notifications" ON public.notifications;
CREATE POLICY "select_own_or_admin_notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "insert_own_or_admin_notifications" ON public.notifications;
CREATE POLICY "insert_own_or_admin_notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "update_own_or_admin_notifications" ON public.notifications;
CREATE POLICY "update_own_or_admin_notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "delete_own_or_admin_notifications" ON public.notifications;
CREATE POLICY "delete_own_or_admin_notifications" ON public.notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================================
-- NOTIFY FUNCTION (SECURITY DEFINER)
-- Creates a notification for a user — callable by authenticated users (admin actions)
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text DEFAULT '',
  p_link text DEFAULT NULL,
  p_related_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link, related_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_link, p_related_id)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;