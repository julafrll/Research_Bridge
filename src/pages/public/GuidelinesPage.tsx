import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageMasthead } from '@/layouts/PublicLayout';
import { Chapter, Reveal, RuledList, ScheduleFigure } from '@/components/editorial';
import { FEATURES } from '@/config/features';
import { COMPETITION, PAPER_STRUCTURE, POSTER_CONTENTS, VIDEO_STRUCTURE, SUBMISSION_RULES } from '@/config/competition';

const REGISTRATION_FIELDS: [string, string[]][] = [
  ['About you', ['Full name or preferred display name', 'Email address', 'School name', 'Country and city', 'Age group and grade level']],
  [
    'About your research',
    [
      'Project title and short abstract',
      'Research category',
      'Individual or collaborative work, with collaborators’ names',
      'Confirmation that you contributed meaningfully, and any AI assistance',
    ],
  ],
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
        <h3 className="display text-4xl font-medium tracking-[-0.02em] text-navy-950 md:text-5xl">{title}</h3>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-600">{lead}</p>
        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-muted-200 bg-muted-200">
          {facts.map(([k, v]) => (
            <div key={k} className="bg-surface p-4">
              <dt className="text-[12px] font-medium text-muted-500">{k}</dt>
              <dd className="mt-1 font-semibold text-navy-950">{v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
      <div>
        <p className="mb-4 text-[13px] font-medium text-muted-500">{listTitle}</p>
        <RuledList items={list} numbered={numbered} />
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
      />

      <Chapter
        n="1"
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
        label="Registration"
        tone="surface"
        title="What we ask when you register"
        intro="Only the information needed to organize the competition."
      >
        <div className="grid gap-12 md:grid-cols-2">
          {REGISTRATION_FIELDS.map(([title, items]) => (
            <div key={title}>
              <p className="mb-4 text-[13px] font-medium text-muted-500">{title}</p>
              <RuledList items={items} />
            </div>
          ))}
        </div>
      </Chapter>

      <Chapter n="3" label="Paper">
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

      <Chapter n="4" label="Poster" tone="surface">
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

      <Chapter n={FEATURES.videos ? '6' : '5'} label="Rules" title="Submission rules">
        <RuledList items={SUBMISSION_RULES} numbered />
      </Chapter>

      <section className="grain overflow-hidden bg-ink text-white">
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-20 sm:px-8 md:flex-row md:items-end">
          <div>
            <h2 className="text-4xl text-white md:text-6xl">Ready to submit?</h2>
            <p className="mt-4 text-lg text-blue-100">Create an account, then complete your entry one section at a time.</p>
          </div>
          <Link to={user ? '/competition' : '/register'} className="btn-light group">
            {user ? 'Open my entry' : 'Register and submit'} <ArrowRight className="arrow" />
          </Link>
        </div>
      </section>
    </>
  );
}
