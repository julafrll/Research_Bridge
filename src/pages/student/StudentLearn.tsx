import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  Clock,
  FileText,
  Microscope,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
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
} from '@/components/ui';
import type { Course, Module, Lesson, LessonProgress, Enrollment } from '@/types';

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
        <h1 className="text-2xl font-bold text-navy-900">Learn</h1>
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

export function StudentCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
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

    // Get progress for all lessons
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
                    <div className="space-y-2">
                      {lessons.map((lesson) => {
                        const isCompleted = progressMap[lesson.id] ?? false;
                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between rounded-lg border border-muted-200 p-3 transition-all hover:border-navy-300"
                          >
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

      {/* Lesson viewer modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm"
            onClick={() => setSelectedLesson(null)}
          />
          <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-elevated animate-slide-up">
            <div className="border-b border-muted-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-navy-900">{selectedLesson.title}</h2>
              <button
                onClick={() => setSelectedLesson(null)}
                className="rounded-lg p-1.5 text-muted-400 hover:bg-muted-100"
              >
                <ArrowLeft className="h-5 w-5 rotate-45" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-4">
              {selectedLesson.video_url ? (
                <div className="aspect-video rounded-lg overflow-hidden bg-navy-900">
                  <video src={selectedLesson.video_url} controls className="h-full w-full" />
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center">
                  <PlayCircle className="h-12 w-12 text-white/30" />
                </div>
              )}

              {selectedLesson.description && (
                <p className="text-sm text-muted-600">{selectedLesson.description}</p>
              )}

              {selectedLesson.learning_objectives.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-navy-900 mb-2">Learning Objectives</h4>
                  <ul className="space-y-1.5">
                    {selectedLesson.learning_objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-600">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-success-500" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedLesson.text_content && (
                <div>
                  <h4 className="text-sm font-semibold text-navy-900 mb-2">Lesson Content</h4>
                  <div className="prose prose-sm max-w-none text-muted-600 whitespace-pre-wrap">
                    {selectedLesson.text_content}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-muted-200">
                <Button
                  onClick={() => {
                    if (!user) return;
                    toggleLessonComplete(selectedLesson.id, progressMap[selectedLesson.id] ?? false);
                    setSelectedLesson(null);
                  }}
                >
                  {progressMap[selectedLesson.id] ? 'Mark as Incomplete' : 'Mark as Complete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
