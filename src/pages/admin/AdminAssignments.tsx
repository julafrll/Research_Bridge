import { useEffect, useState } from 'react';
import { ClipboardCheck, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge, Button, Card, CardBody, EmptyState, Input, LoadingPage, Modal, Select, Textarea, ConfirmDialog } from '@/components/ui';
import type { Assignment, Course } from '@/types';

interface AssignmentForm {
  title: string;
  instructions: string;
  course_id: string;
  deadline: string;
  max_score: number;
  submission_format: 'text' | 'file' | 'link' | 'any';
}

const emptyForm: AssignmentForm = {
  title: '',
  instructions: '',
  course_id: '',
  deadline: '',
  max_score: 100,
  submission_format: 'text',
};

export function AdminAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);
  const [form, setForm] = useState<AssignmentForm>(emptyForm);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: assignmentData }, { data: courseData }] = await Promise.all([
      supabase.from('assignments').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('*').order('title'),
    ]);
    setAssignments((assignmentData as Assignment[] | null) ?? []);
    setCourses((courseData as Course[] | null) ?? []);
    setLoading(false);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const saveAssignment = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await supabase.from('assignments').insert({
      title: form.title.trim(),
      instructions: form.instructions.trim(),
      course_id: form.course_id || null,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      max_score: form.max_score,
      submission_format: form.submission_format,
    });
    setSaving(false);
    setModalOpen(false);
    await loadData();
  };

  const togglePublished = async (assignment: Assignment) => {
    await supabase.from('assignments').update({ is_published: !assignment.is_published }).eq('id', assignment.id);
    await loadData();
  };

  const deleteAssignment = async () => {
    if (!deleteTarget) return;
    await supabase.from('assignments').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    await loadData();
  };

  if (loading) return <LoadingPage message="Loading assignments..." />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Assignments</h1>
          <p className="mt-1 text-sm text-muted-500">Create coursework, set deadlines, and publish it to students.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New Assignment</Button>
      </div>

      {assignments.length === 0 ? (
        <Card><CardBody><EmptyState icon={<ClipboardCheck className="h-6 w-6" />} title="No assignments yet" description="Create your first assignment to start collecting student work." action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Create Assignment</Button>} /></CardBody></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => {
            const course = courses.find((item) => item.id === assignment.course_id);
            return (
              <Card key={assignment.id}>
                <CardBody>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100"><ClipboardCheck className="h-5 w-5 text-navy-700" /></div>
                    <Badge variant={assignment.is_published ? 'success' : 'neutral'}>{assignment.is_published ? 'Published' : 'Draft'}</Badge>
                  </div>
                  <h2 className="mt-4 font-semibold text-navy-900">{assignment.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-500">{assignment.instructions || 'No instructions added yet.'}</p>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-500">
                    <span>{course?.title || 'Unassigned course'}</span>
                    <span>{assignment.max_score} points</span>
                    <span>{assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'No deadline'}</span>
                  </div>
                  <div className="mt-5 flex items-center justify-end gap-2 border-t border-muted-100 pt-3">
                    <Button variant="ghost" size="sm" onClick={() => void togglePublished(assignment)}>{assignment.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{assignment.is_published ? 'Unpublish' : 'Publish'}</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(assignment)}><Trash2 className="h-3.5 w-3.5 text-error-600" /> Delete</Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Assignment" description="Add the brief students will see." footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={() => void saveAssignment()} loading={saving}>Save Assignment</Button></>}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Literature review outline" />
          <Textarea label="Instructions" value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} placeholder="Explain what students need to submit..." />
          <Select label="Course" value={form.course_id} onChange={(event) => setForm({ ...form, course_id: event.target.value })}><option value="">Select a course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</Select>
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Deadline" type="datetime-local" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /><Input label="Maximum score" type="number" min="1" value={form.max_score} onChange={(event) => setForm({ ...form, max_score: Number(event.target.value) || 1 })} /></div>
          <Select label="Submission format" value={form.submission_format} onChange={(event) => setForm({ ...form, submission_format: event.target.value as AssignmentForm['submission_format'] })}><option value="text">Written response</option><option value="file">File upload</option><option value="link">External link</option><option value="any">Any format</option></Select>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete assignment" message={<span>Delete <strong>{deleteTarget?.title}</strong>? Any student submissions for it will also be removed.</span>} confirmLabel="Delete" onConfirm={() => void deleteAssignment()} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
