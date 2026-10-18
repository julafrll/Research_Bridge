/*
# Seed Research Bridge lesson quizzes and secure quiz submission

1. Purpose
- Adds the quiz content from Advanced_Research_Methodology_Quiz.pdf to the existing Lesson 2 and Lesson 8 records.
- Adds a server-side submission function so quiz answers are graded without exposing the answer key to students.

2. Quiz content
- Lesson 2 receives “Do Background Reading” with three multiple-choice questions.
- Lesson 8 receives “Analyze and Interpret Your Results” with three multiple-choice questions.
- Questions and answer options are inserted only when they are not already present, so this migration is safe to re-run.

3. Security
- `submit_quiz_attempt` derives the student from `auth.uid()`.
- The function checks that the quiz is published, enforces the configured attempt limit, calculates the score from the protected answer key, and returns only the result.
- Anonymous execution is revoked; authenticated students may submit their own attempts.

4. Important notes
- The project currently contains Lessons 2 and 8. The remaining PDF sections will be attached automatically when corresponding lessons are added.
*/

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

  INSERT INTO public.quiz_attempts (quiz_id, user_id, status, max_score)
  VALUES (p_quiz_id, auth.uid(), 'in_progress', 0)
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

    SELECT COALESCE(array_agg(value::uuid), '{}'::uuid[])
    INTO v_selected
    FROM jsonb_array_elements_text(COALESCE(v_answer->'selected_option_ids', '[]'::jsonb));

    SELECT COALESCE(array_agg(id ORDER BY id), '{}'::uuid[])
    INTO v_correct
    FROM public.quiz_answer_options
    WHERE question_id = v_question.id AND is_correct = true;

    SELECT v_question.points INTO v_points;
    v_is_correct := (SELECT array_agg(value ORDER BY value) FROM unnest(v_selected) value) = v_correct;
    v_is_correct := COALESCE(v_is_correct, false);
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

DO $$
DECLARE
  v_lesson_id uuid;
  v_quiz_id uuid;
  v_question_id uuid;
BEGIN
  SELECT l.id INTO v_lesson_id FROM public.lessons l WHERE l.title = 'Lesson 2' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_quiz_id FROM public.quizzes WHERE lesson_id = v_lesson_id LIMIT 1;
    IF v_quiz_id IS NULL THEN
      INSERT INTO public.quizzes (lesson_id, title, description, passing_score, max_attempts, show_explanations, is_published)
      VALUES (v_lesson_id, 'Do Background Reading Quiz', 'Check your understanding of background reading and source evaluation.', 70, 3, true, true)
      RETURNING id INTO v_quiz_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.quiz_questions WHERE quiz_id = v_quiz_id) THEN
      INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, points, explanation, sort_order)
      VALUES (v_quiz_id, 'What should a researcher do after finding conflicting conclusions in previous studies?', 'single', 1, 'Comparing methods, samples, and limitations helps explain why studies disagree.', 1) RETURNING id INTO v_question_id;
      INSERT INTO public.quiz_answer_options (question_id, option_text, is_correct, sort_order) VALUES
        (v_question_id, 'Use only the newest study', false, 1), (v_question_id, 'Compare the studies’ methods, samples, and limitations', true, 2), (v_question_id, 'Ignore studies with unexpected results', false, 3), (v_question_id, 'Select whichever conclusion is easier to explain', false, 4);

      INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, points, explanation, sort_order)
      VALUES (v_quiz_id, 'Which source is generally the strongest starting point for understanding established scientific findings?', 'single', 1, 'Peer-reviewed research is evaluated by experts before publication.', 2) RETURNING id INTO v_question_id;
      INSERT INTO public.quiz_answer_options (question_id, option_text, is_correct, sort_order) VALUES
        (v_question_id, 'An anonymous social media post', false, 1), (v_question_id, 'An advertisement for a product', false, 2), (v_question_id, 'A relevant peer-reviewed scientific article', true, 3), (v_question_id, 'An unsupported personal opinion', false, 4);

      INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, points, explanation, sort_order)
      VALUES (v_quiz_id, 'How can background reading improve a research project?', 'single', 1, 'Background reading helps identify knowledge gaps and refine the research question.', 3) RETURNING id INTO v_question_id;
      INSERT INTO public.quiz_answer_options (question_id, option_text, is_correct, sort_order) VALUES
        (v_question_id, 'It guarantees the hypothesis will be supported', false, 1), (v_question_id, 'It helps identify knowledge gaps and refine the research question', true, 2), (v_question_id, 'It removes the need for original data', false, 3), (v_question_id, 'It prevents unexpected findings', false, 4);
    END IF;
  END IF;

  SELECT l.id INTO v_lesson_id FROM public.lessons l WHERE l.title = 'Lesson 8' LIMIT 1;
  IF v_lesson_id IS NOT NULL THEN
    SELECT id INTO v_quiz_id FROM public.quizzes WHERE lesson_id = v_lesson_id LIMIT 1;
    IF v_quiz_id IS NULL THEN
      INSERT INTO public.quizzes (lesson_id, title, description, passing_score, max_attempts, show_explanations, is_published)
      VALUES (v_lesson_id, 'Analyze and Interpret Your Results Quiz', 'Check your understanding of correlation, median, and comparing improvements.', 70, 3, true, true)
      RETURNING id INTO v_quiz_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.quiz_questions WHERE quiz_id = v_quiz_id) THEN
      INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, points, explanation, sort_order)
      VALUES (v_quiz_id, 'A study finds a correlation between study time and exam scores. What can the researcher conclude from correlation alone?', 'single', 1, 'Correlation shows an association, but it does not establish causation.', 1) RETURNING id INTO v_question_id;
      INSERT INTO public.quiz_answer_options (question_id, option_text, is_correct, sort_order) VALUES
        (v_question_id, 'More studying definitely causes higher scores', false, 1), (v_question_id, 'Higher scores definitely cause more studying', false, 2), (v_question_id, 'Study time and scores are associated, but causation is not established', true, 3), (v_question_id, 'The relationship must be accidental', false, 4);

      INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, points, explanation, sort_order)
      VALUES (v_quiz_id, 'Why might a researcher calculate the median rather than the mean?', 'single', 1, 'The median is less affected by unusually high or low values.', 2) RETURNING id INTO v_question_id;
      INSERT INTO public.quiz_answer_options (question_id, option_text, is_correct, sort_order) VALUES
        (v_question_id, 'The median is always larger', false, 1), (v_question_id, 'The median is less affected by extreme values', true, 2), (v_question_id, 'The median eliminates all measurement errors', false, 3), (v_question_id, 'The median proves statistical significance', false, 4);

      INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, points, explanation, sort_order)
      VALUES (v_quiz_id, 'A treatment group improves by 12 points, while a control group improves by 5 points. What is the difference in average improvement?', 'single', 1, 'Subtract the control group improvement from the treatment group improvement: 12 minus 5 equals 7.', 3) RETURNING id INTO v_question_id;
      INSERT INTO public.quiz_answer_options (question_id, option_text, is_correct, sort_order) VALUES
        (v_question_id, '5 points', false, 1), (v_question_id, '7 points', true, 2), (v_question_id, '12 points', false, 3), (v_question_id, '17 points', false, 4);
    END IF;
  END IF;
END $$;
