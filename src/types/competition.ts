import type { AwardKey } from '@/config/competition';

export type EntryStatus = 'draft' | 'submitted' | 'returned' | 'eligible' | 'ineligible';

export interface CompetitionEntry {
  id: string;
  user_id: string;
  submission_code: string;

  full_name: string;
  display_name: string;
  email: string;
  school: string;
  country: string;
  city: string;
  age_group: string;
  grade_level: string;

  project_title: string;
  category: string;
  is_collaborative: boolean;
  collaborators: string;
  abstract: string;

  paper_path: string | null;
  paper_name: string | null;
  poster_path: string | null;
  poster_name: string | null;
  video_url: string;

  contribution_confirmed: boolean;
  ai_disclosure: string;
  ethics_confirmed: boolean;
  public_display_consent: boolean;
  paper_public_consent: boolean;
  guardian_consent: boolean;

  status: EntryStatus;
  organizer_note: string;
  award: AwardKey | null;
  is_published: boolean;

  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Row of the public `competition_gallery` view. */
export interface GalleryProject {
  id: string;
  submission_code: string;
  author: string;
  collaborators: string;
  project_title: string;
  category: string;
  abstract: string;
  poster_path: string | null;
  paper_path: string | null;
  video_url: string;
  award: AwardKey | null;
  country: string;
}

export const ENTRY_STATUS: Record<
  EntryStatus,
  { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral'; help: string }
> = {
  draft: { label: 'Draft', variant: 'neutral', help: 'Not submitted yet. Complete every section and submit before the deadline.' },
  submitted: { label: 'Submitted', variant: 'info', help: 'Received. Organizers will check eligibility and completeness in Week 4.' },
  returned: { label: 'Returned for correction', variant: 'warning', help: 'Please fix the issues noted by the organizers and submit again.' },
  eligible: { label: 'Eligible — in judging', variant: 'success', help: 'Your project passed the quality check and is with the judges.' },
  ineligible: { label: 'Not eligible', variant: 'error', help: 'This entry did not meet the competition requirements.' },
};
