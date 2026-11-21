import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageMasthead } from '@/layouts/PublicLayout';
import { BadgeCheck, CalendarDays, Check, FileText, Mail, MapPin, School, Tags, User, Users, type LucideIcon } from 'lucide-react';
import { Chapter, Reveal, RuledList, ScheduleFigure } from '@/components/editorial';
import { StepList, SubmitChecklist } from '@/components/blocks';
import { FEATURES } from '@/config/features';
import { COMPETITION, PAPER_STRUCTURE, POSTER_CONTENTS, VIDEO_STRUCTURE, SUBMISSION_RULES } from '@/config/competition';

const REGISTRATION_FIELDS: { title: string; icon: LucideIcon; items: [LucideIcon, string][] }[] = [
  {
    title: 'About you',
    icon: User,
    items: [
      [User, 'Full name or preferred display name'],
      [Mail, 'Email address'],
      [School, 'School name'],
      [MapPin, 'Country and city'],
      [CalendarDays, 'Age group and grade level'],
    ],
  },
  {
    title: 'About your research',
    icon: FileText,
    items: [
      [FileText, 'Project title and short abstract'],
      [Tags, 'Research category'],
      [Users, 'Individual or collaborative work, with collaborators’ names'],
      [BadgeCheck, 'Confirmation that you contributed meaningfully, and any AI assistance'],
    ],
  },
];

/** Things to check before submitting, taken from the requirements and rules on this page. */
const CHECKLIST = [
  'Paper is 1,000–3,000 words, not counting references and appendices',
  'Paper is a PDF or Word file under 25 MB',
  'Poster is a landscape PDF, about 16:9 or A1, under 25 MB',
  'Every source, dataset, image and tool is cited',
  'Any AI assistance is disclosed',
  'Every listed team member contributed meaningfully',
  'Parent or guardian permission, if you are under 18 and agree to public display',
  'You kept a copy of every file you submit',
];

const SECTIONS = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'registration', label: 'Registration' },
  { id: 'paper', label: 'Paper' },
  { id: 'poster', label: 'Poster' },
  { id: 'rules', label: 'Rules' },
  { id: 'checklist', label: 'Checklist' },
];

/** A two-column "specification sheet" for one submission component. */
function SpecSheet({
  title,
  facts,
  lead,
  listTitle,
  list,
  numbered,
}: {
  title: string;
  facts: [string, string][];
  lead: string;
  listTitle: string;
  list: string[];
  numbered?: boolean;
}) {
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.25fr]">
      <Reveal>
        <h2 className="text-3xl md:text-[2.6rem]">{title}</h2>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-600">{lead}</p>
        <dl className="mt-8 grid grid-cols-2 gap-3">
          {facts.map(([k, v]) => (
            <div key={k} className="rounded-xl bg-ink p-4 text-white transition-transform duration-300 hover:-translate-y-0.5">
              <dt className="text-[12px] font-medium text-blue-200">{k}</dt>
              <dd className="mt-1 font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
      <div>
        <p className="mb-4 text-sm font-semibold text-navy-950">{listTitle}</p>
        {numbered ? (
          <StepList items={list} />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {list.map((item, i) => (
              <Reveal as="li" key={item} delay={0.04 * i}>
                <span className="flex items-start gap-3 rounded-xl border border-muted-200 bg-surface p-4 text-[15px] text-navy-900 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-navy-200">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-100 text-navy-950">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  {item}
                </span>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function GuidelinesPage() {
  const { user } = useAuth();
  const count = FEATURES.videos ? 'three' : 'two';

  return (
    <>
      <PageMasthead
        eyebrow="Registration and submission"
        title="Submission guidelines"
        intro={`Everything you need to prepare your entry. You submit ${count} components through Research Bridge and receive a unique submission ID.`}
        sections={SECTIONS}
      />

      <Chapter
        n="1"
        id="timeline"
        label="Timeline"
        title="When things happen"
        intro={
          <>
            Submission deadline:{' '}
            <span className="font-semibold text-navy-950">
              {COMPETITION.submissionDeadline || 'end of week 3, exact date to be announced'}
            </span>
            . You can edit your entry until then.
          </>
        }
      >
        <ScheduleFigure />
      </Chapter>

      <Chapter
        n="2"
        id="registration"
        label="Registration"
        tone="surface"
        title="What we ask when you register"
        intro="Only the information needed to organize the competition."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {REGISTRATION_FIELDS.map(({ title, icon: Icon, items }, g) => (
            <Reveal key={title} delay={0.1 * g}>
              <div className="h-full rounded-2xl border border-muted-200 bg-muted-50 p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <h3 className="text-xl text-navy-950">{title}</h3>
                </div>
                <ul className="mt-6 space-y-1">
                  {items.map(([ItemIcon, text]) => (
                    <li
                      key={text}
                      className="group flex items-center gap-3 rounded-lg px-2 py-2.5 text-[15px] text-navy-900 transition-colors duration-200 hover:bg-surface"
                    >
                      <ItemIcon className="h-4 w-4 shrink-0 text-navy-500 transition-transform duration-300 group-hover:scale-125" strokeWidth={1.8} />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Chapter>

      <Chapter n="3" id="paper" label="Paper">
        <SpecSheet
          title="Research paper or report"
          lead="Theoretical research, mathematical proofs, literature reviews and computational work may use another structure that suits them."
          facts={[
            ['Length', '1,000–3,000 words'],
            ['Format', 'PDF or Word'],
            ['Not counted', 'References, appendices'],
            ['Max size', '25 MB'],
          ]}
          listTitle="Suggested structure"
          list={PAPER_STRUCTURE}
          numbered
        />
      </Chapter>

      <Chapter n="4" id="poster" label="Poster" tone="surface">
        <SpecSheet
          title="Scientific poster"
          lead="Use readable fonts, clear charts, concise text and credited images. A reader should understand your findings without the paper."
          facts={[
            ['Orientation', 'Landscape'],
            ['Proportion', 'About 16:9 or A1'],
            ['Format', 'PDF'],
            ['Max size', '25 MB'],
          ]}
          listTitle="What it should contain"
          list={POSTER_CONTENTS}
        />
      </Chapter>

      {FEATURES.videos && (
        <Chapter n="5" label="Video" title="Video presentation" intro="2–5 minutes, presenting your poster on camera in your own words.">
          <RuledList items={VIDEO_STRUCTURE.map((v) => `${v.time}  ${v.content}`)} />
        </Chapter>
      )}

      <Chapter n={FEATURES.videos ? '6' : '5'} id="rules" label="Rules" title="Submission rules">
        <div className="max-w-3xl">
          <StepList items={SUBMISSION_RULES} />
        </div>
      </Chapter>

      <Chapter
        id="checklist"
        label="Checklist"
        tone="surface"
        title="Before you submit"
        intro="Tick each item as you check your files. When everything is ticked, your entry is ready to upload."
      >
        <SubmitChecklist items={CHECKLIST} />
      </Chapter>

      <section className="bg-[#d9d9d8] dark:bg-muted-100">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-center md:py-20">
          <div>
            <h2 className="text-3xl md:text-4xl">Ready to submit?</h2>
            <p className="mt-3 text-muted-700">Create an account, then complete your entry one section at a time.</p>
          </div>
          <Link to={user ? '/competition' : '/register'} className="btn-primary shrink-0 px-7 py-3.5 text-[15px]">
            {user ? 'Open my entry' : 'Register and submit'}
          </Link>
        </div>
      </section>
    </>
  );
}
