import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  FileText,
  Inbox,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardBody, CardHeader, CardTitle, ProgressBar, Badge, LoadingPage, EmptyState } from '@/components/ui';
import { formatDate, isOverdue, formatRelativeTime } from '@/lib/utils';
import type { Profile, Course, Assignment, Submission } from '@/types';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  publishedCourses: number;
  totalLessons: number;
  totalAssignments: number;
  pendingSubmissions: number;
  overdueAssignments: number;
  overallCompletion: number;
}

interface RecentSubmissionRow {
  id: string;
  status: string;
  submitted_at: string | null;
  user: { full_name: string } | null;
  assignment: { title: string } | null;
}

export function AdminOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    publishedCourses: 0,
    totalLessons: 0,
    totalAssignments: 0,
    pendingSubmissions: 0,
    overdueAssignments: 0,
    overallCompletion: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmissionRow[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);

    // Total students (profiles where role is not admin — we check app_metadata via auth)
    // Since we can't easily filter by role from profiles, we count all profiles
    // and subtract admins. But we can't see admin flag from profiles table.
    // Instead, we'll count all profiles as potential students.
    const { count: totalStudents } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Active students (those with lesson progress in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { count: activeStudents } = await supabase
      .from('lesson_progress')
      .select('user_id', { count: 'exact', head: true })
      .gte('updated_at', thirtyDaysAgo.toISOString());

    // Published courses
    const { count: publishedCourses } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    // Total lessons (published)
    const { count: totalLessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    // Total assignments (published)
    const { count: totalAssignments } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    // Pending submissions (submitted status)
    const { count: pendingSubmissions } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted');

    // Overdue assignments (published assignments with past deadline)
    const { data: overdueData } = await supabase
      .from('assignments')
      .select('id')
      .eq('is_published', true)
      .lt('deadline', new Date().toISOString());

    // Overall completion
    const { count: totalProgress } = await supabase
      .from('lesson_progress')
      .select('*', { count: 'exact', head: true });

    const { count: completedProgress } = await supabase
      .from('lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('completed', true);

    // Recent submissions
    const { data: recentSubs } = await supabase
      .from('submissions')
      .select(`
        id,
        status,
        submitted_at,
        user:profiles(full_name),
        assignment:assignments(title)
      `)
      .order('updated_at', { ascending: false })
      .limit(8);

    setStats({
      totalStudents: totalStudents ?? 0,
      activeStudents: activeStudents ?? 0,
      publishedCourses: publishedCourses ?? 0,
      totalLessons: totalLessons ?? 0,
      totalAssignments: totalAssignments ?? 0,
      pendingSubmissions: pendingSubmissions ?? 0,
      overdueAssignments: overdueData?.length ?? 0,
      overallCompletion:
        totalProgress && totalProgress > 0
          ? Math.round(((completedProgress ?? 0) / totalProgress) * 100)
          : 0,
    });

    setRecentSubmissions((recentSubs as unknown as RecentSubmissionRow[]) ?? []);
    setLoading(false);
  };

  if (loading) return <LoadingPage message="Loading admin overview..." />;

  const statCards = [
    {
      label: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-navy-100 text-navy-700',
      link: '/admin/students',
    },
    {
      label: 'Active Students',
      value: stats.activeStudents,
      icon: TrendingUp,
      color: 'bg-success-100 text-success-600',
      link: '/admin/students',
    },
    {
      label: 'Published Courses',
      value: stats.publishedCourses,
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-600',
      link: '/admin/courses',
    },
    {
      label: 'Total Lessons',
      value: stats.totalLessons,
      icon: GraduationCap,
      color: 'bg-navy-100 text-navy-700',
      link: '/admin/courses',
    },
    {
      label: 'Total Assignments',
      value: stats.totalAssignments,
      icon: FileText,
      color: 'bg-warning-100 text-warning-600',
      link: '/admin/assignments',
    },
    {
      label: 'Pending Review',
      value: stats.pendingSubmissions,
      icon: Inbox,
      color: 'bg-error-100 text-error-600',
      link: '/admin/submissions',
    },
    {
      label: 'Overdue Assignments',
      value: stats.overdueAssignments,
      icon: AlertTriangle,
      color: 'bg-error-100 text-error-600',
      link: '/admin/assignments',
    },
    {
      label: 'Course Completion',
      value: `${stats.overallCompletion}%`,
      icon: TrendingUp,
      color: 'bg-success-100 text-success-600',
      link: '/admin/students',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Overview</h1>
        <p className="mt-1 text-sm text-muted-500">
          Platform statistics and recent activity.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            hover
            onClick={() => navigate(stat.link)}
          >
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-navy-900">{stat.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Recent submissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Submissions</CardTitle>
            <Link
              to="/admin/submissions"
              className="text-xs font-medium text-navy-600 hover:text-navy-900"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {recentSubmissions.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-6 w-6" />}
              title="No submissions yet"
              description="Student submissions will appear here once they start submitting assignments."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted-200 text-left text-xs text-muted-500">
                    <th className="pb-2 font-medium">Student</th>
                    <th className="pb-2 font-medium">Assignment</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-muted-100 last:border-0 cursor-pointer hover:bg-muted-50"
                      onClick={() => navigate('/admin/submissions')}
                    >
                      <td className="py-3 text-navy-900">
                        {sub.user?.full_name || 'Unknown'}
                      </td>
                      <td className="py-3 text-muted-600">
                        {sub.assignment?.title || 'Untitled'}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            sub.status === 'graded' ? 'success' :
                            sub.status === 'submitted' ? 'info' :
                            sub.status === 'under_review' ? 'warning' :
                            sub.status === 'revision_requested' ? 'error' :
                            'neutral'
                          }
                        >
                          {sub.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-500">
                        {formatRelativeTime(sub.submitted_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
