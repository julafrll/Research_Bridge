import { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Activity,
  ClipboardCheck,
  GraduationCap,
  TrendingUp,
  Clock,
  Award,
  Eye,
  AlertCircle,
  BarChart3,
  FileText,
  Inbox,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardBody, CardHeader, CardTitle, Badge, ProgressBar, EmptyState, LoadingPage } from '@/components/ui';
import { formatDate, formatRelativeTime, initials } from '@/lib/utils';
import type { Profile, QuizAttempt, Submission, LessonProgress } from '@/types';

interface VisitorRow {
  id: string;
  full_name: string;
  bio: string;
  created_at: string;
  lastActive: string | null;
  lessonsCompleted: number;
  quizAttempts: number;
  submissionsCount: number;
}

interface FeatureUsage {
  label: string;
  count: number;
  icon: typeof FileText;
}

interface QuizResultRow {
  id: string;
  quizTitle: string;
  userName: string;
  score: number;
  maxScore: number;
  passed: boolean;
  attemptNumber: number;
  completedAt: string | null;
}

interface SubmissionResultRow {
  id: string;
  assignmentTitle: string;
  userName: string;
  status: string;
  submittedAt: string | null;
  isLate: boolean;
}

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [visitorRows, setVisitorRows] = useState<VisitorRow[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResultRow[]>([]);
  const [submissionResults, setSubmissionResults] = useState<SubmissionResultRow[]>([]);
  const [quizTitles, setQuizTitles] = useState<Record<string, string>>({});
  const [assignmentTitles, setAssignmentTitles] = useState<Record<string, string>>({});
  const [profileMap, setProfileMap] = useState<Record<string, Profile>>({});
  const [visitorFilter, setVisitorFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [visibleVisitors, setVisibleVisitors] = useState(10);

  useEffect(() => {
    void loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);

    const [profilesRes, progressRes, quizRes, subsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('lesson_progress').select('*').order('updated_at', { ascending: false }),
      supabase.from('quiz_attempts').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('submissions').select('*').order('updated_at', { ascending: false }).limit(200),
    ]);

    const profileList = (profilesRes.data as Profile[] | null) ?? [];
    const progressList = (progressRes.data as LessonProgress[] | null) ?? [];
    const attemptList = (quizRes.data as QuizAttempt[] | null) ?? [];
    const subList = (subsRes.data as Submission[] | null) ?? [];

    setProfiles(profileList);
    setProgress(progressList);
    setQuizAttempts(attemptList);
    setSubmissions(subList);

    const profileById: Record<string, Profile> = {};
    profileList.forEach((p) => { profileById[p.id] = p; });
    setProfileMap(profileById);

    const lastActiveByUser: Record<string, string> = {};
    const completedByUser: Record<string, number> = {};
    progressList.forEach((p) => {
      if (p.updated_at > (lastActiveByUser[p.user_id] ?? '')) lastActiveByUser[p.user_id] = p.updated_at;
      if (p.completed) completedByUser[p.user_id] = (completedByUser[p.user_id] ?? 0) + 1;
    });

    const quizAttemptsByUser: Record<string, number> = {};
    attemptList.forEach((a) => { quizAttemptsByUser[a.user_id] = (quizAttemptsByUser[a.user_id] ?? 0) + 1; });

    const subsByUser: Record<string, number> = {};
    subList.forEach((s) => { subsByUser[s.user_id] = (subsByUser[s.user_id] ?? 0) + 1; });

    setVisitorRows(profileList.map((p) => ({
      id: p.id,
      full_name: p.full_name,
      bio: p.bio,
      created_at: p.created_at,
      lastActive: lastActiveByUser[p.id] ?? null,
      lessonsCompleted: completedByUser[p.id] ?? 0,
      quizAttempts: quizAttemptsByUser[p.id] ?? 0,
      submissionsCount: subsByUser[p.id] ?? 0,
    })).sort((a, b) => (b.lastActive ?? '').localeCompare(a.lastActive ?? '')));

    const quizIds = Array.from(new Set(attemptList.map((a) => a.quiz_id)));
    const assignmentIds = Array.from(new Set(subList.map((s) => s.assignment_id)));
    const [quizzesRes, assignmentsRes] = await Promise.all([
      quizIds.length
        ? supabase.from('quizzes').select('id, title').in('id', quizIds)
        : Promise.resolve<{ data: { id: string; title: string }[] | null }>({ data: null }),
      assignmentIds.length
        ? supabase.from('assignments').select('id, title').in('id', assignmentIds)
        : Promise.resolve<{ data: { id: string; title: string }[] | null }>({ data: null }),
    ]);

    const qTitles: Record<string, string> = {};
    ((quizzesRes.data as { id: string; title: string }[] | null) ?? []).forEach((q) => { qTitles[q.id] = q.title; });
    setQuizTitles(qTitles);

    const aTitles: Record<string, string> = {};
    ((assignmentsRes.data as { id: string; title: string }[] | null) ?? []).forEach((a) => { aTitles[a.id] = a.title; });
    setAssignmentTitles(aTitles);

    setQuizResults(attemptList.slice(0, 12).map((a) => ({
      id: a.id,
      quizTitle: qTitles[a.quiz_id] ?? 'Quiz',
      userName: profileById[a.user_id]?.full_name ?? 'Unknown student',
      score: a.score ?? 0,
      maxScore: a.max_score,
      passed: a.passed,
      attemptNumber: a.attempt_number,
      completedAt: a.completed_at,
    })));

    setSubmissionResults(subList.slice(0, 12).map((s) => ({
      id: s.id,
      assignmentTitle: aTitles[s.assignment_id] ?? 'Assignment',
      userName: profileById[s.user_id]?.full_name ?? 'Unknown student',
      status: s.status,
      submittedAt: s.submitted_at,
      isLate: s.is_late,
    })));

    setLoading(false);
  };

  const featureUsage: FeatureUsage[] = useMemo(() => {
    const completedLessons = progress.filter((p) => p.completed).length;
    const quizSubmissions = quizAttempts.filter((a) => a.status === 'completed').length;
    const assignmentSubs = submissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length;
    const draftSubs = submissions.filter((s) => s.status === 'in_progress').length;

    return [
      { label: 'Lessons Completed', count: completedLessons, icon: GraduationCap },
      { label: 'Quiz Submissions', count: quizSubmissions, icon: ClipboardCheck },
      { label: 'Assignment Submissions', count: assignmentSubs, icon: FileText },
      { label: 'Drafts Saved', count: draftSubs, icon: Inbox },
    ].sort((a, b) => b.count - a.count);
  }, [progress, quizAttempts, submissions]);

  const quizPassRate = useMemo(() => {
    const completed = quizAttempts.filter((a) => a.status === 'completed');
    if (completed.length === 0) return 0;
    return Math.round((completed.filter((a) => a.passed).length / completed.length) * 100);
  }, [quizAttempts]);

  const avgQuizScore = useMemo(() => {
    const completed = quizAttempts.filter((a) => a.status === 'completed' && a.score !== null);
    if (completed.length === 0) return 0;
    const totalPct = completed.reduce((sum, a) => sum + (a.max_score > 0 ? (a.score! / a.max_score) * 100 : 0), 0);
    return Math.round(totalPct / completed.length);
  }, [quizAttempts]);

  const gradedSubs = useMemo(
    () => submissions.filter((s) => s.status === 'graded').length,
    [submissions],
  );

  const pendingSubs = useMemo(
    () => submissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length,
    [submissions],
  );

  const filteredVisitors = useMemo(() => {
    if (visitorFilter === 'all') return visitorRows;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return visitorRows.filter((v) => {
      const active = v.lastActive && new Date(v.lastActive).getTime() >= thirtyDaysAgo;
      return visitorFilter === 'active' ? active : !active;
    });
  }, [visitorRows, visitorFilter]);

  if (loading) return <LoadingPage message="Loading analytics..." />;

  const totalActivity = featureUsage.reduce((sum, f) => sum + f.count, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Analytics</h1>
        <p className="mt-1 text-sm text-muted-500">
          Platform activity, student engagement, quiz and assignment results.
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Registered Users"
          value={profiles.length}
          icon={Users}
          color="bg-navy-100 text-navy-700"
        />
        <MetricCard
          label="Active (30 days)"
          value={visitorRows.filter((v) => {
            const t = v.lastActive ? new Date(v.lastActive).getTime() : 0;
            return t >= Date.now() - 30 * 24 * 60 * 60 * 1000;
          }).length}
          icon={Activity}
          color="bg-success-100 text-success-600"
        />
        <MetricCard
          label="Quiz Pass Rate"
          value={`${quizPassRate}%`}
          icon={Award}
          color="bg-blue-100 text-blue-600"
        />
        <MetricCard
          label="Avg Quiz Score"
          value={`${avgQuizScore}%`}
          icon={TrendingUp}
          color="bg-warning-100 text-warning-600"
        />
      </div>

      {/* Feature usage */}
      <Card>
        <CardHeader>
          <CardTitle>Most Used Features</CardTitle>
        </CardHeader>
        <CardBody>
          {totalActivity === 0 ? (
            <EmptyState
              icon={<BarChart3 className="h-6 w-6" />}
              title="No activity yet"
              description="Once students start completing lessons, quizzes, and assignments, the most used features will appear here."
            />
          ) : (
            <div className="space-y-4">
              {featureUsage.map((feature) => {
                const pct = totalActivity > 0 ? (feature.count / totalActivity) * 100 : 0;
                return (
                  <div key={feature.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <feature.icon className="h-4 w-4 text-navy-600" />
                        <span className="text-sm font-medium text-navy-900">{feature.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-navy-700">{feature.count}</span>
                    </div>
                    <ProgressBar value={pct} size="sm" />
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Visitor activity */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Who Visited The Platform</CardTitle>
            <div className="flex gap-1 rounded-lg bg-muted-100 p-1">
              {(['all', 'active', 'inactive'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => { setVisitorFilter(filter); setVisibleVisitors(10); }}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                    visitorFilter === filter ? 'bg-white text-navy-900 shadow-sm' : 'text-muted-500 hover:text-navy-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {filteredVisitors.length === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No users found"
              description={visitorFilter === 'all' ? "Users will appear here once they register." : `No ${visitorFilter} users at the moment.`}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted-200 text-left text-xs text-muted-500">
                    <th className="pb-2 font-medium">User</th>
                    <th className="pb-2 font-medium">Lessons</th>
                    <th className="pb-2 font-medium">Quizzes</th>
                    <th className="pb-2 font-medium">Submissions</th>
                    <th className="pb-2 font-medium">Last Active</th>
                    <th className="pb-2 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitors.slice(0, visibleVisitors).map((visitor) => (
                    <tr key={visitor.id} className="border-b border-muted-100 last:border-0 hover:bg-muted-50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-xs font-medium text-navy-700">
                            {initials(visitor.full_name || 'User')}
                          </div>
                          <div>
                            <p className="font-medium text-navy-900">{visitor.full_name || 'Unnamed user'}</p>
                            <p className="text-xs text-muted-400 truncate max-w-[200px]">{visitor.bio || 'No bio'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-muted-600">{visitor.lessonsCompleted}</td>
                      <td className="py-3 text-muted-600">{visitor.quizAttempts}</td>
                      <td className="py-3 text-muted-600">{visitor.submissionsCount}</td>
                      <td className="py-3 text-muted-500">
                        {visitor.lastActive ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(visitor.lastActive)}
                          </span>
                        ) : (
                          <span className="text-muted-400">Never</span>
                        )}
                      </td>
                      <td className="py-3 text-muted-500">{formatDate(visitor.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visibleVisitors < filteredVisitors.length && (
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={() => setVisibleVisitors((c) => c + 10)}
                    className="flex items-center gap-1.5 rounded-lg border border-muted-200 px-3 py-1.5 text-xs font-medium text-navy-600 transition-colors hover:bg-muted-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Show more ({filteredVisitors.length - visibleVisitors} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quiz + Assignment results side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Quiz Results</CardTitle>
          </CardHeader>
          <CardBody>
            {quizResults.length === 0 ? (
              <EmptyState
                icon={<ClipboardCheck className="h-6 w-6" />}
                title="No quiz attempts yet"
                description="Student quiz results will appear here once they start taking quizzes."
              />
            ) : (
              <div className="space-y-3">
                {quizResults.map((result) => {
                  const pct = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
                  return (
                    <div key={result.id} className="rounded-lg border border-muted-200 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-navy-900">{result.quizTitle}</p>
                          <p className="text-xs text-muted-500">{result.userName}</p>
                        </div>
                        <Badge variant={result.passed ? 'success' : 'error'}>
                          {pct}%
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-400">
                        <span>Attempt #{result.attemptNumber}</span>
                        <span>{result.completedAt ? formatRelativeTime(result.completedAt) : 'In progress'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Assignment Results</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-500">
                <span className="flex items-center gap-1"><Inbox className="h-3 w-3" /> {pendingSubs} pending</span>
                <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {gradedSubs} graded</span>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {submissionResults.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="No submissions yet"
                description="Assignment submissions will appear here once students start submitting work."
              />
            ) : (
              <div className="space-y-3">
                {submissionResults.map((result) => (
                  <div key={result.id} className="rounded-lg border border-muted-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy-900">{result.assignmentTitle}</p>
                        <p className="text-xs text-muted-500">{result.userName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={
                            result.status === 'graded' ? 'success' :
                            result.status === 'submitted' ? 'info' :
                            result.status === 'under_review' ? 'warning' :
                            result.status === 'revision_requested' ? 'error' :
                            'neutral'
                          }
                        >
                          {result.status.replace(/_/g, ' ')}
                        </Badge>
                        {result.isLate && (
                          <Badge variant="error">
                            <AlertCircle className="mr-1 h-3 w-3" /> Late
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-400">
                      {result.submittedAt ? formatRelativeTime(result.submittedAt) : 'Not submitted yet'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: typeof Users;
  color: string;
}) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-navy-900">{value}</p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
