/*
# Fix quiz attempt numbering

1. Purpose
- Adds the missing `attempt_number` column required by the student quiz screen and secure grader.
- Updates the server-side submission function to store each student's attempt number.

2. Data safety
- Existing quiz attempts receive attempt number 1.
- No existing rows, answers, scores, or submissions are deleted or changed.

3. Security
- The existing authenticated-only quiz policies remain in place.
- The server-side function continues to derive the student from `auth.uid()` and enforce the quiz attempt limit.
*/

ALTER TABLE public.quiz_attempts
  ADD COLUMN IF NOT EXISTS attempt_number integer NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_attempts_quiz_user_number
  ON public.quiz_attempts(quiz_id, user_id, attempt_number);

CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  p_quiz_id uuid,
  p_answers jsonb
)
RETURNS TABLE(score integer, max_score integer, passed boolean, attempt_number integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quiz public.quizzes%ROWTYPE;
  v_attempt_id uuid;
  v_attempt_number integer;
  v_score integer := 0;
  v_max_score integer := 0;
  v_passed boolean := false;
  v_question public.quiz_questions%ROWTYPE;
  v_answer jsonb;
  v_selected uuid[];
  v_correct uuid[];
  v_is_correct boolean;
  v_points integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_quiz
  FROM public.quizzes
  WHERE id = p_quiz_id AND is_published = true;

  IF v_quiz.id IS NULL THEN
    RAISE EXCEPTION 'Quiz is unavailable';
  END IF;

  SELECT COALESCE(MAX(qa.attempt_number), 0) + 1
  INTO v_attempt_number
  FROM public.quiz_attempts qa
  WHERE qa.quiz_id = p_quiz_id AND qa.user_id = auth.uid();

  IF v_attempt_number > v_quiz.max_attempts THEN
    RAISE EXCEPTION 'Attempt limit reached';
  END IF;

  INSERT INTO public.quiz_attempts (quiz_id, user_id, attempt_number, status, max_score)
  VALUES (p_quiz_id, auth.uid(), v_attempt_number, 'in_progress', 0)
  RETURNING id INTO v_attempt_id;

  FOR v_question IN
    SELECT * FROM public.quiz_questions
    WHERE quiz_id = p_quiz_id
    ORDER BY sort_order
  LOOP
    v_answer := COALESCE(
      (SELECT value FROM jsonb_array_elements(COALESCE(p_answers, '[]'::jsonb)) value
       WHERE value->>'question_id' = v_question.id::text LIMIT 1),
      '{}'::jsonb
    );

    SELECT COALESCE(array_agg(value::uuid ORDER BY value::uuid), '{}'::uuid[])
    INTO v_selected
    FROM jsonb_array_elements_text(COALESCE(v_answer->'selected_option_ids', '[]'::jsonb));

    SELECT COALESCE(array_agg(id ORDER BY id), '{}'::uuid[])
    INTO v_correct
    FROM public.quiz_answer_options
    WHERE question_id = v_question.id AND is_correct = true;

    v_is_correct := v_selected = v_correct;
    v_is_correct := COALESCE(v_is_correct, false);
    v_points := v_question.points;
    v_max_score := v_max_score + v_points;
    IF v_is_correct THEN v_score := v_score + v_points; END IF;

    INSERT INTO public.quiz_responses (attempt_id, question_id, selected_option_ids, is_correct, points_earned)
    VALUES (v_attempt_id, v_question.id, v_selected, v_is_correct, CASE WHEN v_is_correct THEN v_points ELSE 0 END);
  END LOOP;

  IF v_max_score > 0 THEN
    v_passed := (v_score::numeric / v_max_score::numeric * 100) >= v_quiz.passing_score;
  END IF;

  UPDATE public.quiz_attempts
  SET status = 'completed', score = v_score, max_score = v_max_score, passed = v_passed, completed_at = now()
  WHERE id = v_attempt_id;

  RETURN QUERY SELECT v_score, v_max_score, v_passed, v_attempt_number;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_quiz_attempt(uuid, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_quiz_attempt(uuid, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(uuid, jsonb) TO authenticated;
