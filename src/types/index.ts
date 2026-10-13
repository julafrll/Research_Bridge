export type UserRole = 'admin' | 'student';

export type AssignmentStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'revision_requested'
  | 'graded'
  | 'overdue';

export type SubmissionFormat = 'text' | 'file' | 'link' | 'any';
export type AssignmentType = 'instructor' | 'quiz';
export type QuizQuestionType = 'single' | 'multiple';
export type QuizAttemptStatus = 'in_progress' | 'completed';

export type NotificationType =
  | 'new_assignment'
  | 'upcoming_deadline'
  | 'new_lesson'
  | 'announcement'
  | 'grade_published'
  | 'feedback_published'
  | 'revision_requested';

export type ResearchCategory =
  | 'Research Methodology'
  | 'Academic Writing'
  | 'Research Questions'
  | 'Literature Reviews'
  | 'Research Ethics'
  | 'Citations and Referencing'
  | 'Data Collection and Analysis'
  | 'Research Tools'
  | 'Interesting Research Facts';

export type ResourceType = 'article' | 'fact_card' | 'link' | 'download';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  is_published: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  learning_objectives: string[];
  video_url: string | null;
  video_path: string | null;
  text_content: string;
  duration_minutes: number;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  passing_score: number;
  max_attempts: number;
  show_explanations: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: QuizQuestionType;
  points: number;
  explanation: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface QuizAnswerOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
  created_at: string;
}

export interface QuizAnswerOptionPublic {
  id: string;
  question_id: string;
  option_text: string;
  sort_order: number;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  status: QuizAttemptStatus;
  score: number | null;
  max_score: number;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizResponse {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_ids: string[];
  is_correct: boolean | null;
  points_earned: number | null;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
}

export interface Assignment {
  id: string;
  course_id: string | null;
  module_id: string | null;
  lesson_id: string | null;
  quiz_id: string | null;
  title: string;
  instructions: string;
  assignment_type: AssignmentType;
  deadline: string | null;
  max_score: number;
  submission_format: SubmissionFormat;
  allowed_file_types: string[];
  max_upload_size_mb: number;
  grading_rubric: string;
  allow_resubmission: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  status: AssignmentStatus;
  text_response: string;
  external_link: string;
  is_late: boolean;
  submitted_at: string | null;
  attempt_number: number;
  created_at: string;
  updated_at: string;
}

export interface SubmissionFile {
  id: string;
  submission_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface Grade {
  id: string;
  submission_id: string;
  score: number;
  feedback: string;
  is_published: boolean;
  graded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResearchResource {
  id: string;
  title: string;
  description: string;
  content: string;
  category: ResearchCategory;
  resource_type: ResourceType;
  external_link: string | null;
  file_path: string | null;
  image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  attachment_path: string | null;
  attachment_name: string | null;
  is_published: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}
