import { FEATURES } from '@/config/features';

/**
 * All public competition content lives here so organizers can update
 * dates, contacts and copy without touching page components.
 * Fields left empty ('') render as "To be announced" on the site.
 */
export const COMPETITION = {
  name: 'Online Research Paper Competition',
  shortName: 'Research Bridge Competition',
  edition: '2026–2027 Edition',
  tagline: 'From Curiosity to Discovery.',
  summary:
    'An international online competition where students submit original research papers and scientific posters. Every project is reviewed by professional judges, and the strongest work is recognized with awards and published in our digital gallery.',

  /** Organizers: fill these in. */
  contactEmail: '',
  instagramHandle: '',
  instagramUrl: '',
  /** e.g. 'December 20, 2026'. Leave empty to show the week-based schedule only. */
  submissionDeadline: '',
  /** Turns the student submission form on/off. */
  submissionsOpen: true,
  /** Publishes winners on the Winners page once results are final. */
  resultsPublished: false,
};

export const GOALS = [
  'Encourage scientific curiosity, independent research, and critical thinking.',
  'Give students a platform to share their research with an international audience.',
  "Develop students' scientific writing, visual communication, and presentation skills.",
  'Connect young researchers with professionals, university students, and volunteers.',
  'Recognize outstanding research through transparent judging and awards.',
  'Create a digital collection of student research projects for educational purposes.',
];

export const RESEARCH_CATEGORIES = [
  'Biology and Life Sciences',
  'Chemistry and Materials Science',
  'Physics and Astronomy',
  'Computer Science, Artificial Intelligence, and Engineering',
  'Mathematics and Statistics',
  'Social Sciences and Interdisciplinary Research',
] as const;

export type CompetitionCategory = (typeof RESEARCH_CATEGORIES)[number];

export const CATEGORY_SHORT: Record<CompetitionCategory, string> = {
  'Biology and Life Sciences': 'Biology',
  'Chemistry and Materials Science': 'Chemistry',
  'Physics and Astronomy': 'Physics',
  'Computer Science, Artificial Intelligence, and Engineering': 'CS, AI & Engineering',
  'Mathematics and Statistics': 'Mathematics',
  'Social Sciences and Interdisciplinary Research': 'Social Sciences',
};

export interface Stage {
  number: number;
  title: string;
  when: string;
  description: string;
}

export const STAGES: Stage[] = [
  {
    number: 1,
    title: 'Registration & Submission',
    when: 'Weeks 1–3',
    description:
      'Register on the Research Bridge platform and submit all required materials. Each entry receives a unique submission ID.',
  },
  {
    number: 2,
    title: 'Eligibility & Quality Check',
    when: 'Week 4',
    description:
      'Organizers verify each submission is complete and follows the requirements. Incomplete entries may be returned for correction.',
  },
  {
    number: 3,
    title: 'Judging',
    when: 'Weeks 5–7',
    description:
      'Every eligible project is scored independently by at least two judges using a standardized scoring rubric.',
  },
  {
    number: 4,
    title: 'Results & Awards',
    when: 'End of Week 7',
    description:
      'Winners are announced, digital certificates and prizes are distributed, and approved projects are published in the gallery.',
  },
];

export const PAPER_STRUCTURE = [
  'Title and author information',
  'Abstract',
  'Introduction and research question',
  'Background and relevant literature',
  'Methodology',
  'Results or findings',
  'Discussion and limitations',
  'Conclusion',
  'References',
];

export const POSTER_CONTENTS = [
  'Project title and author(s)',
  'Research question',
  'Background and objectives',
  'Methods or approach',
  'Main results',
  'Conclusion and significance',
  'Limitations, where appropriate',
  'References and acknowledgments',
];

export const VIDEO_STRUCTURE = [
  { time: '0:00–0:30', content: 'Introduce the topic and research question' },
  { time: '0:30–1:15', content: 'Explain the background and objectives' },
  { time: '1:15–2:30', content: 'Describe the methodology or research approach' },
  { time: '2:30–3:45', content: 'Present the main findings' },
  { time: '3:45–4:30', content: 'Explain the conclusion, significance, and limitations' },
  { time: '4:30–5:00', content: 'Share a final takeaway' },
];

export const SUBMISSION_RULES = [
  'All work must be original or appropriately credited.',
  'Sources, datasets, images, and external tools must be cited.',
  'Any material AI assistance must be disclosed. AI-generated claims or fabricated results are prohibited.',
  "Participants must not submit another person's work as their own.",
  'Projects involving human participants, personal data, animals, or potentially hazardous experiments must comply with applicable school, legal, and ethical requirements.',
  'Public display of names, faces, school details, and research files requires consent. Participants under 18 need parent or guardian permission where required.',
  'Keep a copy of every file you submit.',
];

export interface RubricItem {
  criterion: string;
  points: number;
  evaluates: string;
  video?: boolean;
}

const ALL_RUBRIC: RubricItem[] = [
  { criterion: 'Research question and objectives', points: 10, evaluates: 'Clarity, relevance, and focus' },
  { criterion: 'Background and scientific understanding', points: 15, evaluates: 'Knowledge of existing research and concepts' },
  { criterion: 'Methodology and rigor', points: 20, evaluates: 'Appropriateness, reproducibility, and quality of methods' },
  { criterion: 'Results and analysis', points: 20, evaluates: 'Accuracy, interpretation, evidence, and reasoning' },
  { criterion: 'Originality and creativity', points: 15, evaluates: 'Independent thinking and contribution' },
  { criterion: 'Video presentation', points: 20, evaluates: 'Clarity, scientific communication, and timing', video: true },
];

export const RUBRIC = ALL_RUBRIC.filter((r) => FEATURES.videos || !r.video);
export const RUBRIC_TOTAL = RUBRIC.reduce((sum, r) => sum + r.points, 0);

export const SCORING_PROCEDURE = [
  'Every project is assigned a unique ID.',
  'Judges score each project independently before any discussion.',
  'The final score is the mean of the two judges’ scores.',
  'If two scores differ by 20 points or more, a third judge reviews the project.',
  'Ties are resolved by methodology, scientific rigor, and originality, in that order.',
  'The judging coordinator verifies all results before winners are announced.',
];

export const AWARDS = [
  { place: '1st Place', title: 'Best Overall Research', prize: '$250', key: 'first' },
  { place: '2nd Place', title: 'Outstanding Research', prize: '$150', key: 'second' },
  { place: '3rd Place', title: 'Promising Research', prize: '$100', key: 'third' },
] as const;

export type AwardKey = (typeof AWARDS)[number]['key'];

export const CODE_OF_CONDUCT = [
  'Be honest: submit only your own work and cite everyone else’s.',
  'Be respectful toward other participants, judges, and organizers.',
  'Judges evaluate research quality — never school prestige, equipment budget, or personal background.',
  'Judges’ private contact details and scoring discussions remain confidential.',
  'Feedback, when given, is constructive, professional, and consistent.',
];

export const FAQ = [
  {
    q: 'Who can participate?',
    a: 'Students from any country can take part, individually or as a team. You will be asked for your school, grade level, and age group when you register.',
  },
  {
    q: 'How long should my paper be?',
    a: 'We recommend 1,000–3,000 words, excluding references and appendices. Theoretical work, proofs, literature reviews, and computational projects may use an alternative structure.',
  },
  {
    q: 'Can I use AI tools?',
    a: 'You must contribute meaningfully to the work yourself and disclose any material AI assistance. AI-generated claims and fabricated results lead to disqualification.',
  },
  {
    q: 'Can I fix my submission after sending it?',
    a: 'Yes — you can edit your entry until the submission deadline. During the eligibility check, organizers may also return an incomplete entry for correction.',
  },
  {
    q: 'Will my project be published?',
    a: 'Only if you agree. The gallery shows projects whose authors consented to public display, and participants under 18 need parent or guardian permission.',
  },
  {
    q: 'How do I correct or remove published material?',
    a: 'Email the organizing team with your submission ID and what should change. We aim to reply within two business days.',
  },
];

export interface Judge {
  name: string;
  role: string;
  affiliation?: string;
  bio?: string;
  photoUrl?: string;
}

/** Only list judges who consented to public identification. */
export const JUDGES: Judge[] = [];

export const ELIGIBILITY = [
  'Open to school students from any country.',
  'Individual and collaborative (team) projects are both welcome; every listed member must have contributed meaningfully.',
  'One entry per participant account.',
  'Participants under 18 need parent or guardian permission for any public display of their name, face, school, or files.',
];

export const AGE_GROUPS = ['Under 14', '14–15', '16–17', '18 or older'];
