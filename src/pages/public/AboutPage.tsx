import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Award,
  Check,
  Globe2,
  Library,
  Lightbulb,
  PenTool,
  ShieldCheck,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { PageMasthead } from '@/layouts/PublicLayout';
import { Chapter, Reveal, RubricFigure } from '@/components/editorial';
import { FieldChips, IconCards, StepList } from '@/components/blocks';
import { GOALS, ELIGIBILITY, SUBMISSION_RULES, SCORING_PROCEDURE, CODE_OF_CONDUCT } from '@/config/competition';

// One icon per goal and eligibility rule, in the same order as the config lists.
const GOAL_ICONS: LucideIcon[] = [Lightbulb, Globe2, PenTool, Users, Award, Library];
const ELIGIBILITY_ICONS: LucideIcon[] = [Globe2, Users, UserCheck, ShieldCheck];

const SECTIONS = [
  { id: 'mission', label: 'Mission' },
  { id: 'eligibility', label: 'Who can enter' },
  { id: 'categories', label: 'Fields' },
  { id: 'rules', label: 'Rules' },
  { id: 'judging', label: 'Judging' },
  { id: 'conduct', label: 'Conduct' },
];

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
        sections={SECTIONS}
      />

      <Chapter
        n="1"
        label="Mission"
        id="mission"
        title="Why we run it"
        intro="To encourage scientific curiosity, and to connect young researchers with professionals, university students and volunteers who can recognize their work."
      >
        <IconCards items={GOALS.map((text, i) => ({ icon: GOAL_ICONS[i] ?? Lightbulb, text }))} />
      </Chapter>

      <Chapter n="2" label="Eligibility" id="eligibility" tone="surface" title="Who can take part">
        <IconCards columns={2} items={ELIGIBILITY.map((text, i) => ({ icon: ELIGIBILITY_ICONS[i] ?? Check, text }))} />
      </Chapter>

      <Chapter
        n="3"
        label="Fields"
        id="categories"
        title="Six research categories"
        intro="Categories may be combined or adjusted depending on the number of entries."
      >
        <FieldChips />
      </Chapter>

      <Chapter n="4" label="Rules" id="rules" tone="surface" title="Competition rules">
        <div className="max-w-3xl">
          <StepList items={SUBMISSION_RULES} />
        </div>
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
            <h3 className="text-2xl font-semibold tracking-[-0.02em] text-navy-950 md:text-3xl">Scoring procedure</h3>
            <p className="mt-4 max-w-sm leading-relaxed text-muted-600">
              The same steps for every project, so two entries are never judged differently.
            </p>
          </Reveal>
          <StepList items={SCORING_PROCEDURE} />
        </div>
      </Chapter>

      <Chapter n="6" label="Conduct" id="conduct" tone="surface" title="Code of conduct">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            {CODE_OF_CONDUCT.map((c, i) => (
              <Reveal key={c} delay={i * 0.04}>
                <div className="group flex gap-4 rounded-xl p-3 transition-colors duration-300 hover:bg-navy-50">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:scale-110 dark:bg-navy-500">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <p className="text-[17px] leading-relaxed text-navy-900">{c}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <aside className="rounded-2xl bg-ink p-7 text-white">
              <p className="text-2xl font-semibold leading-snug">A note on the exhibition</p>
              <p className="mt-3 leading-relaxed text-blue-100">
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
