import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Eye, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardBody, CardHeader, CardTitle, Input, Badge, ProgressBar, Button, EmptyState, LoadingPage } from '@/components/ui';
import { formatDate, initials } from '@/lib/utils';
import type { Profile, Enrollment, LessonProgress } from '@/types';

interface StudentWithStats extends Profile {
  enrolledCourses: number;
  completedLessons: number;
  totalLessons: number;
  lastActive: string | null;
}

export function AdminStudents() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'recent' | 'progress'>('name');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);

    // Get all profiles (RLS allows admin to see all)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    const profileList = (profiles as Profile[] | null) ?? [];

    // For each profile, get stats
    const studentsWithStats: StudentWithStats[] = [];

    for (const profile of profileList) {
      // Enrolled courses count
      const { count: enrolledCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      // Completed lessons
      const { count: completedCount } = await supabase
        .from('lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('completed', true);

      // Total lessons available (published)
      const { count: totalLessonsCount } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Last active (most recent lesson_progress update)
      const { data: lastActive } = await supabase
        .from('lesson_progress')
        .select('updated_at')
        .eq('user_id', profile.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      studentsWithStats.push({
        ...profile,
        enrolledCourses: enrolledCount ?? 0,
        completedLessons: completedCount ?? 0,
        totalLessons: totalLessonsCount ?? 0,
        lastActive: lastActive?.updated_at ?? null,
      });
    }

    setStudents(studentsWithStats);
    setLoading(false);
  };

  const filteredStudents = useMemo(() => {
    let result = students.filter((s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (s as any).email?.toLowerCase().includes(search.toLowerCase())
    );

    if (sort === 'name') {
      result = [...result].sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else if (sort === 'recent') {
      result = [...result].sort((a, b) => {
        if (!a.lastActive) return 1;
        if (!b.lastActive) return -1;
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      });
    } else if (sort === 'progress') {
      result = [...result].sort((a, b) => {
        const aPct = a.totalLessons > 0 ? a.completedLessons / a.totalLessons : 0;
        const bPct = b.totalLessons > 0 ? b.completedLessons / b.totalLessons : 0;
        return bPct - aPct;
      });
    }

    return result;
  }, [students, search, sort]);

  if (loading) return <LoadingPage message="Loading students..." />;

  if (selectedStudent) {
    const percentage = selectedStudent.totalLessons > 0
      ? (selectedStudent.completedLessons / selectedStudent.totalLessons) * 100
      : 0;

    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          onClick={() => setSelectedStudent(null)}
          className="flex items-center gap-2 text-sm text-muted-500 hover:text-navy-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to students
        </button>

        <Card>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-100 text-xl font-semibold text-navy-700">
                {initials(selectedStudent.full_name)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-900">{selectedStudent.full_name}</h2>
                <p className="text-sm text-muted-500">
                  Joined {formatDate(selectedStudent.created_at)}
                </p>
                {selectedStudent.lastActive && (
                  <p className="text-xs text-muted-400 mt-1">
                    Last active: {formatDate(selectedStudent.lastActive)}
                  </p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardBody>
              <p className="text-xs text-muted-500">Enrolled Courses</p>
              <p className="mt-1 text-2xl font-bold text-navy-900">{selectedStudent.enrolledCourses}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-muted-500">Completed Lessons</p>
              <p className="mt-1 text-2xl font-bold text-navy-900">
                {selectedStudent.completedLessons}
                <span className="text-sm font-normal text-muted-400"> / {selectedStudent.totalLessons}</span>
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs text-muted-500">Overall Progress</p>
              <p className="mt-1 text-2xl font-bold text-navy-900">{Math.round(percentage)}%</p>
              <ProgressBar value={percentage} size="sm" className="mt-2" />
            </CardBody>
          </Card>
        </div>

        {selectedStudent.bio && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-muted-600">{selectedStudent.bio}</p>
            </CardBody>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Students</h1>
        <p className="mt-1 text-sm text-muted-500">
          View and manage all registered students.
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="input-field pl-9"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="input-field sm:w-48"
        >
          <option value="name">Sort: Name (A-Z)</option>
          <option value="recent">Sort: Most Recent</option>
          <option value="progress">Sort: Most Progress</option>
        </select>
      </div>

      {filteredStudents.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title={search ? "No students found" : "No students yet"}
              description={search ? "Try a different search term." : "Students will appear here once they register."}
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-muted-200 text-left text-xs text-muted-500">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Courses</th>
                  <th className="px-4 py-3 font-medium">Lessons</th>
                  <th className="px-4 py-3 font-medium">Progress</th>
                  <th className="px-4 py-3 font-medium">Last Active</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const percentage = student.totalLessons > 0
                    ? (student.completedLessons / student.totalLessons) * 100
                    : 0;
                  return (
                    <tr
                      key={student.id}
                      className="border-b border-muted-100 last:border-0 hover:bg-muted-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-xs font-medium text-navy-700">
                            {initials(student.full_name)}
                          </div>
                          <span className="font-medium text-navy-900">{student.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-600">{student.enrolledCourses}</td>
                      <td className="px-4 py-3 text-muted-600">
                        {student.completedLessons} / {student.totalLessons}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={percentage} size="sm" className="w-20" />
                          <span className="text-xs text-muted-500">{Math.round(percentage)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-500">
                        {formatDate(student.lastActive)}
                      </td>
                      <td className="px-4 py-3 text-muted-500">
                        {formatDate(student.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="rounded-lg p-1.5 text-muted-400 transition-colors hover:bg-muted-100 hover:text-navy-700"
                          title="View profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
