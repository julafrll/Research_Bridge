import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Clock,
  TrendingUp,
  Award,
  Megaphone,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardBody, CardHeader, CardTitle, ProgressBar, Badge, Button, EmptyState, LoadingPage } from '@/components/ui';
import { formatDate, daysUntil, isOverdue, formatRelativeTime } from '@/lib/utils';
import type { Course, Assignment, Announcement, LessonProgress, Lesson, Module, Enrollment } from '@/types';

export function StudentDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [availableAssignments, setAvailableAssignments] = useState<Assignment[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [recentGrades, setRecentGrades] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState<
    { course: Course; totalLessons: number; completedLessons: number; percentage: number }[]
  >([]);

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);

    // Get enrolled courses
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', user.id);

    const courseIds = (enrollments as Enrollment[] | null)?.map((e) => e.course_id) ?? [];

    let courses: Course[] = [];
    if (courseIds.length > 0) {
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds)
        .eq('is_published', true)
        .order('sort_order');
      courses = (courseData as Course[] | null) ?? [];
    }
    setEnrolledCourses(courses);

    // Get lesson progress for enrolled courses
    let totalCompleted = 0;
    let totalAllLessons = 0;
    const progressData: typeof courseProgress = [];

    for (const course of courses) {
      // Get modules for this course
      const { data: modules } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', course.id)
        .eq('is_published', true);

      const moduleIds = (modules as Module[] | null)?.map((m) => m.id) ?? [];

      let courseTotalLessons = 0;
      if (moduleIds.length > 0) {
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id')
          .in('module_id', moduleIds)
          .eq('is_published', true);
        courseTotalLessons = lessons?.length ?? 0;
      }
      totalAllLessons += courseTotalLessons;

      // Get completed lessons for this course's lessons
      let courseCompleted = 0;
      if (moduleIds.length > 0) {
        const { data: lessonIds } = await supabase
          .from('lessons')
          .select('id')
          .in('module_id', moduleIds)
          .eq('is_published', true);

        const lessonIdList = (lessonIds as Lesson[] | null)?.map((l) => l.id) ?? [];
        if (lessonIdList.length > 0) {
          const { data: progress } = await supabase
            .from('lesson_progress')
            .select('id')
            .eq('user_id', user.id)
            .eq('completed', true)
            .in('lesson_id', lessonIdList);
          courseCompleted = progress?.length ?? 0;
        }
      }
      totalCompleted += courseCompleted;

      const percentage = courseTotalLessons > 0 ? (courseCompleted / courseTotalLessons) * 100 : 0;
      progressData.push({ course, totalLessons: courseTotalLessons, completedLessons: courseCompleted, percentage });
    }

    setTotalLessons(totalAllLessons);
    setCompletedLessons(totalCompleted);
    setCourseProgress(progressData);

    // Get available assignments for enrolled courses
    if (courseIds.length > 0) {
      const { data: assignments } = await supabase
        .from('assignments')
        .select('*')
        .in('course_id', courseIds)
        .eq('is_published', true)
        .order('deadline', { ascending: true })
        .limit(5);
      setAvailableAssignments((assignments as Assignment[] | null) ?? []);
    }

    // Get recent announcements
    const { data: announcements } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_published', true)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(3);
    setRecentAnnouncements((announcements as Announcement[] | null) ?? []);

    // Get recent grades
    const { data: grades } = await supabase
      .from('grades')
      .select(`
        id,
        score,
        feedback,
        is_published,
        created_at,
        submission:submissions(
          id,
          assignment:assignments(title, max_score)
        )
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5);

    // Filter to only this user's grades (RLS handles this but we double check)
    setRecentGrades(grades ?? []);

    setLoading(false);
  };

  if (loading) return <LoadingPage message="Loading your dashboard..." />;

  const overallPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const upcomingAssignments = availableAssignments.filter(
    (a) => a.deadline && !isOverdue(a.deadline)
  );
  const overdueAssignments = availableAssignments.filter(
    (a) => a.deadline && isOverdue(a.deadline)
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}
        </h1>
        <p className="mt-1 text-sm text-muted-500">
          Here's an overview of your learning progress and upcoming work.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-500">Overall Progress</p>
                <p className="mt-1 text-2xl font-bold text-navy-900">
                  {Math.round(overallPercentage)}%
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100">
                <TrendingUp className="h-5 w-5 text-navy-700" />
              </div>
            </div>
            <ProgressBar value={overallPercentage} size="sm" className="mt-3" />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-500">Completed Lessons</p>
                <p className="mt-1 text-2xl font-bold text-navy-900">
                  {completedLessons}
                  <span className="text-sm font-normal text-muted-400"> / {totalLessons}</span>
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100">
                <CheckCircle2 className="h-5 w-5 text-success-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-500">Enrolled Courses</p>
                <p className="mt-1 text-2xl font-bold text-navy-900">{enrolledCourses.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100">
                <BookOpen className="h-5 w-5 text-navy-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-500">Open Assignments</p>
                <p className="mt-1 text-2xl font-bold text-navy-900">
                  {availableAssignments.length}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100">
                <FileText className="h-5 w-5 text-warning-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Continue Learning + Course Progress */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {courseProgress.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Continue Learning</CardTitle>
                  <Link to="/learn" className="text-xs font-medium text-navy-600 hover:text-navy-900">
                    View all courses
                  </Link>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                {courseProgress.slice(0, 3).map(({ course, totalLessons: tl, completedLessons: cl, percentage }) => (
                  <Link
                    key={course.id}
                    to={`/learn/${course.id}`}
                    className="block rounded-lg border border-muted-200 p-4 transition-all hover:border-navy-300 hover:bg-muted-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-navy-900">{course.title}</h4>
                        <p className="mt-0.5 text-xs text-muted-500">
                          {cl} of {tl} lessons completed
                        </p>
                      </div>
                      <span className="text-sm font-bold text-navy-700">{Math.round(percentage)}%</span>
                    </div>
                    <ProgressBar value={percentage} size="sm" className="mt-3" />
                  </Link>
                ))}
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody>
                <EmptyState
                  icon={<BookOpen className="h-6 w-6" />}
                  title="No courses yet"
                  description="Browse available courses and enroll to start your learning journey."
                  action={
                    <Button onClick={() => navigate('/learn')}>
                      Browse Courses
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  }
                />
              </CardBody>
            </Card>
          )}

          {/* Assignments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Assignments</CardTitle>
                <Link to="/assignments" className="text-xs font-medium text-navy-600 hover:text-navy-900">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              {availableAssignments.length === 0 ? (
                <EmptyState
                  icon={<FileText className="h-6 w-6" />}
                  title="No assignments yet"
                  description="Assignments will appear here once your instructor publishes them."
                />
              ) : (
                <div className="space-y-3">
                  {availableAssignments.slice(0, 4).map((assignment) => {
                    const overdue = assignment.deadline && isOverdue(assignment.deadline);
                    const days = assignment.deadline ? daysUntil(assignment.deadline) : null;
                    return (
                      <Link
                        key={assignment.id}
                        to="/assignments"
                        className="flex items-center justify-between rounded-lg border border-muted-200 p-3 transition-all hover:border-navy-300 hover:bg-muted-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            overdue ? 'bg-error-100' : 'bg-navy-100'
                          }`}>
                            <FileText className={`h-4 w-4 ${overdue ? 'text-error-600' : 'text-navy-700'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-navy-900">{assignment.title}</p>
                            <p className="text-xs text-muted-500">
                              Due {formatDate(assignment.deadline)}
                            </p>
                          </div>
                        </div>
                        {overdue ? (
                          <Badge variant="error">Overdue</Badge>
                        ) : days !== null && days <= 3 ? (
                          <Badge variant="warning">{days} day{days !== 1 ? 's' : ''} left</Badge>
                        ) : (
                          <Badge variant="neutral">{assignment.max_score} pts</Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent Announcements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Announcements</CardTitle>
                <Link to="/announcements" className="text-xs font-medium text-navy-600 hover:text-navy-900">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              {recentAnnouncements.length === 0 ? (
                <p className="text-sm text-muted-400">No announcements yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentAnnouncements.map((ann) => (
                    <div key={ann.id} className="border-b border-muted-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start gap-2">
                        <Megaphone className="mt-0.5 h-4 w-4 flex-shrink-0 text-navy-500" />
                        <div>
                          <p className="text-sm font-medium text-navy-900">{ann.title}</p>
                          <p className="mt-0.5 text-xs text-muted-400">
                            {formatRelativeTime(ann.published_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent Grades */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Grades</CardTitle>
                <Link to="/my-submissions" className="text-xs font-medium text-navy-600 hover:text-navy-900">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              {recentGrades.length === 0 ? (
                <EmptyState
                  icon={<Award className="h-6 w-6" />}
                  title="No grades yet"
                  description="Your grades and feedback will appear here once assignments are graded."
                />
              ) : (
                <div className="space-y-3">
                  {recentGrades.map((grade: any) => (
                    <div key={grade.id} className="border-b border-muted-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-navy-900">
                            {grade.submission?.assignment?.title || 'Assignment'}
                          </p>
                          <p className="text-xs text-muted-400">
                            {formatRelativeTime(grade.created_at)}
                          </p>
                        </div>
                        <Badge variant="success">
                          {grade.score}/{grade.submission?.assignment?.max_score || 100}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
