import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { Atom, ChevronDown, Cpu, Dna, FileText, FlaskConical, Globe2, Presentation, Sigma, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AtomOrbits } from '@/components/Atom';
import { Chapter, EASE, Podium, Reveal, RubricFigure, ScheduleFigure } from '@/components/editorial';
import { FEATURES } from '@/config/features';
import { COMPETITION, PAPER_STRUCTURE, POSTER_CONTENTS, RESEARCH_CATEGORIES } from '@/config/competition';

const CATEGORY_ICONS: LucideIcon[] = [Dna, FlaskConical, Atom, Cpu, Sigma, Globe2];

const MATERIALS: { icon: LucideIcon; title: string; format: string; points: string[]; more: { label: string; items: readonly string[] } }[] = [
  {
    icon: FileText,
    title: 'Research paper',
    format: 'PDF or Word',
    points: [
      '1,000–3,000 words, not counting references and appendices',
      'Abstract, method, results, discussion and references',
      'Your own work, with every source cited',
    ],
    more: { label: 'Suggested structure', items: PAPER_STRUCTURE },
  },
  {
    icon: Presentation,
    title: 'Scientific poster',
    format: 'PDF',
    points: [
      'Landscape, about 16:9 or A1',
      'Readable on its own, without the paper beside it',
      'Question, method, main results and conclusion',
    ],
    more: { label: 'What it should contain', items: POSTER_CONTENTS },
  },
];

/** Paper or poster card that opens to show the full required structure. */
function MaterialCard({ icon: Icon, title, format, points, more }: (typeof MATERIALS)[number]) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  return (
    <div className="group rounded-xl border border-muted-200 bg-muted-50 p-7 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-card-hover md:p-8">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <span className="rounded-full border border-muted-300 px-3 py-1 text-xs font-medium text-muted-600">{format}</span>
      </div>
      <h3 className="mt-6 text-xl text-navy-950">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {points.map((p) => (
          <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-muted-700">
            <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-navy-500" aria-hidden />
            {p}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700"
      >
        {open ? 'Hide' : 'Show'} {more.label.toLowerCase()}
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <ol className="mt-4 grid gap-1.5 border-t border-muted-200 pt-4 sm:grid-cols-2">
              {more.items.map((item, i) => (
                <motion.li
                  key={item}
                  initial={reduce ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 + i * 0.03 }}
                  className="flex gap-2.5 text-sm text-muted-700"
                >
                  <span className="w-5 shrink-0 font-semibold tabular-nums text-navy-500">{i + 1}</span>
                  {item}
                </motion.li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const JUDGING_RULES = [
  'At least two judges score every project on their own, before any discussion.',
  'If their scores are 20 or more points apart, a third judge reviews the project.',
  'Ties go to the stronger methodology, then rigor, then originality.',
];

const HEADLINE = 'Research competition for school students, judged by professionals';

/** Headline that rises in word by word on first load. */
function HeroHeadline({ className }: { className: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <h1 className={className}>{HEADLINE}</h1>;
  return (
    <h1 className={className} aria-label={HEADLINE}>
      {HEADLINE.split(' ').map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 + i * 0.06 }}
          >
            {word}
          </motion.span>
          {i < HEADLINE.split(' ').length - 1 && '\u00a0'}
        </span>
      ))}
    </h1>
  );
}

/** Fades and lifts hero content in after the headline. */
function HeroFade({ children, delay, className }: { children: ReactNode; delay: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function LandingPage() {
  const { user, isAdmin } = useAuth();
  const entryLink = user ? (isAdmin ? '/admin/competition' : '/competition') : '/register';
  const entryLabel = user ? 'Open my entry' : 'Register and submit';

  // The hero atom leans gently toward the pointer.
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const ax = useSpring(useTransform(px, [-0.5, 0.5], [-28, 28]), { stiffness: 60, damping: 18 });
  const ay = useSpring(useTransform(py, [-0.5, 0.5], [-20, 20]), { stiffness: 60, damping: 18 });
  const onHeroMove = (e: PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== 'mouse' || !heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <>
      {/* Hero ------------------------------------------------------------- */}
      <section
        ref={heroRef}
        onPointerMove={onHeroMove}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
        className="relative overflow-hidden bg-ink text-white"
      >
        <motion.div
          style={{ x: ax, y: ay }}
          className="pointer-events-none absolute left-[55%] top-[calc(50%-25rem)] hidden h-[44rem] w-[44rem] md:block lg:left-[58%] lg:top-[calc(50%-29rem)] lg:h-[50rem] lg:w-[50rem]"
        >
          <motion.div
            className="h-full w-full"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 160, ease: 'linear', repeat: Infinity }}
          >
            <AtomOrbits className="h-full w-full" />
          </motion.div>
        </motion.div>
        <AtomOrbits className="pointer-events-none absolute -right-44 -top-36 h-80 w-80 opacity-40 md:hidden" animate={false} />
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 md:pb-28 md:pt-24">
          <HeroFade delay={0}>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm text-blue-100">
            <span className="relative flex h-2 w-2" aria-hidden>
              {COMPETITION.submissionsOpen && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9fe3b5] opacity-70 motion-reduce:hidden" />
              )}
              <span
                className={`relative h-2 w-2 rounded-full ${COMPETITION.submissionsOpen ? 'bg-[#9fe3b5]' : 'bg-blue-300'}`}
              />
            </span>
            {COMPETITION.submissionsOpen ? 'Submissions are open' : 'Submissions are closed'} for the{' '}
            {COMPETITION.edition.replace(' Edition', '')} edition
          </p>

          </HeroFade>

          <HeroHeadline className="mt-8 max-w-2xl text-[2.6rem] text-white sm:text-6xl lg:text-[4rem] lg:leading-[1.06]" />
          <HeroFade delay={0.65}>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-blue-100 md:text-xl md:leading-relaxed">
            Submit an original research paper and a scientific poster from anywhere in the world. Every entry is
            scored by at least two judges, and the best projects win prizes and a place in our online gallery.
          </p>
          </HeroFade>

          <HeroFade delay={0.8} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link to={entryLink} className="btn-light group">
              {entryLabel}
            </Link>
            <Link to="/guidelines" className="btn-outline-light">
              Read the guidelines
            </Link>
          </HeroFade>

          <HeroFade delay={0.95}>
          <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5 border-t border-white/15 pt-8 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-blue-200">Who can enter</dt>
              <dd className="mt-1 font-medium text-white">Students in any country, alone or as a team</dd>
            </div>
            <div>
              <dt className="text-blue-200">Submission deadline</dt>
              <dd className="mt-1 font-medium text-white">{COMPETITION.submissionDeadline || 'End of week 3'}</dd>
            </div>
            <div>
              <dt className="text-blue-200">Top prize</dt>
              <dd className="mt-1 font-medium text-white">$250</dd>
            </div>
          </dl>
          </HeroFade>
        </div>
      </section>

      {/* How it works ------------------------------------------------------- */}
      <Chapter
        label="How it works"
        title="How the seven weeks run"
        intro="Register and upload your work in the first three weeks. Organizers check every entry, the judges score it, and results come out at the end of week seven."
      >
        <ScheduleFigure />
      </Chapter>

      {/* What you submit --------------------------------------------------- */}
      <Chapter
        label="What you submit"
        tone="surface"
        title={FEATURES.videos ? 'A paper, a poster and a short video' : 'A research paper and a poster'}
        intro="You get a submission ID as soon as you upload, and you can edit your entry until the deadline."
      >
        <div className="grid items-start gap-5 md:grid-cols-2">
          {MATERIALS.map((m, i) => (
            <Reveal key={m.title} delay={0.1 * i}>
              <MaterialCard {...m} />
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-[15px] text-muted-600">
          Formatting, file names and rules are all in the{' '}
          <Link to="/guidelines" className="link-teal">
            submission guidelines
          </Link>
          .
        </p>
      </Chapter>

      {/* Fields ------------------------------------------------------------- */}
      <Chapter
        label="Research fields"
        title="Six research fields"
        intro="Pick the field closest to your work. Experimental, theoretical, computational and literature-review projects all qualify."
      >
        <ul className="flex flex-wrap gap-3">
          {RESEARCH_CATEGORIES.map((c, i) => {
            const Icon = CATEGORY_ICONS[i] ?? Atom;
            return (
              <Reveal as="li" key={c} delay={0.05 * i}>
                <span className="group inline-flex cursor-default items-center gap-3 rounded-full border border-muted-300 bg-surface py-2.5 pl-2.5 pr-5 text-[15px] font-medium text-navy-950 transition-[background-color,border-color,color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-white hover:shadow-card-hover">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100 text-navy-950 transition-[background-color,color,transform] duration-500 group-hover:rotate-[360deg] group-hover:bg-white/15 group-hover:text-white">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </span>
                {c}
                </span>
              </Reveal>
            );
          })}
        </ul>
      </Chapter>

      {/* Judging ------------------------------------------------------------ */}
      <Chapter
        label="Judging"
        tone="surface"
        id="evaluation"
        title="How projects are judged"
        intro="Researchers, teachers, engineers and subject experts score every project with the same rubric. School reputation, budget and background are not part of the score."
      >
        <RubricFigure />
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {JUDGING_RULES.map((rule, i) => (
            <Reveal as="li" key={rule} delay={0.08 * i} className="h-full">
              <p className="h-full rounded-xl border border-transparent bg-muted-50 p-6 text-[15px] leading-relaxed text-muted-700 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-navy-200">
                {rule}
              </p>
            </Reveal>
          ))}
        </ul>
      </Chapter>

      {/* Awards ------------------------------------------------------------- */}
      <Chapter
        label="Awards"
        title="Awards"
        intro="The top three projects win cash prizes. Every participant receives a digital certificate, and approved projects are published in the online gallery."
      >
        <Podium />
      </Chapter>

      {/* Closing ------------------------------------------------------------ */}
      <section className="bg-[#d9d9d8] dark:bg-muted-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-center md:justify-between md:py-20">
          <div>
            <h2 className="text-3xl md:text-4xl">Ready to enter?</h2>
            <p className="mt-3 max-w-xl text-muted-700">
              Create an account, then upload your paper and poster before the deadline.
              {COMPETITION.contactEmail && (
                <>
                  {' '}
                  Questions? Email{' '}
                  <a href={`mailto:${COMPETITION.contactEmail}`} className="link-teal">
                    {COMPETITION.contactEmail}
                  </a>
                  .
                </>
              )}
            </p>
          </div>
          <Link to={entryLink} className="btn-primary shrink-0 px-7 py-3.5 text-[15px]">
            {user ? 'Open my entry' : 'Register now'}
          </Link>
        </div>
      </section>
    </>
  );
}
