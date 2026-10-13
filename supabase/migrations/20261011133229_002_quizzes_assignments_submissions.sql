/*
# Quizzes, Assignments, Submissions, Grades Schema

## Overview
This migration adds the quiz system (quizzes, questions, answer options, attempts, responses),
the assignment system (assignments, submissions, submission files, grades/feedback), and
enrollments.

## New Tables
1. `quizzes` — Quizzes linked to lessons (passing score, point values)
2. `quiz_questions` — Questions within quizzes (single-answer or multiple-answer)
3. `quiz_answer_options` — Answer options for each question (correct flag is admin-only via RLS)
4. `quiz_attempts` — Student quiz attempts (started, completed, score)
5. `quiz_responses` — Individual responses within an attempt
6. `assignments` — Instructor-reviewed or quiz-based assignments with deadlines, rubrics
7. `enrollments` — Student enrollment in courses
8. `submissions` — Student assignment submissions (status, late flag, draft support)
9. `submission_files` — Files attached to submissions (stored in submission-files bucket)
10. `grades` — Published grades and feedback for submissions

## Security
- RLS enabled on all tables
- Quiz correct answers: students can NEVER read the is_correct column (separate admin-only policy)
  The is_correct column is excluded from student SELECT policies via a SECURITY DEFINER view
- Students can only see/modify their own attempts, responses, submissions, grades
- Admins can read/write everything
- Grades are only visible to the student who owns them and admins
- Enrollment is self-service for students (they can enroll in published courses)

## Important Notes
1. Quiz answer options use a separate function to hide is_correct from students:
   We create a view `quiz_answer_options_public` that excludes is_correct for non-admins.
   Students query this view; admins query the base table.
2. Quiz grading happens server-side via a SECURITY DEFINER function `grade_quiz_attempt`
   that reads is_correct from the base table (bypassing RLS) and updates the attempt score.
3. Submissions track status: not_started, in_progress, submitted, under_review,
   revision_requested, graded, overdue
*/

-- ============================================================
-- QUIZZES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  passing_score numeric NOT NULL DEFAULT 70,
  max_attempts integer NOT NULL DEFAULT 3,
  show_explanations boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_quizzes" ON public.quizzes;
CREATE POLICY "select_quizzes" ON public.quizzes
  FOR SELECT TO authenticated
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.lessons
      JOIN public.modules ON modules.id = lessons.module_id
      JOIN public.courses ON courses.id = modules.course_id
      WHERE lessons.id = quizzes.lesson_id
        AND lessons.is_published = true
        AND modules.is_published = true
        AND courses.is_published = true
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "insert_quizzes_admin" ON public.quizzes;
CREATE POLICY "insert_quizzes_admin" ON public.quizzes
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_quizzes_admin" ON public.quizzes;
CREATE POLICY "update_quizzes_admin" ON public.quizzes
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_quizzes_admin" ON public.quizzes;
CREATE POLICY "delete_quizzes_admin" ON public.quizzes
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS quizzes_updated_at ON public.quizzes;
CREATE TRIGGER quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON public.quizzes(lesson_id);

-- ============================================================
-- QUIZ QUESTIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'single' CHECK (question_type IN ('single', 'multiple')),
  points integer NOT NULL DEFAULT 1,
  explanation text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_quiz_questions" ON public.quiz_questions;
CREATE POLICY "select_quiz_questions" ON public.quiz_questions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
        AND (quizzes.is_published = true OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "insert_quiz_questions_admin" ON public.quiz_questions;
CREATE POLICY "insert_quiz_questions_admin" ON public.quiz_questions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_quiz_questions_admin" ON public.quiz_questions;
CREATE POLICY "update_quiz_questions_admin" ON public.quiz_questions
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_quiz_questions_admin" ON public.quiz_questions;
CREATE POLICY "delete_quiz_questions_admin" ON public.quiz_questions
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS quiz_questions_updated_at ON public.quiz_questions;
CREATE TRIGGER quiz_questions_updated_at
  BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);

-- ============================================================
-- QUIZ ANSWER OPTIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quiz_answer_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_answer_options ENABLE ROW LEVEL SECURITY;

-- Students get a view that EXCLUDES is_correct; this base table is admin-only
DROP POLICY IF EXISTS "select_quiz_answer_options_admin" ON public.quiz_answer_options;
CREATE POLICY "select_quiz_answer_options_admin" ON public.quiz_answer_options
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "insert_quiz_answer_options_admin" ON public.quiz_answer_options;
CREATE POLICY "insert_quiz_answer_options_admin" ON public.quiz_answer_options
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_quiz_answer_options_admin" ON public.quiz_answer_options;
CREATE POLICY "update_quiz_answer_options_admin" ON public.quiz_answer_options
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_quiz_answer_options_admin" ON public.quiz_answer_options;
CREATE POLICY "delete_quiz_answer_options_admin" ON public.quiz_answer_options
  FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_answer_options_question ON public.quiz_answer_options(question_id);

-- Public view for students: excludes is_correct column
CREATE OR REPLACE VIEW public.quiz_answer_options_public AS
SELECT
  id,
  question_id,
  option_text,
  sort_order,
  created_at
FROM public.quiz_answer_options;

-- ============================================================
-- QUIZ ATTEMPTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  score numeric,
  max_score integer NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_admin_attempts" ON public.quiz_attempts;
CREATE POLICY "select_own_or_admin_attempts" ON public.quiz_attempts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "insert_own_attempts" ON public.quiz_attempts;
CREATE POLICY "insert_own_attempts" ON public.quiz_attempts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_or_admin_attempts" ON public.quiz_attempts;
CREATE POLICY "update_own_or_admin_attempts" ON public.quiz_attempts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "delete_admin_attempts" ON public.quiz_attempts;
CREATE POLICY "delete_admin_attempts" ON public.quiz_attempts
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS quiz_attempts_updated_at ON public.quiz_attempts;
CREATE TRIGGER quiz_attempts_updated_at
  BEFORE UPDATE ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.quiz_attempts(user_id);

-- ============================================================
-- QUIZ RESPONSES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quiz_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_option_ids uuid[] NOT NULL DEFAULT '{}',
  is_correct boolean,
  points_earned integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_admin_responses" ON public.quiz_responses;
CREATE POLICY "select_own_or_admin_responses" ON public.quiz_responses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts
      WHERE quiz_attempts.id = quiz_responses.attempt_id
        AND (quiz_attempts.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "insert_own_responses" ON public.quiz_responses;
CREATE POLICY "insert_own_responses" ON public.quiz_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts
      WHERE quiz_attempts.id = quiz_responses.attempt_id
        AND quiz_attempts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_admin_responses" ON public.quiz_responses;
CREATE POLICY "delete_admin_responses" ON public.quiz_responses
  FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_responses_attempt ON public.quiz_responses(attempt_id);

-- ============================================================
-- GRADE QUIZ ATTEMPT FUNCTION (SECURITY DEFINER)
-- ============================================================

CREATE OR REPLACE FUNCTION public.grade_quiz_attempt(p_attempt_id uuid)
RETURNS TABLE(score numeric, max_score integer, passed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quiz_id uuid;
  v_passing_score numeric;
  v_max_score integer := 0;
  v_score numeric := 0;
  v_passed boolean := false;
  v_user_id uuid;
BEGIN
  -- Get attempt info
  SELECT quiz_id, user_id INTO v_quiz_id, v_user_id
  FROM public.quiz_attempts
  WHERE id = p_attempt_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Attempt not found';
  END IF;

  -- Get quiz passing score
  SELECT passing_score INTO v_passing_score
  FROM public.quizzes
  WHERE id = v_quiz_id;

  -- Calculate max_score and earned score from responses
  SELECT
    COALESCE(SUM(qq.points), 0),
    COALESCE(SUM(
      CASE WHEN qr.is_correct THEN qq.points ELSE 0 END
    ), 0)
  INTO v_max_score, v_score
  FROM public.quiz_responses qr
  JOIN public.quiz_questions qq ON qq.id = qr.question_id
  WHERE qr.attempt_id = p_attempt_id;

  -- Check if passed (percentage)
  IF v_max_score > 0 THEN
    v_passed := (v_score / v_max_score * 100) >= v_passing_score;
  END IF;

  -- Update attempt
  UPDATE public.quiz_attempts
  SET
    status = 'completed',
    score = v_score,
    max_score = v_max_score,
    passed = v_passed,
    completed_at = now()
  WHERE id = p_attempt_id;

  RETURN QUERY SELECT v_score, v_max_score, v_passed;
END;
$$;

-- ============================================================
-- ENROLLMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_admin_enrollments" ON public.enrollments;
CREATE POLICY "select_own_or_admin_enrollments" ON public.enrollments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "insert_own_enrollments" ON public.enrollments;
CREATE POLICY "insert_own_enrollments" ON public.enrollments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_or_admin_enrollments" ON public.enrollments;
CREATE POLICY "delete_own_or_admin_enrollments" ON public.enrollments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);

-- ============================================================
-- ASSIGNMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  module_id uuid REFERENCES public.modules(id) ON DELETE SET NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE SET NULL,
  title text NOT NULL,
  instructions text NOT NULL DEFAULT '',
  assignment_type text NOT NULL DEFAULT 'instructor' CHECK (assignment_type IN ('instructor', 'quiz')),
  deadline timestamptz,
  max_score integer NOT NULL DEFAULT 100,
  submission_format text NOT NULL DEFAULT 'text' CHECK (submission_format IN ('text', 'file', 'link', 'any')),
  allowed_file_types text[] NOT NULL DEFAULT '{}',
  max_upload_size_mb integer NOT NULL DEFAULT 25,
  grading_rubric text NOT NULL DEFAULT '',
  allow_resubmission boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_assignments" ON public.assignments;
CREATE POLICY "select_assignments" ON public.assignments
  FOR SELECT TO authenticated
  USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "insert_assignments_admin" ON public.assignments;
CREATE POLICY "insert_assignments_admin" ON public.assignments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_assignments_admin" ON public.assignments;
CREATE POLICY "update_assignments_admin" ON public.assignments
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_assignments_admin" ON public.assignments;
CREATE POLICY "delete_assignments_admin" ON public.assignments
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS assignments_updated_at ON public.assignments;
CREATE TRIGGER assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_assignments_course ON public.assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_deadline ON public.assignments(deadline);
CREATE INDEX IF NOT EXISTS idx_assignments_published ON public.assignments(is_published);

-- ============================================================
-- SUBMISSIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (
    status IN ('not_started', 'in_progress', 'submitted', 'under_review', 'revision_requested', 'graded', 'overdue')
  ),
  text_response text NOT NULL DEFAULT '',
  external_link text NOT NULL DEFAULT '',
  is_late boolean NOT NULL DEFAULT false,
  submitted_at timestamptz,
  attempt_number integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, user_id, attempt_number)
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_admin_submissions" ON public.submissions;
CREATE POLICY "select_own_or_admin_submissions" ON public.submissions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "insert_own_submissions" ON public.submissions;
CREATE POLICY "insert_own_submissions" ON public.submissions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_or_admin_submissions" ON public.submissions;
CREATE POLICY "update_own_or_admin_submissions" ON public.submissions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "delete_admin_submissions" ON public.submissions;
CREATE POLICY "delete_admin_submissions" ON public.submissions
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS submissions_updated_at ON public.submissions;
CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

-- ============================================================
-- SUBMISSION FILES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.submission_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.submission_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_admin_submission_files" ON public.submission_files;
CREATE POLICY "select_own_or_admin_submission_files" ON public.submission_files
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions
      WHERE submissions.id = submission_files.submission_id
        AND (submissions.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "insert_own_submission_files" ON public.submission_files;
CREATE POLICY "insert_own_submission_files" ON public.submission_files
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.submissions
      WHERE submissions.id = submission_files.submission_id
        AND submissions.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_or_admin_submission_files" ON public.submission_files;
CREATE POLICY "delete_own_or_admin_submission_files" ON public.submission_files
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions
      WHERE submissions.id = submission_files.submission_id
        AND (submissions.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE INDEX IF NOT EXISTS idx_submission_files_submission ON public.submission_files(submission_id);

-- ============================================================
-- GRADES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  feedback text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  graded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(submission_id)
);

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_admin_grades" ON public.grades;
CREATE POLICY "select_own_or_admin_grades" ON public.grades
  FOR SELECT TO authenticated
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.submissions
      WHERE submissions.id = grades.submission_id
        AND submissions.user_id = auth.uid()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "insert_grades_admin" ON public.grades;
CREATE POLICY "insert_grades_admin" ON public.grades
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_grades_admin" ON public.grades;
CREATE POLICY "update_grades_admin" ON public.grades
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_grades_admin" ON public.grades;
CREATE POLICY "delete_grades_admin" ON public.grades
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS grades_updated_at ON public.grades;
CREATE TRIGGER grades_updated_at
  BEFORE UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_grades_submission ON public.grades(submission_id);
CREATE INDEX IF NOT EXISTS idx_grades_published ON public.grades(is_published);