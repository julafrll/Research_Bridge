import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Atom, Cpu, Dna, FlaskConical, Globe2, Sigma, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { HeroBackdrop, SectionHeading } from '@/layouts/PublicLayout';
import { FEATURES } from '@/config/features';
import { COMPETITION, STAGES, RESEARCH_CATEGORIES, AWARDS, RUBRIC_TOTAL } from '@/config/competition';

const CATEGORY_ICONS: LucideIcon[] = [Dna, FlaskConical, Atom, Cpu, Sigma, Globe2];
const EASE = [0.22, 1, 0.36, 1] as const;

/* ----------------------------------------------------------------------------
 * The bridge: an arch drawn from "Curiosity" to "Discovery".
 * --------------------------------------------------------------------------*/

const ARCH = 'M 8 150 C 70 22, 330 22, 392 150';
const ARCH_X = [8, 70, 330, 392];
const ARCH_Y = [150, 22, 22, 150];
const HANGERS = [0.16, 0.3, 0.7, 0.84];

function bezier([p0, p1, p2, p3]: number[], t: number) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function BridgeArch() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMax meet" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="arch-stroke" x1="0" x2="1">
          <stop offset="0" stopColor="#7ccbc2" />
          <stop offset="1" stopColor="#e6c25c" />
        </linearGradient>
      </defs>
      <motion.line
        x1="0"
        y1="150"
        x2="400"
        y2="150"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      />
      {HANGERS.map((t, i) => {
        const x = bezier(ARCH_X, t);
        return (
          <motion.line
            key={t}
            x1={x}
            x2={x}
            y1={bezier(ARCH_Y, t)}
            y2={150}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.3 + i * 0.08 }}
          />
        );
      })}
      <motion.path
        d={ARCH}
        fill="none"
        stroke="url(#arch-stroke)"
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.3, ease: EASE, delay: 0.35 }}
      />
      {!reduce && (
        <circle r="4.5" fill="#ffffff">
          <animateMotion
            dur="5.5s"
            begin="1.8s"
            repeatCount="indefinite"
            path={ARCH}
            keyPoints="0;1"
            keyTimes="0;1"
            calcMode="spline"
            keySplines="0.45 0 0.55 1"
          />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="5.5s" begin="1.8s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * Miniature paper and poster, so "what you submit" is shown, not listed.
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
    <div className="h-64 w-48 rounded-md border border-muted-200 bg-surface p-5 shadow-card-hover">
      <div className="mx-auto h-2 w-4/5 rounded-full bg-navy-300" />
      <div className="mx-auto mt-1.5 h-1.5 w-1/2 rounded-full bg-muted-300" />
      <div className="mt-5 rounded bg-muted-100 p-2">
        <Lines widths={[100, 92, 96, 60]} className="bg-muted-300" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Lines widths={[100, 94, 100, 88, 100, 70]} />
        <Lines widths={[100, 96, 90, 100, 84, 50]} />
      </div>
    </div>
  );
}

function PosterMock() {
  return (
    <div className="w-80 overflow-hidden rounded-md border border-muted-200 bg-surface shadow-card-hover">
      <div className="bg-brand-900 px-4 py-3">
        <div className="h-2 w-3/5 rounded-full bg-white/80" />
        <div className="mt-1.5 h-1.5 w-1/3 rounded-full bg-white/40" />
      </div>
      <div className="grid grid-cols-3 gap-3 p-4">
        <Lines widths={[100, 90, 96, 70, 100, 85]} />
        <div className="flex h-16 items-end gap-1 rounded bg-muted-50 p-1.5">
          {[40, 65, 52, 88, 74].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-teal-400" style={{ height: `${h}%` }} />
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

  const podium = [AWARDS[1], AWARDS[0], AWARDS[2]];
  const podiumHeight: Record<string, string> = { first: 'h-72', second: 'h-56', third: 'h-44' };
  const podiumAccent: Record<string, string> = {
    first: 'border-t-gold-400',
    second: 'border-t-muted-400',
    third: 'border-t-[#c08552]',
  };

  return (
    <>
      {/* Hero ------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-brand-950 text-white dark:bg-[#0f2140]">
        <HeroBackdrop />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:pb-20 lg:pt-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center justify-between gap-3 text-sm text-blue-200"
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
            className="mt-12 flex flex-col font-serif font-medium text-[3.9rem] leading-[0.95] text-white sm:text-[5.5rem] lg:mt-20 lg:flex-row lg:items-end lg:gap-6 lg:text-[clamp(4rem,6.6vw,6.5rem)]"
          >
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              Curiosity
            </motion.span>
            <div className="relative my-4 h-[1.1em] w-full lg:my-0 lg:mb-[0.1em] lg:h-[1.25em] lg:flex-1">
              <BridgeArch />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute bottom-[12%] left-1/2 -translate-x-1/2 text-[0.34em] italic text-blue-200"
              >
                to
              </motion.span>
            </div>
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.9 }}
              className="self-end lg:self-auto"
            >
              Discovery
            </motion.span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 1.1 }}
            className="mt-14 grid gap-8 border-t border-white/15 pt-8 lg:grid-cols-[1.2fr_1fr] lg:items-end"
          >
            <p className="max-w-xl text-lg leading-relaxed text-blue-100">
              An international online competition for student research. Submit your paper and scientific poster, have
              it scored by professional judges, and see the best work published in our gallery.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                to={entryLink}
                className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-7 py-3.5 font-semibold text-brand-950 transition-colors hover:bg-[#d6f1ed]"
              >
                {user ? 'Open my entry' : 'Register and submit'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/guidelines"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/30 px-7 py-3.5 font-semibold text-white transition-colors hover:border-white/70"
              >
                Read the guidelines
              </Link>
            </div>
          </motion.div>
          {COMPETITION.submissionDeadline && (
            <p className="mt-6 text-sm text-blue-200">
              Submission deadline: <span className="font-semibold text-white">{COMPETITION.submissionDeadline}</span>
            </p>
          )}
        </div>
      </section>

      {/* How it runs ------------------------------------------------------- */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Seven weeks" title="How the competition runs" />
          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-8">
            <div className="absolute left-0 right-0 top-[19px] hidden h-px bg-muted-300 md:block" />
            {STAGES.map((stage) => (
              <li key={stage.number} className="relative">
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-muted-300 bg-muted-50 font-serif font-medium text-xl text-navy-950">
                  {stage.number}
                </div>
                <p className="mt-6 text-sm font-medium text-teal-600">{stage.when}</p>
                <h3 className="mt-1 text-lg text-navy-950">{stage.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-600">{stage.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What you submit --------------------------------------------------- */}
      <section className="border-y border-muted-200 bg-surface py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Your entry</p>
            <h2 className="mt-3 text-4xl text-navy-950 md:text-[2.75rem]">
              {FEATURES.videos ? 'A paper, a poster and a short video' : 'A paper and a poster'}
            </h2>
            <dl className="mt-10 space-y-8">
              <div>
                <dt className="font-semibold text-navy-950">Research paper</dt>
                <dd className="mt-1.5 leading-relaxed text-muted-600">
                  1,000–3,000 words, not counting references and appendices. Upload a PDF or Word file.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-navy-950">Scientific poster</dt>
                <dd className="mt-1.5 leading-relaxed text-muted-600">
                  A landscape PDF, about 16:9 or A1. It should tell your story without the paper next to it.
                </dd>
              </div>
            </dl>
            <p className="mt-8 text-sm text-muted-500">
              You get a submission ID straight away and can edit your entry until the deadline.{' '}
              <Link to="/guidelines" className="link-teal">
                Full guidelines
              </Link>
            </p>
          </div>

          <motion.div
            className="relative mx-auto hidden h-80 w-full max-w-md sm:block"
            initial="rest"
            whileHover="hover"
            animate="rest"
          >
            <motion.div
              className="absolute left-0 top-2"
              variants={{ rest: { rotate: -6, y: 0 }, hover: { rotate: -9, y: -6 } }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <PaperMock />
            </motion.div>
            <motion.div
              className="absolute bottom-2 right-0"
              variants={{ rest: { rotate: 3, y: 0 }, hover: { rotate: 5, y: -10 } }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <PosterMock />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Fields --------------------------------------------------------------- */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Open to every discipline" title="Six research fields" />
          <ul className="grid border-t border-muted-200 md:grid-cols-2 md:gap-x-12">
            {RESEARCH_CATEGORIES.map((c, i) => {
              const Icon = CATEGORY_ICONS[i] ?? Atom;
              return (
                <li key={c} className="group relative border-b border-muted-200">
                  <div className="absolute inset-0 origin-left scale-x-0 bg-navy-50 transition-transform duration-500 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
                  <div className="relative flex items-center gap-5 px-2 py-5">
                    <Icon className="h-5 w-5 shrink-0 text-teal-600" strokeWidth={1.75} />
                    <span className="font-serif font-medium text-2xl leading-tight text-navy-950">{c}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Judging ---------------------------------------------------------------- */}
      <section className="border-y border-muted-200 bg-surface py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow">Fair evaluation</p>
            <h2 className="mt-3 text-4xl text-navy-950 md:text-[2.75rem]">Judged on the research, nothing else</h2>
            <Link to="/about#judging" className="link-teal mt-6 inline-block text-sm">
              See the full rubric
            </Link>
          </div>
          <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
            {[
              { n: '2+', t: 'judges per project', d: 'Researchers, teachers, engineers and subject experts score independently.' },
              { n: String(RUBRIC_TOTAL), t: 'point rubric', d: 'Question, scientific understanding, methodology, results and originality.' },
              { n: '20', t: 'point gap brings in a third judge', d: 'When two scores disagree by that much, another judge reviews the project.' },
            ].map((x) => (
              <div key={x.t} className="border-t-2 border-navy-950 pt-5">
                <p className="font-serif font-medium text-5xl text-navy-950">{x.n}</p>
                <p className="mt-1 font-medium text-navy-800">{x.t}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-600">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards podium ------------------------------------------------------- */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Recognition" title="Awards and prizes" />
          <div className="grid grid-cols-3 items-end gap-3 sm:gap-6">
            {podium.map((a, i) => (
              <motion.div
                key={a.key}
                initial={{ scaleY: 0.35, opacity: 0 }}
                whileInView={{ scaleY: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease: EASE, delay: [0.15, 0, 0.3][i] }}
                style={{ transformOrigin: 'bottom' }}
                className={`${podiumHeight[a.key]} flex flex-col rounded-t-xl border-t-4 bg-navy-50 p-4 sm:p-7 ${podiumAccent[a.key]}`}
              >
                <span className="text-sm font-medium text-muted-600">{a.place}</span>
                <span className="mt-2 font-serif font-medium text-4xl text-navy-950 sm:text-6xl">{a.prize}</span>
                <span className="mt-auto text-sm font-medium text-navy-800 sm:text-base">{a.title}</span>
              </motion.div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-sm text-muted-500">
            Every participant receives a digital certificate. Approved projects are published in the online research
            gallery.
          </p>
        </div>
      </section>

      {/* Closing --------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-white/10 bg-brand-900 text-white dark:bg-[#132a50]">
        <HeroBackdrop />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-20 sm:px-6 md:flex-row md:items-end">
          <h2 className="max-w-2xl text-5xl text-white md:text-6xl">Your research deserves an audience.</h2>
          <Link
            to={entryLink}
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-brand-950 transition-colors hover:bg-[#d6f1ed]"
          >
            {user ? 'Open my entry' : 'Register now'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </>
  );
}
