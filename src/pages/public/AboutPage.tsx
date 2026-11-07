import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PageMasthead } from '@/layouts/PublicLayout';
import { Chapter, Reveal, RubricFigure, RuledList } from '@/components/editorial';
import {
  GOALS,
  ELIGIBILITY,
  RESEARCH_CATEGORIES,
  SUBMISSION_RULES,
  SCORING_PROCEDURE,
  CODE_OF_CONDUCT,
} from '@/config/competition';

export function AboutPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 450);
      return () => clearTimeout(t);
    }
  }, [hash]);

  return (
    <>
      <PageMasthead
        eyebrow="About the competition"
        title="A global stage for student research"
        intro="Research Bridge gives school students a place to share original research with an international audience, and to have it evaluated fairly by people who do research for a living."
      />

      <Chapter
        n="1"
        label="Mission"
        id="mission"
        title="Why we run it"
        intro="To encourage scientific curiosity, and to connect young researchers with professionals, university students and volunteers who can recognize their work."
      >
        <RuledList items={GOALS} />
      </Chapter>

      <Chapter n="2" label="Eligibility" id="eligibility" tone="surface" title="Who can take part">
        <RuledList items={ELIGIBILITY} />
      </Chapter>

      <Chapter
        n="3"
        label="Fields"
        id="categories"
        title="Six research categories"
        intro="Categories may be combined or adjusted depending on the number of entries."
      >
        <div className="grid border-t border-muted-300 sm:grid-cols-2 sm:gap-x-14">
          {RESEARCH_CATEGORIES.map((c, i) => (
            <Reveal key={c} delay={i * 0.04} className="border-b border-muted-300 py-5">
              <span className="display text-2xl text-navy-950">{c}</span>
            </Reveal>
          ))}
        </div>
      </Chapter>

      <Chapter n="4" label="Rules" id="rules" tone="surface" title="Competition rules">
        <RuledList items={SUBMISSION_RULES} numbered />
      </Chapter>

      <Chapter
        n="5"
        label="Judging"
        id="judging"
        title="How projects are scored"
        intro="At least two judges review each project: researchers, university students with relevant expertise, teachers, engineers or scientists. For literature reviews and theoretical work, methodology and results are read in a way that suits the research."
      >
        <RubricFigure />
        <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <Reveal>
            <h3 className="display text-3xl font-medium tracking-[-0.02em] text-navy-950 md:text-4xl">Scoring procedure</h3>
            <p className="mt-4 max-w-sm leading-relaxed text-muted-600">
              The same steps for every project, so two entries are never judged differently.
            </p>
          </Reveal>
          <RuledList items={SCORING_PROCEDURE} numbered />
        </div>
      </Chapter>

      <Chapter n="6" label="Conduct" id="conduct" tone="surface" title="Code of conduct">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            {CODE_OF_CONDUCT.map((c, i) => (
              <Reveal key={c} delay={i * 0.04} className="flex gap-4">
                <Check className="mt-1 h-5 w-5 shrink-0 text-teal-600" strokeWidth={1.75} />
                <p className="text-[17px] leading-relaxed text-navy-900">{c}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <aside className="border-l-2 border-gold-400 pl-6">
              <p className="display text-2xl leading-snug text-navy-950">A note on the exhibition</p>
              <p className="mt-3 leading-relaxed text-muted-600">
                Appearing in the online gallery doesn’t mean a project has been scientifically validated or endorsed by
                the organizers. Award-winning projects are clearly marked.
              </p>
            </aside>
          </Reveal>
        </div>
      </Chapter>
    </>
  );
}
