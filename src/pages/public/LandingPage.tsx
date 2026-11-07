import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Atom, Cpu, Dna, FlaskConical, Globe2, Sigma, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { HeroBackdrop } from '@/layouts/PublicLayout';
import { BridgeArch, Chapter, EASE, Podium, Reveal, RubricFigure, ScheduleFigure } from '@/components/editorial';
import { FEATURES } from '@/config/features';
import { COMPETITION, RESEARCH_CATEGORIES } from '@/config/competition';

const CATEGORY_ICONS: LucideIcon[] = [Dna, FlaskConical, Atom, Cpu, Sigma, Globe2];

/* ----------------------------------------------------------------------------
 * Miniature paper and poster — "what you submit" is shown, not listed.
 * --------------------------------------------------------------------------*/

function Lines({ widths, className = 'bg-muted-200' }: { widths: number[]; className?: string }) {
  return (
    <div className="space-y-1.5">
      {widths.map((w, i) => (
        <div key={i} className={`h-1.5 rounded-full ${className}`} style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

function PaperMock() {
  return (
    <div className="h-72 w-52 rounded-sm border border-muted-200 bg-surface p-5 shadow-elevated">
      <div className="mx-auto h-2 w-4/5 rounded-full bg-navy-400" />
      <div className="mx-auto mt-1.5 h-1.5 w-1/2 rounded-full bg-muted-300" />
      <p className="mt-5 text-[8px] font-semibold text-navy-700">Abstract</p>
      <div className="mt-1.5 border-l-2 border-teal-400 pl-2">
        <Lines widths={[100, 92, 96, 60]} className="bg-muted-300" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Lines widths={[100, 94, 100, 88, 100, 70, 96]} />
        <Lines widths={[100, 96, 90, 100, 84, 100, 50]} />
      </div>
    </div>
  );
}

function PosterMock() {
  return (
    <div className="w-[22rem] overflow-hidden rounded-sm border border-muted-200 bg-surface shadow-elevated">
      <div className="bg-ink px-4 py-3">
        <div className="h-2 w-3/5 rounded-full bg-white/85" />
        <div className="mt-1.5 h-1.5 w-1/3 rounded-full bg-white/40" />
      </div>
      <div className="grid grid-cols-3 gap-3 p-4">
        <Lines widths={[100, 90, 96, 70, 100, 85]} />
        <div className="flex h-20 items-end gap-1 rounded-sm bg-muted-50 p-1.5">
          {[40, 65, 52, 88, 74].map((h, i) => (
            <div key={i} className="flex-1 rounded-[1px] bg-teal-500" style={{ height: `${h}%` }} />
          ))}
        </div>
        <Lines widths={[100, 80, 94, 100, 60]} />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Page
 * --------------------------------------------------------------------------*/

export function LandingPage() {
  const { user, isAdmin } = useAuth();
  const entryLink = user ? (isAdmin ? '/admin/competition' : '/competition') : '/register';
  const entryLabel = user ? 'Open my entry' : 'Register and submit';

  return (
    <>
      {/* Hero ------------------------------------------------------------- */}
      <section className="grain overflow-hidden bg-ink text-white">
        <HeroBackdrop />
        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-10 sm:px-8 lg:pb-16 lg:pt-14">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-blue-200"
          >
            <span>
              {COMPETITION.name}, {COMPETITION.edition.replace(' Edition', '')}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-blue-100">
              <span className="relative flex h-2 w-2">
                {COMPETITION.submissionsOpen && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4daea5] opacity-60 motion-reduce:hidden" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    COMPETITION.submissionsOpen ? 'bg-[#4daea5]' : 'bg-blue-300'
                  }`}
                />
              </span>
              {COMPETITION.submissionsOpen ? 'Submissions open' : 'Submissions closed'}
            </span>
          </motion.div>

          <h1 className="sr-only">From curiosity to discovery</h1>
          <div
            aria-hidden
            className="display mt-14 flex flex-col text-[3.9rem] leading-[0.92] text-white sm:text-[5.75rem] lg:mt-24 lg:flex-row lg:items-end lg:gap-6 lg:text-[clamp(4.25rem,7.4vw,7.75rem)]"
          >
            <motion.span
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              Curiosity
            </motion.span>
            <div className="relative my-4 h-[1.05em] w-full lg:my-0 lg:mb-[0.1em] lg:h-[1.2em] lg:flex-1">
              <BridgeArch />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute bottom-[12%] left-1/2 -translate-x-1/2 text-[0.32em] italic text-blue-200"
              >
                to
              </motion.span>
            </div>
            <motion.span
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
              className="self-end italic lg:self-auto"
            >
              Discovery
            </motion.span>
          </div>

          {/* Abstract */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 1.1 }}
            className="mt-16 grid gap-x-12 gap-y-6 border-t border-white/15 pt-8 lg:mt-24 lg:grid-cols-[11rem_1fr_auto]"
          >
            <p className="text-[13px] font-medium text-aqua-300 lg:pt-1.5">Abstract</p>
            <p className="max-w-xl text-lg leading-relaxed text-blue-100 md:text-xl md:leading-relaxed">
              An international online competition for school students. Submit an original research paper and a
              scientific poster, have them scored by professional judges, and see the strongest work published.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row lg:self-end">
              <Link to={entryLink} className="btn-light group">
                {entryLabel} <ArrowRight className="arrow" />
              </Link>
              <Link to="/guidelines" className="btn-outline-light">
                Read the guidelines
              </Link>
            </div>
          </motion.div>
          {COMPETITION.submissionDeadline && (
            <p className="mt-6 text-sm text-blue-200 lg:pl-[calc(11rem+3rem)]">
              Submission deadline: <span className="font-semibold text-white">{COMPETITION.submissionDeadline}</span>
            </p>
          )}
        </div>
      </section>

      {/* 1 Method --------------------------------------------------------- */}
      <Chapter
        n="1"
        label="Method"
        title="Seven weeks, four stages"
        intro="Register and upload your work in the first three weeks. Organizers check every entry, the judges score it, and results are announced at the end of week seven."
      >
        <ScheduleFigure />
      </Chapter>

      {/* 2 Materials ------------------------------------------------------ */}
      <Chapter n="2" label="Materials" tone="surface">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.05fr]">
          <Reveal className="order-2 lg:order-1">
            <motion.div
              className="relative mx-auto hidden h-[22rem] w-full max-w-md sm:block"
              initial="rest"
              whileHover="hover"
              animate="rest"
            >
              <motion.div
                className="absolute left-0 top-0"
                variants={{ rest: { rotate: -5, y: 0 }, hover: { rotate: -8, y: -8, x: -6 } }}
                transition={{ type: 'spring', stiffness: 180, damping: 20 }}
              >
                <PaperMock />
              </motion.div>
              <motion.div
                className="absolute bottom-0 right-0"
                variants={{ rest: { rotate: 3, y: 0 }, hover: { rotate: 5, y: -12, x: 6 } }}
                transition={{ type: 'spring', stiffness: 180, damping: 20 }}
              >
                <PosterMock />
              </motion.div>
            </motion.div>
          </Reveal>

          <Reveal className="order-1 lg:order-2">
            <h2 className="text-[2.6rem] leading-[1.02] md:text-6xl">
              {FEATURES.videos ? 'A paper, a poster and a short video' : 'A paper and a poster'}
            </h2>
            <dl className="mt-10 divide-y divide-muted-200 border-y border-muted-200">
              {[
                ['Research paper', '1,000–3,000 words, not counting references and appendices.', 'PDF or Word'],
                ['Scientific poster', 'Landscape, about 16:9 or A1. It should tell the story without the paper beside it.', 'PDF'],
              ].map(([term, desc, fmt]) => (
                <div key={term} className="py-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-lg font-semibold text-navy-950">{term}</dt>
                    <dd className="rounded-sm border border-muted-300 px-2 py-0.5 text-[12px] font-medium text-muted-600">{fmt}</dd>
                  </div>
                  <dd className="mt-2 max-w-md leading-relaxed text-muted-600">{desc}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-[15px] text-muted-600">
              You get a submission ID straight away and can edit your entry until the deadline.{' '}
              <Link to="/guidelines" className="link-teal">
                Full guidelines
              </Link>
            </p>
          </Reveal>
        </div>
      </Chapter>

      {/* 3 Fields --------------------------------------------------------- */}
      <Chapter
        n="3"
        label="Fields"
        title="Every discipline is welcome"
        intro="Choose the field closest to your work. Theoretical, computational and literature-review projects all qualify."
      >
        <ul className="grid border-t border-muted-300 md:grid-cols-2 md:gap-x-14">
          {RESEARCH_CATEGORIES.map((c, i) => {
            const Icon = CATEGORY_ICONS[i] ?? Atom;
            return (
              <Reveal as="li" key={c} delay={0.04 * i} className="group relative border-b border-muted-300">
                <div className="absolute inset-0 origin-left scale-x-0 bg-navy-100/70 transition-transform duration-500 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
                <div className="relative flex items-center gap-5 px-1 py-6">
                  <Icon className="h-5 w-5 shrink-0 text-teal-600 transition-transform duration-500 ease-out group-hover:rotate-12" strokeWidth={1.6} />
                  <span className="display text-2xl leading-tight text-navy-950 md:text-[1.7rem]">{c}</span>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Chapter>

      {/* 4 Evaluation ------------------------------------------------------- */}
      <Chapter
        n="4"
        label="Evaluation"
        tone="surface"
        id="evaluation"
        title="Judged on the research, nothing else"
        intro="Researchers, teachers, engineers and subject experts score every project independently with the same rubric. School prestige, budget and background don't count."
      >
        <RubricFigure />
        <div className="mt-16 grid gap-px overflow-hidden rounded-md border border-muted-200 bg-muted-200 sm:grid-cols-3">
          {[
            ['2+', 'judges score every project, independently, before any discussion.'],
            ['20', 'points apart? A third judge reviews the project.'],
            ['3', 'tie-breakers, in order: methodology, rigor, originality.'],
          ].map(([n, d]) => (
            <Reveal key={n} className="bg-surface p-7">
              <p className="display text-6xl text-navy-950">{n}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-600">{d}</p>
            </Reveal>
          ))}
        </div>
      </Chapter>

      {/* 5 Results ---------------------------------------------------------- */}
      <Chapter
        n="5"
        label="Results"
        title="Three awards, one gallery"
        intro="The top three projects receive prizes. Every participant gets a digital certificate, and approved projects are published in the online gallery."
      >
        <Podium />
      </Chapter>

      {/* Closing ------------------------------------------------------------ */}
      <section className="border-t border-muted-200">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 md:py-32 lg:grid-cols-[11rem_1fr_auto] lg:items-end">
          <p className="text-[13px] font-medium text-muted-500 lg:self-start lg:pt-4">Conclusion</p>
          <Reveal>
            <h2 className="max-w-3xl text-5xl leading-[1.02] md:text-7xl">
              Your research deserves an audience.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link to={entryLink} className="btn-primary group px-6 py-3.5 text-[15px]">
              {user ? 'Open my entry' : 'Register now'} <ArrowRight className="arrow" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
