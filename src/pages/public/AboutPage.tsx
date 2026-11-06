import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PageMasthead } from '@/layouts/PublicLayout';
import { FEATURES } from '@/config/features';
import {
  GOALS,
  ELIGIBILITY,
  RESEARCH_CATEGORIES,
  SUBMISSION_RULES,
  RUBRIC,
  RUBRIC_TOTAL,
  SCORING_PROCEDURE,
  CODE_OF_CONDUCT,
} from '@/config/competition';

const TOC = [
  { id: 'mission', label: 'Mission & goals' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'categories', label: 'Research categories' },
  { id: 'rules', label: 'Competition rules' },
  { id: 'judging', label: 'Judging criteria' },
  { id: 'conduct', label: 'Code of conduct' },
];

export function AboutPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <>
      <PageMasthead
        eyebrow="About the competition"
        title="A global stage for student research"
        intro="Research Bridge gives students a place to share original research with an international audience and to receive fair, expert evaluation of their work."
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-28 space-y-1 border-l border-muted-200">
            <p className="mb-3 pl-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-500">On this page</p>
            {TOC.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-muted-600 hover:border-teal-500 hover:text-navy-950"
              >
                {t.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="max-w-3xl space-y-16">
          <Block id="mission" title="Mission & goals">
            <p className="text-lg leading-relaxed text-muted-700">
              Our mission is to encourage scientific curiosity and to connect young researchers with professionals,
              university students, and volunteers who can recognize and support their work.
            </p>
            <CheckList items={GOALS} />
          </Block>

          <Block id="eligibility" title="Eligibility">
            <CheckList items={ELIGIBILITY} />
          </Block>

          <Block id="categories" title="Research categories">
            <div className="grid gap-3 sm:grid-cols-2">
              {RESEARCH_CATEGORIES.map((c) => (
                <div key={c} className="rounded-md border border-muted-200 bg-white px-4 py-3 text-sm font-medium text-navy-900">
                  {c}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-500">
              Categories may be combined or adjusted depending on the number of entries.
            </p>
          </Block>

          <Block id="rules" title="Competition rules">
            <ol className="space-y-3">
              {SUBMISSION_RULES.map((r, i) => (
                <li key={r} className="flex gap-4">
                  <span className="w-6 shrink-0 font-serif text-teal-600">{i + 1}.</span>
                  <span className="leading-relaxed text-muted-700">{r}</span>
                </li>
              ))}
            </ol>
          </Block>

          <Block id="judging" title="Judging criteria">
            <p className="leading-relaxed text-muted-700">
              Each project is reviewed by at least two judges — researchers, university students with relevant expertise,
              teachers, engineers, or scientists — using the same {RUBRIC_TOTAL}-point rubric.
            </p>
            <div className="mt-6 overflow-x-auto rounded-md border border-muted-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-navy-900 text-white">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Criterion</th>
                    <th className="px-4 py-3 text-right font-semibold">Points</th>
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">What judges evaluate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted-200">
                  {RUBRIC.map((r) => (
                    <tr key={r.criterion}>
                      <td className="px-4 py-3 font-medium text-navy-900">
                        {r.criterion}
                        <span className="mt-0.5 block text-xs font-normal text-muted-500 sm:hidden">{r.evaluates}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-serif font-bold text-navy-900">{r.points}</td>
                      <td className="hidden px-4 py-3 text-muted-600 sm:table-cell">{r.evaluates}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted-50">
                    <td className="px-4 py-3 font-semibold text-navy-950">Total</td>
                    <td className="px-4 py-3 text-right font-serif font-bold text-teal-700">{RUBRIC_TOTAL}</td>
                    <td className="hidden sm:table-cell" />
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-muted-500">
              For literature reviews and theoretical projects, the methodology and results criteria are interpreted
              appropriately for the research type.
              {!FEATURES.videos && ' The final scoring rubric may be updated before judging begins.'}
            </p>

            <h3 className="mt-10 text-lg text-navy-950">Scoring procedure</h3>
            <ol className="mt-4 space-y-3">
              {SCORING_PROCEDURE.map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-muted-700">{s}</span>
                </li>
              ))}
            </ol>
          </Block>

          <Block id="conduct" title="Code of conduct">
            <CheckList items={CODE_OF_CONDUCT} />
            <p className="mt-6 rounded-md border-l-4 border-navy-300 bg-white px-5 py-4 text-sm leading-relaxed text-muted-600">
              Appearing in the online exhibition does not mean a project has been scientifically validated or endorsed by
              the organizers. Award-winning projects are clearly marked.
            </p>
          </Block>
        </div>
      </div>
    </>
  );
}

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="mb-6 border-b border-muted-200 pb-3 text-2xl text-navy-950">{title}</h2>
      {children}
    </section>
  );
}

export function CheckList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((g) => (
        <li key={g} className="flex gap-3">
          <Check className="mt-1 h-4 w-4 shrink-0 text-teal-600" />
          <span className="leading-relaxed text-muted-700">{g}</span>
        </li>
      ))}
    </ul>
  );
}
