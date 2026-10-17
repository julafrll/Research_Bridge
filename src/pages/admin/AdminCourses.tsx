import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  BookOpen,
  FolderOpen,
  FileVideo,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  GripVertical,
  ArrowLeft,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Badge,
  Modal,
  EmptyState,
  LoadingPage,
  ConfirmDialog,
} from '@/components/ui';
import type { Course, Module, Lesson } from '@/types';

type View = 'list' | 'detail';

export function AdminCourses() {
  const [view, setView] = useState<View>('list');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Modal states
  const [courseModal, setCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [moduleModal, setModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [lessonModal, setLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [parentModuleId, setParentModuleId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    { type: 'course' | 'module' | 'lesson'; id: string; title: string } | null
  >();

  // Form states
  const [courseForm, setCourseForm] = useState({ title: '', description: '' });
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    text_content: '',
    video_url: '',
    duration_minutes: 0,
    learning_objectives: '',
  });
  const [saving, setSaving] = useState(false);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('sort_order');
    setCourses((data as Course[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const loadCourseDetail = async (course: Course) => {
    setSelectedCourse(course);
    setView('detail');
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  // Course CRUD
  const openCreateCourse = () => {
    setEditingCourse(null);
    setCourseForm({ title: '', description: '' });
    setCourseModal(true);
  };

  const openEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({ title: course.title, description: course.description });
    setCourseModal(true);
  };

  const saveCourse = async () => {
    if (!courseForm.title.trim()) return;
    setSaving(true);

    if (editingCourse) {
      await supabase
        .from('courses')
        .update({ title: courseForm.title, description: courseForm.description })
        .eq('id', editingCourse.id);
    } else {
      const { data } = await supabase
        .from('courses')
        .insert({ title: courseForm.title, description: courseForm.description })
        .select()
        .single();
      if (data) {
        const newCourse = data as Course;
        setCourses((prev) => [...prev, newCourse]);
      }
    }

    setSaving(false);
    setCourseModal(false);
    await loadCourses();
  };

  const togglePublishCourse = async (course: Course) => {
    await supabase
      .from('courses')
      .update({ is_published: !course.is_published })
      .eq('id', course.id);
    await loadCourses();
  };

  // Module CRUD
  const openCreateModule = () => {
    setEditingModule(null);
    setModuleForm({ title: '', description: '' });
    setModuleModal(true);
  };

  const openEditModule = (mod: Module) => {
    setEditingModule(mod);
    setModuleForm({ title: mod.title, description: mod.description });
    setModuleModal(true);
  };

  const saveModule = async () => {
    if (!moduleForm.title.trim() || !selectedCourse) return;
    setSaving(true);

    if (editingModule) {
      await supabase
        .from('modules')
        .update({ title: moduleForm.title, description: moduleForm.description })
        .eq('id', editingModule.id);
    } else {
      await supabase
        .from('modules')
        .insert({
          course_id: selectedCourse.id,
          title: moduleForm.title,
          description: moduleForm.description,
        });
    }

    setSaving(false);
    setModuleModal(false);
    // Reload detail
    const { data: updated } = await supabase
      .from('courses')
      .select('*')
      .eq('id', selectedCourse.id)
      .single();
    if (updated) setSelectedCourse(updated as Course);
    await loadCourses();
  };

  // Lesson CRUD
  const openCreateLesson = (moduleId: string) => {
    setParentModuleId(moduleId);
    setEditingLesson(null);
    setLessonForm({
      title: '',
      description: '',
      text_content: '',
      video_url: '',
      duration_minutes: 0,
      learning_objectives: '',
    });
    setLessonModal(true);
  };

  const openEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setParentModuleId(lesson.module_id);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      text_content: lesson.text_content,
      video_url: lesson.video_url ?? '',
      duration_minutes: lesson.duration_minutes,
      learning_objectives: lesson.learning_objectives.join('\n'),
    });
    setLessonModal(true);
  };

  const saveLesson = async () => {
    if (!lessonForm.title.trim() || !parentModuleId) return;
    setSaving(true);

    const objectives = lessonForm.learning_objectives
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingLesson) {
      await supabase
        .from('lessons')
        .update({
          title: lessonForm.title,
          description: lessonForm.description,
          text_content: lessonForm.text_content,
          video_url: lessonForm.video_url.trim() || null,
          duration_minutes: lessonForm.duration_minutes,
          learning_objectives: objectives,
        })
        .eq('id', editingLesson.id);
    } else {
      await supabase
        .from('lessons')
        .insert({
          module_id: parentModuleId,
          title: lessonForm.title,
          description: lessonForm.description,
          text_content: lessonForm.text_content,
          video_url: lessonForm.video_url.trim() || null,
          duration_minutes: lessonForm.duration_minutes,
          learning_objectives: objectives,
        });
    }

    setSaving(false);
    setLessonModal(false);
    await loadCourses();
    if (selectedCourse) {
      const { data: updated } = await supabase
        .from('courses')
        .select('*')
        .eq('id', selectedCourse.id)
        .single();
      if (updated) setSelectedCourse(updated as Course);
    }
  };

  const togglePublishLesson = async (lesson: Lesson) => {
    await supabase
      .from('lessons')
      .update({ is_published: !lesson.is_published })
      .eq('id', lesson.id);
    await loadCourses();
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);

    if (deleteTarget.type === 'course') {
      await supabase.from('courses').delete().eq('id', deleteTarget.id);
      setView('list');
      setSelectedCourse(null);
    } else if (deleteTarget.type === 'module') {
      await supabase.from('modules').delete().eq('id', deleteTarget.id);
    } else if (deleteTarget.type === 'lesson') {
      await supabase.from('lessons').delete().eq('id', deleteTarget.id);
    }

    setSaving(false);
    setDeleteTarget(null);
    await loadCourses();
    if (selectedCourse) {
      const { data: updated } = await supabase
        .from('courses')
        .select('*')
        .eq('id', selectedCourse.id)
        .single();
      if (updated) setSelectedCourse(updated as Course);
    }
  };

  if (loading) return <LoadingPage message="Loading courses..." />;

  // Course detail view
  if (view === 'detail' && selectedCourse) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <button
          onClick={() => { setView('list'); setSelectedCourse(null); }}
          className="flex items-center gap-2 text-sm text-muted-500 hover:text-navy-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-navy-900">{selectedCourse.title}</h1>
              <Badge variant={selectedCourse.is_published ? 'success' : 'neutral'}>
                {selectedCourse.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-500">{selectedCourse.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => togglePublishCourse(selectedCourse)}>
              {selectedCourse.is_published ? (
                <><EyeOff className="h-3.5 w-3.5" /> Unpublish</>
              ) : (
                <><Eye className="h-3.5 w-3.5" /> Publish</>
              )}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => openEditCourse(selectedCourse)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteTarget({ type: 'course', id: selectedCourse.id, title: selectedCourse.title })}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy-900">Modules</h2>
          <Button size="sm" onClick={openCreateModule}>
            <Plus className="h-4 w-4" /> Add Module
          </Button>
        </div>

        <ModuleList
          courseId={selectedCourse.id}
          expandedModules={expandedModules}
          toggleModule={toggleModule}
          onEditModule={openEditModule}
          onDeleteModule={(m) => setDeleteTarget({ type: 'module', id: m.id, title: m.title })}
          onAddLesson={openCreateLesson}
          onEditLesson={openEditLesson}
          onDeleteLesson={(l) => setDeleteTarget({ type: 'lesson', id: l.id, title: l.title })}
          onTogglePublishLesson={togglePublishLesson}
        />

        {/* Course Modal */}
        <Modal
          open={courseModal}
          onClose={() => setCourseModal(false)}
          title={editingCourse ? 'Edit Course' : 'New Course'}
          footer={
            <>
              <Button variant="secondary" onClick={() => setCourseModal(false)}>Cancel</Button>
              <Button onClick={saveCourse} loading={saving}>Save</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Title"
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              placeholder="e.g. Introduction to Research Methods"
            />
            <Textarea
              label="Description"
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              placeholder="Brief description of the course..."
            />
          </div>
        </Modal>

        {/* Module Modal */}
        <Modal
          open={moduleModal}
          onClose={() => setModuleModal(false)}
          title={editingModule ? 'Edit Module' : 'New Module'}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModuleModal(false)}>Cancel</Button>
              <Button onClick={saveModule} loading={saving}>Save</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Title"
              value={moduleForm.title}
              onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
              placeholder="e.g. Foundations of Research"
            />
            <Textarea
              label="Description"
              value={moduleForm.description}
              onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
              placeholder="What this module covers..."
            />
          </div>
        </Modal>

        {/* Lesson Modal */}
        <Modal
          open={lessonModal}
          onClose={() => setLessonModal(false)}
          title={editingLesson ? 'Edit Lesson' : 'New Lesson'}
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setLessonModal(false)}>Cancel</Button>
              <Button onClick={saveLesson} loading={saving}>Save</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Title"
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              placeholder="e.g. Understanding Research Questions"
            />
            <Textarea
              label="Description"
              value={lessonForm.description}
              onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
              placeholder="Short summary of this lesson..."
            />
            <Input
              label="Video URL"
              value={lessonForm.video_url}
              onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
              placeholder="Paste a Google Drive share link or direct video URL..."
              hint="For Google Drive: open the file, click Share, copy the link. It must be set to 'Anyone with the link can view'."
            />
            <Textarea
              label="Text Content"
              value={lessonForm.text_content}
              onChange={(e) => setLessonForm({ ...lessonForm, text_content: e.target.value })}
              placeholder="Lesson reading material..."
              className="min-h-[150px]"
            />
            <Textarea
              label="Learning Objectives (one per line)"
              value={lessonForm.learning_objectives}
              onChange={(e) => setLessonForm({ ...lessonForm, learning_objectives: e.target.value })}
              placeholder="Understand the concept of research questions&#10;Identify different types of research questions"
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={lessonForm.duration_minutes}
              onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) || 0 })}
            />
          </div>
        </Modal>

        <ConfirmDialog
          open={!!deleteTarget}
          title={`Delete ${deleteTarget?.type}`}
          message={
            <span>
              Are you sure you want to delete <strong>{deleteTarget?.title}</strong>?
              {deleteTarget?.type === 'course' && ' This will also delete all modules and lessons within it.'}
              {deleteTarget?.type === 'module' && ' This will also delete all lessons within it.'}
              {' '}This action cannot be undone.
            </span>
          }
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    );
  }

  // Course list view
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Courses & Lessons</h1>
          <p className="mt-1 text-sm text-muted-500">
            Create and manage courses, modules, and lessons.
          </p>
        </div>
        <Button onClick={openCreateCourse}>
          <Plus className="h-4 w-4" /> New Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<BookOpen className="h-6 w-6" />}
              title="No courses yet"
              description="Create your first course to start building your curriculum."
              action={
                <Button onClick={openCreateCourse}>
                  <Plus className="h-4 w-4" /> Create Course
                </Button>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} hover onClick={() => loadCourseDetail(course)}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100">
                    <BookOpen className="h-5 w-5 text-navy-700" />
                  </div>
                  <Badge variant={course.is_published ? 'success' : 'neutral'}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <h3 className="mt-3 font-semibold text-navy-900">{course.title}</h3>
                <p className="mt-1 text-sm text-muted-500 line-clamp-2">{course.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Course create modal (for list view) */}
      <Modal
        open={courseModal}
        onClose={() => setCourseModal(false)}
        title={editingCourse ? 'Edit Course' : 'New Course'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCourseModal(false)}>Cancel</Button>
            <Button onClick={saveCourse} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={courseForm.title}
            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
            placeholder="e.g. Introduction to Research Methods"
          />
          <Textarea
            label="Description"
            value={courseForm.description}
            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            placeholder="Brief description of the course..."
          />
        </div>
      </Modal>
    </div>
  );
}

// Module list component
function ModuleList({
  courseId,
  expandedModules,
  toggleModule,
  onEditModule,
  onDeleteModule,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onTogglePublishLesson,
}: {
  courseId: string;
  expandedModules: Set<string>;
  toggleModule: (id: string) => void;
  onEditModule: (m: Module) => void;
  onDeleteModule: (m: Module) => void;
  onAddLesson: (moduleId: string) => void;
  onEditLesson: (l: Lesson) => void;
  onDeleteLesson: (l: Lesson) => void;
  onTogglePublishLesson: (l: Lesson) => void;
}) {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, [courseId]);

  const loadModules = async () => {
    setLoading(true);
    const { data: moduleData } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('sort_order');
    const moduleList = (moduleData as Module[] | null) ?? [];
    setModules(moduleList);

    // Load lessons for all modules
    const lessonsMap: Record<string, Lesson[]> = {};
    for (const mod of moduleList) {
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', mod.id)
        .order('sort_order');
      lessonsMap[mod.id] = (lessonData as Lesson[] | null) ?? [];
    }
    setLessons(lessonsMap);
    setLoading(false);
  };

  // Reload when modules change
  useEffect(() => {
    const interval = setInterval(loadModules, 2000);
    return () => clearInterval(interval);
  }, [courseId]);

  if (loading) return <LoadingPage message="Loading modules..." />;

  if (modules.length === 0) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={<FolderOpen className="h-6 w-6" />}
            title="No modules yet"
            description="Add modules to organize your course lessons."
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {modules.map((mod) => {
        const isExpanded = expandedModules.has(mod.id);
        const moduleLessons = lessons[mod.id] ?? [];
        return (
          <Card key={mod.id}>
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => toggleModule(mod.id)}
                className="flex flex-1 items-center gap-2 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-400" />
                )}
                <FolderOpen className="h-4 w-4 text-navy-600" />
                <span className="font-medium text-navy-900">{mod.title}</span>
                <Badge variant="neutral">{moduleLessons.length} lessons</Badge>
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditModule(mod)}
                  className="rounded-lg p-1.5 text-muted-400 hover:bg-muted-100 hover:text-navy-700"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDeleteModule(mod)}
                  className="rounded-lg p-1.5 text-muted-400 hover:bg-muted-100 hover:text-error-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-muted-200">
                {moduleLessons.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-muted-400">No lessons in this module yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-muted-100">
                    {moduleLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-muted-50"
                      >
                        <div className="flex items-center gap-3">
                          <FileVideo className="h-4 w-4 text-muted-400" />
                          <div>
                            <p className="text-sm font-medium text-navy-900">{lesson.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {lesson.duration_minutes > 0 && (
                                <span className="text-xs text-muted-400 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration_minutes} min
                                </span>
                              )}
                              <Badge variant={lesson.is_published ? 'success' : 'neutral'}>
                                {lesson.is_published ? 'Published' : 'Draft'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onTogglePublishLesson(lesson)}
                            className="rounded-lg p-1.5 text-muted-400 hover:bg-muted-100 hover:text-navy-700"
                            title={lesson.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {lesson.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => onEditLesson(lesson)}
                            className="rounded-lg p-1.5 text-muted-400 hover:bg-muted-100 hover:text-navy-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteLesson(lesson)}
                            className="rounded-lg p-1.5 text-muted-400 hover:bg-muted-100 hover:text-error-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t border-muted-100 px-4 py-2">
                  <Button variant="ghost" size="sm" onClick={() => onAddLesson(mod.id)}>
                    <Plus className="h-3.5 w-3.5" /> Add Lesson
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
