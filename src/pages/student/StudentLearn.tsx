import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  Clock,
  Plus,
  ClipboardCheck,
  FileText,
  Link as LinkIcon,
  Upload,
  Calendar,
  Award,
  Send,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { VideoPlayer } from '@/components/VideoPlayer';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  ProgressBar,
  EmptyState,
  LoadingPage,
  Textarea,
  Input,
} from '@/components/ui';
import type {
  Course,
  Module,
  Lesson,
  LessonProgress,
  Enrollment,
  Assignment,
  Submission,
  Quiz,
  QuizQuestion,
  QuizAnswerOptionPublic,
  QuizAttempt,
} from '@/types';
import { formatDate, daysUntil, isOverdue } from '@/lib/utils';

export function StudentLearn() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    if (!user) return;
    setLoading(true);

    const { data: publishedCourses } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('sort_order');

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', user.id);

    const enrolled = new Set(
      ((enrollments as Enrollment[] | null) ?? []).map((e) => e.course_id)
    );

    setCourses((publishedCourses as Course[] | null) ?? []);
    setEnrolledIds(enrolled);
    setLoading(false);
  };

  const enroll = async (courseId: string) => {
    if (!user) return;
    await supabase.from('enrollments').insert({
      user_id: user.id,
      course_id: courseId,
    });
    setEnrolledIds((prev) => new Set([...prev, courseId]));
  };

  if (loading) return <LoadingPage message="Loading courses..." />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Research Bridge Program</h1>
        <p className="mt-1 text-sm text-muted-500">
          Browse available courses and continue your learning journey.
        </p>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<BookOpen className="h-6 w-6" />}
              title="No courses available yet"
              description="Courses will appear here once your instructor publishes them."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const isEnrolled = enrolledIds.has(course.id);
            return (
              <Card key={course.id} hover>
                <CardBody>
                  <div className="flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-navy-700 to-navy-900">
                    <BookOpen className="h-10 w-10 text-white/30" />
                  </div>
                  <h3 className="mt-4 font-semibold text-navy-900">{course.title}</h3>
                  <p className="mt-1 text-sm text-muted-500 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    {isEnrolled ? (
                      <Badge variant="success">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Enrolled
                      </Badge>
                    ) : (
                      <Badge variant="neutral">Not enrolled</Badge>
                    )}
                  </div>
                  <div className="mt-3">
                    {isEnrolled ? (
                      <Link to={`/learn/${course.id}`}>
                        <Button fullWidth size="sm">
                          Continue Learning <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    ) : (
                      <Button fullWidth size="sm" variant="secondary" onClick={() => enroll(course.id)}>
                        <Plus className="h-3.5 w-3.5" /> Enroll
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface AssignmentWithSubmission {
  assignment: Assignment;
  submission: Submission | null;
}

export function StudentCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
  const [assignmentsByLesson, setAssignmentsByLesson] = useState<Record<string, AssignmentWithSubmission[]>>({});
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (courseId) loadCourseDetail();
  }, [courseId, user]);

  const loadCourseDetail = async () => {
    if (!courseId || !user) return;
    setLoading(true);

    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('is_published', true)
      .maybeSingle();
    setCourse(courseData as Course | null);

    if (!courseData) {
      setLoading(false);
      return;
    }

    const { data: moduleData } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_published', true)
      .order('sort_order');
    const moduleList = (moduleData as Module[] | null) ?? [];
    setModules(moduleList);

    const lessonsMap: Record<string, Lesson[]> = {};
    const allLessonIds: string[] = [];

    for (const mod of moduleList) {
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', mod.id)
        .eq('is_published', true)
        .order('sort_order');
      const lessons = (lessonData as Lesson[] | null) ?? [];
      lessonsMap[mod.id] = lessons;
      allLessonIds.push(...lessons.map((l) => l.id));
    }
    setLessonsByModule(lessonsMap);

    if (allLessonIds.length > 0) {
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', user.id)
        .in('lesson_id', allLessonIds);
      const progress: Record<string, boolean> = {};
      (progressData as LessonProgress[] | null)?.forEach((p) => {
        progress[p.lesson_id] = p.completed;
      });
      setProgressMap(progress);

      const { data: assignmentData } = await supabase
        .from('assignments')
        .select('*')
        .in('lesson_id', allLessonIds)
        .eq('is_published', true)
        .order('created_at', { ascending: true });
      const assignmentList = (assignmentData as Assignment[] | null) ?? [];

      const assignmentIds = assignmentList.map((a) => a.id);
      let submissionMap: Record<string, Submission> = {};
      if (assignmentIds.length > 0) {
        const { data: submissionData } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', user.id)
          .in('assignment_id', assignmentIds);
        (submissionData as Submission[] | null)?.forEach((s) => {
          submissionMap[s.assignment_id] = s;
        });
      }

      const byLesson: Record<string, AssignmentWithSubmission[]> = {};
      for (const a of assignmentList) {
        if (!a.lesson_id) continue;
        if (!byLesson[a.lesson_id]) byLesson[a.lesson_id] = [];
        byLesson[a.lesson_id].push({ assignment: a, submission: submissionMap[a.id] ?? null });
      }
      setAssignmentsByLesson(byLesson);
    }

    setLoading(false);
  };

  const toggleLessonComplete = async (lessonId: string, completed: boolean) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('lesson_progress')
        .update({
          completed: !completed,
          completed_at: !completed ? new Date().toISOString() : null,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('lesson_progress').insert({
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      });
    }

    setProgressMap((prev) => ({ ...prev, [lessonId]: !completed }));
  };

  if (loading) return <LoadingPage message="Loading course..." />;

  if (!course) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardBody>
            <EmptyState
              icon={<BookOpen className="h-6 w-6" />}
              title="Course not found"
              description="This course may have been removed or is not yet published."
              action={
                <Button onClick={() => navigate('/learn')}>
                  <ArrowLeft className="h-4 w-4" /> Back to courses
                </Button>
              }
            />
          </CardBody>
        </Card>
      </div>
    );
  }

  const totalLessons = Object.values(lessonsByModule).reduce((sum, ls) => sum + ls.length, 0);
  const completedCount = Object.values(progressMap).filter(Boolean).length;
  const percentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
  const orderedLessons = modules.flatMap((mod) => lessonsByModule[mod.id] ?? []);
  const nextLesson = selectedLesson
    ? orderedLessons[orderedLessons.findIndex((lesson) => lesson.id === selectedLesson.id) + 1] ?? null
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button
        onClick={() => navigate('/learn')}
        className="flex items-center gap-2 text-sm text-muted-500 hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </button>

      <div>
        <h1 className="text-2xl font-bold text-navy-900">{course.title}</h1>
        <p className="mt-1 text-sm text-muted-500">{course.description}</p>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-500">Course Progress</span>
            <span className="text-xs font-semibold text-navy-700">{Math.round(percentage)}%</span>
          </div>
          <ProgressBar value={percentage} size="md" />
        </div>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<BookOpen className="h-6 w-6" />}
              title="No modules yet"
              description="This course doesn't have any published modules yet."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((mod) => {
            const lessons = lessonsByModule[mod.id] ?? [];
            return (
              <Card key={mod.id}>
                <CardHeader>
                  <CardTitle>{mod.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-500">{mod.description}</p>
                </CardHeader>
                <CardBody>
                  {lessons.length === 0 ? (
                    <p className="text-sm text-muted-400">No lessons in this module yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {lessons.map((lesson) => {
                        const isCompleted = progressMap[lesson.id] ?? false;
                        const lessonAssignments = assignmentsByLesson[lesson.id] ?? [];
                        return (
                          <div key={lesson.id} className="rounded-lg border border-muted-200 overflow-hidden">
                            <div className="flex items-center justify-between p-3 transition-all hover:border-navy-300">
                              <button
                                onClick={() => setSelectedLesson(lesson)}
                                className="flex flex-1 items-center gap-3 text-left"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success-600" />
                                ) : (
                                  <PlayCircle className="h-5 w-5 flex-shrink-0 text-navy-400" />
                                )}
                                <div>
                                  <p className={`text-sm font-medium ${isCompleted ? 'text-muted-500' : 'text-navy-900'}`}>
                                    {lesson.title}
                                  </p>
                                  {lesson.duration_minutes > 0 && (
                                    <p className="text-xs text-muted-400 flex items-center gap-1 mt-0.5">
                                      <Clock className="h-3 w-3" />
                                      {lesson.duration_minutes} min
                                    </p>
                                  )}
                                </div>
                              </button>
                              <button
                                onClick={() => toggleLessonComplete(lesson.id, isCompleted)}
                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-navy-600 transition-colors hover:bg-navy-50"
                              >
                                {isCompleted ? 'Mark incomplete' : 'Mark complete'}
                              </button>
                            </div>

                            {lessonAssignments.length > 0 && (
                              <div className="border-t border-muted-100 bg-muted-50/50 px-3 py-2.5 space-y-2">
                                {lessonAssignments.map(({ assignment, submission }) => (
                                  <InlineAssignmentRow
                                    key={assignment.id}
                                    assignment={assignment}
                                    submission={submission}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {selectedLesson && (
        <LessonModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          isCompleted={progressMap[selectedLesson.id] ?? false}
          nextLesson={nextLesson}
          onToggleComplete={() => {
            if (!user) return;
            void toggleLessonComplete(selectedLesson.id, progressMap[selectedLesson.id] ?? false);
          }}
          onNextLesson={() => {
            if (nextLesson) setSelectedLesson(nextLesson);
          }}
        />
      )}
    </div>
  );
}

function assignmentStatusBadge(assignment: Assignment, submission: Submission | null) {
  if (submission?.status === 'graded') {
    return <Badge variant="success"><Award className="mr-1 h-3 w-3" /> Graded</Badge>;
  }
  if (submission?.status === 'submitted' || submission?.status === 'under_review') {
    return <Badge variant="neutral"><CheckCircle2 className="mr-1 h-3 w-3" /> Submitted</Badge>;
  }
  if (submission?.status === 'revision_requested') {
    return <Badge variant="warning"><ClipboardCheck className="mr-1 h-3 w-3" /> Revision needed</Badge>;
  }
  if (assignment.deadline && isOverdue(assignment.deadline)) {
    return <Badge variant="error"><Clock className="mr-1 h-3 w-3" /> Overdue</Badge>;
  }
  return <Badge variant="neutral"><FileText className="mr-1 h-3 w-3" /> Not started</Badge>;
}

function InlineAssignmentRow({
  assignment,
  submission,
}: {
  assignment: Assignment;
  submission: Submission | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border border-muted-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted-50"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-navy-100">
            <ClipboardCheck className="h-3.5 w-3.5 text-navy-700" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-navy-900 truncate">{assignment.title}</p>
            <div className="flex items-center gap-2 text-xs text-muted-400 mt-0.5">
              <span>{assignment.max_score} pts</span>
              {assignment.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due {formatDate(assignment.deadline)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {assignmentStatusBadge(assignment, submission)}
          {open ? <X className="h-3.5 w-3.5 text-muted-400" /> : <ArrowRight className="h-3.5 w-3.5 text-muted-400" />}
        </div>
      </button>

      {open && (
        <AssignmentSubmissionPanel
          assignment={assignment}
          submission={submission}
          onSubmitted={() => { /* state refresh handled at page level on next load */ }}
        />
      )}
    </div>
  );
}

function AssignmentSubmissionPanel({
  assignment,
  submission,
  onSubmitted,
}: {
  assignment: Assignment;
  submission: Submission | null;
  onSubmitted: () => void;
}) {
  const { user } = useAuth();
  const [textResponse, setTextResponse] = useState(submission?.text_response ?? '');
  const [externalLink, setExternalLink] = useState(submission?.external_link ?? '');
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const isGraded = submission?.status === 'graded';
  const isSubmitted = submission?.status === 'submitted' || submission?.status === 'under_review';
  const isLocked = isGraded || isSubmitted;

  const handleSave = async (status: 'in_progress' | 'submitted') => {
    if (!user) return;
    setSaving(true);
    setSavedMessage(null);

    const now = new Date().toISOString();
    const isLate = assignment.deadline ? isOverdue(assignment.deadline) : false;

    if (submission) {
      await supabase
        .from('submissions')
        .update({
          text_response: textResponse,
          external_link: externalLink,
          status,
          submitted_at: status === 'submitted' ? now : submission.submitted_at,
          is_late: status === 'submitted' ? isLate : submission.is_late,
        })
        .eq('id', submission.id);
    } else {
      await supabase.from('submissions').insert({
        user_id: user.id,
        assignment_id: assignment.id,
        text_response: textResponse,
        external_link: externalLink,
        status,
        submitted_at: status === 'submitted' ? now : null,
        is_late: status === 'submitted' ? isLate : false,
      });
    }

    setSaving(false);
    setSavedMessage(status === 'submitted' ? 'Assignment submitted successfully!' : 'Progress saved.');
    onSubmitted();
  };

  const fmt = assignment.submission_format;

  return (
    <div className="border-t border-muted-100 px-3 py-3 space-y-3">
      {assignment.instructions && (
        <div className="rounded-md bg-muted-50 px-3 py-2">
          <p className="text-xs font-semibold text-muted-500 mb-1">Instructions</p>
          <p className="text-sm text-muted-700 whitespace-pre-wrap">{assignment.instructions}</p>
        </div>
      )}

      {isGraded && submission && (
        <div className="rounded-md bg-success-50 border border-success-200 px-3 py-2">
          <p className="text-xs font-semibold text-success-700 mb-0.5">Graded</p>
          <p className="text-sm text-success-800">Your submission has been graded. Check My Submissions for feedback.</p>
        </div>
      )}

      {isSubmitted && !isGraded && (
        <div className="rounded-md bg-navy-50 border border-navy-200 px-3 py-2">
          <p className="text-sm text-navy-700">This assignment has been submitted and is awaiting review.</p>
        </div>
      )}

      {!isLocked && (
        <>
          {(fmt === 'text' || fmt === 'any') && (
            <div>
              <label className="text-xs font-semibold text-muted-500 mb-1 block">Written Response</label>
              <Textarea
                value={textResponse}
                onChange={(e) => setTextResponse(e.target.value)}
                placeholder="Type your response here..."
                className="min-h-[100px]"
              />
            </div>
          )}

          {(fmt === 'link' || fmt === 'any') && (
            <div>
              <label className="text-xs font-semibold text-muted-500 mb-1 block flex items-center gap-1">
                <LinkIcon className="h-3 w-3" /> External Link
              </label>
              <Input
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          {fmt === 'file' && (
            <div className="rounded-md border-2 border-dashed border-muted-200 px-4 py-6 text-center">
              <Upload className="h-6 w-6 text-muted-400 mx-auto mb-2" />
              <p className="text-sm text-muted-500">File upload will be available here.</p>
              <p className="text-xs text-muted-400 mt-1">
                Max {assignment.max_upload_size_mb}MB
                {assignment.allowed_file_types.length > 0 &&
                  ` · ${assignment.allowed_file_types.join(', ')}`}
              </p>
            </div>
          )}

          {savedMessage && (
            <p className="text-sm font-medium text-success-600">{savedMessage}</p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" variant="secondary" onClick={() => handleSave('in_progress')} disabled={saving}>
              Save Draft
            </Button>
            <Button size="sm" onClick={() => handleSave('submitted')} disabled={saving}>
              <Send className="h-3.5 w-3.5" /> Submit Assignment
            </Button>
          </div>
        </>
      )}

      {isLocked && (textResponse || externalLink) && (
        <div className="space-y-1.5">
          {textResponse && (
            <div>
              <p className="text-xs font-semibold text-muted-500 mb-0.5">Your Response</p>
              <p className="text-sm text-muted-700 whitespace-pre-wrap rounded-md bg-muted-50 px-3 py-2">{textResponse}</p>
            </div>
          )}
          {externalLink && (
            <div>
              <p className="text-xs font-semibold text-muted-500 mb-0.5">Your Link</p>
              <a href={externalLink} target="_blank" rel="noopener noreferrer" className="text-sm text-navy-600 hover:underline break-all">
                {externalLink}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuizPanel({ lessonId }: { lessonId: string }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [options, setOptions] = useState<Record<string, QuizAnswerOptionPublic[]>>({});
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; maxScore: number; passed: boolean } | null>(null);
  const [showRetake, setShowRetake] = useState(false);
  const [retakeMode, setRetakeMode] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!user) return;
      setLoading(true);
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('is_published', true)
        .maybeSingle();
      const currentQuiz = quizData as Quiz | null;
      setQuiz(currentQuiz);
      if (!currentQuiz) {
        setLoading(false);
        return;
      }

      const [{ data: questionData }, { data: attemptData }] = await Promise.all([
        supabase.from('quiz_questions').select('*').eq('quiz_id', currentQuiz.id).order('sort_order'),
        supabase.from('quiz_attempts').select('*').eq('quiz_id', currentQuiz.id).eq('user_id', user.id).order('attempt_number', { ascending: false }),
      ]);
      const questionList = (questionData as QuizQuestion[] | null) ?? [];
      setQuestions(questionList);
      setAttempts((attemptData as QuizAttempt[] | null) ?? []);

      if (questionList.length > 0) {
        const { data: optionData } = await supabase
          .from('quiz_answer_options_public')
          .select('*')
          .in('question_id', questionList.map((question) => question.id))
          .order('sort_order');
        const optionMap: Record<string, QuizAnswerOptionPublic[]> = {};
        ((optionData as QuizAnswerOptionPublic[] | null) ?? []).forEach((option) => {
          if (!optionMap[option.question_id]) optionMap[option.question_id] = [];
          optionMap[option.question_id].push(option);
        });
        setOptions(optionMap);
      }
      setLoading(false);
    };

    void loadQuiz();
  }, [lessonId, user]);

  const toggleAnswer = (question: QuizQuestion, optionId: string) => {
    setAnswers((current) => {
      const selected = current[question.id] ?? [];
      if (question.question_type === 'multiple') {
        return {
          ...current,
          [question.id]: selected.includes(optionId)
            ? selected.filter((id) => id !== optionId)
            : [...selected, optionId],
        };
      }
      return { ...current, [question.id]: [optionId] };
    });
  };

  const submitQuiz = async () => {
    if (!quiz || questions.some((question) => (answers[question.id] ?? []).length === 0)) return;
    setSubmitting(true);
    setSubmitError(null);
    setRetakeMode(false);
    const { data, error } = await supabase.rpc('submit_quiz_attempt', {
      p_quiz_id: quiz.id,
      p_answers: questions.map((question) => ({
        question_id: question.id,
        selected_option_ids: answers[question.id] ?? [],
      })),
    });
    if (!error && data?.[0]) {
      const attemptResult = {
        score: data[0].score,
        maxScore: data[0].max_score,
        passed: data[0].passed,
      };
      setResult(attemptResult);
      const { data: updatedAttempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quiz.id)
        .eq('user_id', user?.id)
        .order('attempt_number', { ascending: false });
      setAttempts((updatedAttempts as QuizAttempt[] | null) ?? []);
      const remainingAfter = Math.max(0, quiz.max_attempts - (updatedAttempts?.length ?? attempts.length + 1));
      if (!attemptResult.passed && remainingAfter > 0) {
        setShowRetake(true);
      }
    } else {
      setSubmitError('The quiz could not be submitted. Please try again.');
    }
    setSubmitting(false);
  };

  if (loading || !quiz) return null;

  const completedAttempt = attempts.find((attempt) => attempt.status === 'completed');
  const latestResult = retakeMode ? null : (result ?? (completedAttempt && completedAttempt.score !== null
    ? { score: completedAttempt.score, maxScore: completedAttempt.max_score, passed: completedAttempt.passed }
    : null));
  const attemptsRemaining = Math.max(0, quiz.max_attempts - attempts.length);
  const hasAnsweredEverything = questions.every((question) => (answers[question.id] ?? []).length > 0);
  const scorePercentage = latestResult && latestResult.maxScore > 0
    ? Math.round((latestResult.score / latestResult.maxScore) * 100)
    : 0;
  const canRetake = !latestResult?.passed && attemptsRemaining > 0;

  const startRetake = () => {
    setAnswers({});
    setResult(null);
    setShowRetake(false);
    setRetakeMode(true);
  };

  return (
    <div className="rounded-xl border border-navy-200 bg-navy-50/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-navy-700" />
            <h3 className="font-semibold text-navy-900">{quiz.title}</h3>
          </div>
          <p className="mt-1 text-sm text-muted-600">{quiz.description}</p>
        </div>
        <Badge variant={latestResult?.passed ? 'success' : 'neutral'}>
          {latestResult ? `${latestResult.score}/${latestResult.maxScore}` : `${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} left`}
        </Badge>
      </div>

      {latestResult ? (
        <div className="mt-4 space-y-3">
          <div className={`rounded-lg border px-3 py-3 ${latestResult.passed ? 'border-success-200 bg-success-50' : 'border-error-200 bg-error-50'}`}>
            <p className={`font-semibold ${latestResult.passed ? 'text-success-700' : 'text-error-700'}`}>
              {latestResult.passed ? 'Quiz passed' : 'You did not pass this time'}
            </p>
            <p className="mt-1 text-sm text-muted-600">
              You scored {latestResult.score} out of {latestResult.maxScore} points ({scorePercentage}%). The passing score is {quiz.passing_score}%.
            </p>
          </div>
          {canRetake && showRetake && (
            <div className="rounded-lg border border-navy-200 bg-navy-50 px-3 py-3">
              <p className="text-sm text-navy-700">
                You have {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining. Review the lesson and try again when you're ready.
              </p>
              <div className="mt-3">
                <Button size="sm" onClick={startRetake}>
                  Retake Quiz
                </Button>
              </div>
            </div>
          )}
          {!latestResult.passed && !canRetake && (
            <div className="rounded-lg border border-warning-200 bg-warning-50 px-3 py-3">
              <p className="text-sm text-warning-700">
                You've used all {quiz.max_attempts} attempts. Review the lesson content and reach out to your instructor if you need help.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {questions.map((question, index) => (
            <fieldset key={question.id} className="rounded-lg border border-muted-200 bg-white p-3">
              <legend className="px-1 text-sm font-medium text-navy-900">{index + 1}. {question.question_text}</legend>
              <div className="mt-2 space-y-2">
                {(options[question.id] ?? []).map((option) => {
                  const selected = (answers[question.id] ?? []).includes(option.id);
                  return (
                    <label key={option.id} className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${selected ? 'border-navy-400 bg-navy-50 text-navy-900' : 'border-muted-200 text-muted-600 hover:border-navy-200'}`}>
                      <input
                        type={question.question_type === 'multiple' ? 'checkbox' : 'radio'}
                        name={question.id}
                        checked={selected}
                        onChange={() => toggleAnswer(question, option.id)}
                        className="mt-0.5 accent-navy-700"
                      />
                      <span>{option.option_text}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
          {submitError && <p className="text-sm font-medium text-error-600" role="alert">{submitError}</p>}
          <Button onClick={() => void submitQuiz()} loading={submitting} disabled={!hasAnsweredEverything || attemptsRemaining === 0}>
            Submit Quiz
          </Button>
        </div>
      )}
    </div>
  );
}

function LessonModal({
  lesson,
  onClose,
  isCompleted,
  nextLesson,
  onToggleComplete,
  onNextLesson,
}: {
  lesson: Lesson;
  onClose: () => void;
  isCompleted: boolean;
  nextLesson: Lesson | null;
  onToggleComplete: () => void;
  onNextLesson: () => void;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullscreen ? '' : 'p-4'}`}>
      <div
        className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative z-10 w-full overflow-hidden bg-white shadow-elevated animate-slide-up ${isFullscreen ? 'h-full max-h-full rounded-none' : 'max-w-3xl max-h-[90vh] rounded-xl'}`}>
        <div className="border-b border-muted-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy-900">{lesson.title}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullscreen((current) => !current)}
              className="rounded-lg p-1.5 text-muted-400 hover:bg-muted-100 hover:text-navy-700"
              aria-label={isFullscreen ? 'Exit full screen' : 'Make lesson window full screen'}
              title={isFullscreen ? 'Exit full screen' : 'Full screen'}
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-400 hover:bg-muted-100"
              aria-label="Close lesson"
              title="Close lesson"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className={`overflow-y-auto px-6 py-4 space-y-4 ${isFullscreen ? 'h-[calc(100%-73px)]' : 'max-h-[70vh]'}`}>
          {lesson.video_url ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-navy-900">
              <VideoPlayer url={lesson.video_url} />
            </div>
          ) : (
            <div className="aspect-video rounded-lg bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center">
              <PlayCircle className="h-12 w-12 text-white/30" />
            </div>
          )}

          {lesson.description && (
            <p className="text-sm text-muted-600">{lesson.description}</p>
          )}

          {lesson.learning_objectives.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-navy-900 mb-2">Learning Objectives</h4>
              <ul className="space-y-1.5">
                {lesson.learning_objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-600">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-success-500" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lesson.text_content && (
            <div>
              <h4 className="text-sm font-semibold text-navy-900 mb-2">Lesson Content</h4>
              <div className="prose prose-sm max-w-none text-muted-600 whitespace-pre-wrap">
                {lesson.text_content}
              </div>
            </div>
          )}

          <QuizPanel lessonId={lesson.id} />

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-muted-200">
            <Button variant="secondary" onClick={onClose}>Close Lesson</Button>
            {!isCompleted ? (
              <Button onClick={onToggleComplete}>Finish Lesson</Button>
            ) : nextLesson ? (
              <Button onClick={onNextLesson}>Next Video <ArrowRight className="h-4 w-4" /></Button>
            ) : (
              <Button onClick={onClose}>Finish Course</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
