import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Presentation, Video, ClipboardList } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageMasthead } from '@/layouts/PublicLayout';
import { CheckList } from '@/pages/public/AboutPage';
import { FEATURES } from '@/config/features';
import {
  COMPETITION,
  STAGES,
  PAPER_STRUCTURE,
  POSTER_CONTENTS,
  VIDEO_STRUCTURE,
  SUBMISSION_RULES,
} from '@/config/competition';

const REGISTRATION_FIELDS = {
  'About you': [
    'Full name or preferred display name',
    'Email address',
    'School name',
    'Country and city',
    'Age group and grade level',
  ],
  'About your research': [
    'Project title and short abstract',
    'Research category',
    'Individual or collaborative work (and collaborators’ names)',
    'Confirmation that you contributed meaningfully and disclosure of any AI assistance',
  ],
};

export function GuidelinesPage() {
  const { user } = useAuth();
  const count = FEATURES.videos ? 'three' : 'two';

  return (
    <>
      <PageMasthead
        eyebrow="Registration & submission"
        title="Submission guidelines"
        intro={`Everything you need to prepare your entry. Each participant submits ${count} components through the Research Bridge platform and receives a unique submission ID.`}
      />

      <div className="mx-auto max-w-4xl space-y-16 px-4 py-16 sm:px-6">
        {/* Timeline */}
        <section>
          <h2 className="mb-6 border-b border-muted-200 pb-3 text-2xl text-navy-950">Timeline</h2>
          <div className="space-y-0">
            {STAGES.map((s, i) => (
              <div key={s.number} className="relative flex gap-6 pb-8 last:pb-0">
                {i < STAGES.length - 1 && <div className="absolute left-[15px] top-8 h-full w-px bg-muted-200" />}
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-semibold text-white">
                  {s.number}
                </div>
                <div>
                  <p className="text-sm font-medium text-teal-600">{s.when}</p>
                  <h3 className="mt-1 text-lg text-navy-950">{s.title}</h3>
                  <p className="mt-1 leading-relaxed text-muted-600">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 rounded-md bg-teal-50 px-5 py-4 text-sm text-teal-800">
            <strong>Submission deadline:</strong>{' '}
            {COMPETITION.submissionDeadline || 'end of Week 3 — exact date to be announced'}. You can edit your entry
            until then.
          </p>
        </section>

        {/* Registration info */}
        <section>
          <h2 className="mb-6 border-b border-muted-200 pb-3 text-2xl text-navy-950">What we ask when you register</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(REGISTRATION_FIELDS).map(([title, items]) => (
              <div key={title} className="rounded-xl border border-muted-200 bg-surface p-6">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-teal-600" />
                  <h3 className="font-sans text-base font-semibold text-navy-950">{title}</h3>
                </div>
                <CheckList items={items} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-500">
            We only collect information needed to organize the competition.
          </p>
        </section>

        {/* Materials */}
        <section>
          <h2 className="mb-6 border-b border-muted-200 pb-3 text-2xl text-navy-950">Required materials</h2>
          <div className="space-y-6">
            <Material
              n={1}
              icon={<FileText className="h-5 w-5" />}
              title="Research paper or report"
              meta="1,000–3,000 words · PDF or Word"
            >
              <p className="text-muted-700">
                Word count excludes references and appendices. Suggested structure:
              </p>
              <ol className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {PAPER_STRUCTURE.map((p, i) => (
                  <li key={p} className="flex gap-2 text-sm text-muted-700">
                    <span className="w-5 text-teal-600">{i + 1}.</span>
                    {p}
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-sm text-muted-500">
                Theoretical research, mathematical proofs, literature reviews, and computational work may use an
                appropriate alternative structure.
              </p>
            </Material>

            <Material
              n={2}
              icon={<Presentation className="h-5 w-5" />}
              title="Scientific poster"
              meta="PDF · landscape, about 16:9 or A1"
            >
              <p className="text-muted-700">
                Use readable fonts, clear charts, concise text, and properly credited images. The poster should communicate
                your essential findings without requiring the full paper. It should contain:
              </p>
              <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {POSTER_CONTENTS.map((p) => (
                  <li key={p} className="flex gap-2 text-sm text-muted-700">
                    <span className="text-teal-600">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            </Material>

            {FEATURES.videos && (
              <Material n={3} icon={<Video className="h-5 w-5" />} title="Video presentation" meta="2–5 minutes · link">
                <p className="text-muted-700">
                  Present your poster on camera and explain the research in your own words. Upload to an approved platform
                  and share an accessible link.
                </p>
                <table className="mt-3 w-full text-sm">
                  <tbody className="divide-y divide-muted-200">
                    {VIDEO_STRUCTURE.map((v) => (
                      <tr key={v.time}>
                        <td className="w-28 py-2 font-mono text-xs text-teal-700">{v.time}</td>
                        <td className="py-2 text-muted-700">{v.content}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Material>
            )}
          </div>
        </section>

        {/* Rules */}
        <section>
          <h2 className="mb-6 border-b border-muted-200 pb-3 text-2xl text-navy-950">Submission rules</h2>
          <CheckList items={SUBMISSION_RULES} />
        </section>

        <section className="rounded-3xl bg-brand-950 px-8 py-12 text-center text-white">
          <h2 className="text-2xl text-white">Ready to submit?</h2>
          <p className="mt-2 text-blue-100">Create an account, then complete your entry step by step.</p>
          <Link
            to={user ? '/competition' : '/register'}
            className="mt-6 inline-flex items-center gap-2 rounded bg-white px-6 py-3 font-semibold text-brand-950 hover:bg-blue-50"
          >
            {user ? 'Go to my entry' : 'Register & submit'} <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </>
  );
}

function Material({
  n,
  icon,
  title,
  meta,
  children,
}: {
  n: number;
  icon: ReactNode;
  title: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-muted-200 bg-surface">
      <div className="flex items-center justify-between gap-4 border-b border-muted-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">{icon}</span>
          <h3 className="text-lg text-navy-950">
            <span className="text-teal-600">{n}.</span> {title}
          </h3>
        </div>
        <span className="hidden text-xs font-medium text-muted-500 sm:block">{meta}</span>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}
