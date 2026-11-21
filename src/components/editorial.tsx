/**
 * Building blocks shared by the public pages: plain sections, the schedule
 * and rubric charts drawn from real competition data, and the awards list.
 * The one decorative motif is the atom from the logo (see Atom.tsx).
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { AtomMark, AtomOrbits } from '@/components/Atom';
import { AWARDS, RUBRIC, STAGES } from '@/config/competition';

export const EASE = [0.22, 1, 0.36, 1] as const;

/* ----------------------------------------------------------------------------
 * Reveal — slides a block up into place the first time it scrolls into view.
 * Shown at rest when the visitor prefers reduced motion.
 * --------------------------------------------------------------------------*/

export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'section';
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

/* ----------------------------------------------------------------------------
 * CountUp — counts a number up from zero once it scrolls into view.
 * Keeps any prefix/suffix, e.g. "$250".
 * --------------------------------------------------------------------------*/

const NUMBER_PARTS = /^(\D*)([\d,]+)(.*)$/;

export function CountUp({ value, className, duration = 1.2 }: { value: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  const match = value.match(NUMBER_PARTS);
  const target = match ? Number(match[2].replace(/,/g, '')) : 0;
  const hasNumber = Boolean(match);
  const [shown, setShown] = useState(target);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || reduce || !hasNumber || started.current) return;
    started.current = true;
    const controls = animate(0, target, {
      duration,
      ease: EASE,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, target, duration, hasNumber]);

  if (!match) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={className} aria-label={value}>
      {match[1]}
      {(inView || reduce ? shown : 0).toLocaleString('en-US')}
      {match[3]}
    </span>
  );
}

/* ----------------------------------------------------------------------------
 * Chapter — a page section: heading, short intro, content. Sections without a
 * title or intro bring their own heading in `children`; `label` names the
 * section only when an intro is given without a title. `n` is accepted for
 * old call sites.
 * --------------------------------------------------------------------------*/

export function Chapter({
  label,
  title,
  intro,
  children,
  tone = 'paper',
  id,
}: {
  n?: string;
  label: string;
  title?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  tone?: 'paper' | 'surface';
  id?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-32 ${tone === 'surface' ? 'bg-surface' : ''}`}>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
        {(title || intro) && (
          <Reveal className="mb-10 max-w-3xl md:mb-14">
            <h2 className="text-3xl md:text-[2.6rem]">{title ?? label}</h2>
            {intro && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-600">{intro}</div>}
          </Reveal>
        )}
        <Reveal delay={0.08}>{children}</Reveal>
      </div>
    </section>
  );
}

/** Kept for old call sites: the faint, static atom orbits. */
export function BridgeArch({ className = 'h-full w-full' }: { animate?: boolean; traveller?: boolean; stroke?: string; className?: string }) {
  return <AtomOrbits animate={false} className={className} />;
}

/* ----------------------------------------------------------------------------
 * Figure: the seven-week schedule as a Gantt strip.
 * --------------------------------------------------------------------------*/

// Week spans for each stage (start inclusive, end inclusive, 1-based).
const STAGE_SPANS: [number, number][] = [
  [1, 3],
  [4, 4],
  [5, 7],
  [7, 7],
];
const STAGE_SHORT = ['Registration and submission', 'Quality check', 'Judging', 'Results'];
const STAGE_COLORS = ['bg-ink', 'bg-navy-200', 'bg-navy-600 dark:bg-navy-400', 'bg-navy-500'];

export function ScheduleFigure() {
  const weeks = [1, 2, 3, 4, 5, 6, 7];
  // The stage being pointed at or tapped; its bar and description light up together.
  const [active, setActive] = useState<number | null>(null);
  const dim = (i: number) => active !== null && active !== i;
  const bind = (i: number) => ({
    onMouseEnter: () => setActive(i),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(i),
    onBlur: () => setActive(null),
    onClick: () => setActive((cur) => (cur === i ? null : i)),
  });

  return (
    <figure>
      {/* Wide screens: Gantt */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-7 border-b border-muted-300 pb-3 text-[13px] text-muted-500">
          {weeks.map((w) => {
            const lit = active !== null && w >= STAGE_SPANS[active][0] && w <= STAGE_SPANS[active][1];
            return (
              <span key={w} className={`transition-colors duration-300 ${lit ? 'font-semibold text-navy-950' : ''}`}>
                Week {w}
              </span>
            );
          })}
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 grid grid-cols-7">
            {weeks.map((w) => (
              <div key={w} className="border-l border-dashed border-muted-200 first:border-l-0" />
            ))}
          </div>
          <ol className="relative space-y-3 py-5">
            {STAGES.map((s, i) => {
              const [a, b] = STAGE_SPANS[i];
              const isMilestone = i === 3;
              return (
                <li key={s.number} className="grid grid-cols-7 items-center">
                  <motion.button
                    type="button"
                    {...bind(i)}
                    aria-label={`${s.title}, ${s.when}`}
                    className="relative cursor-pointer text-left"
                    style={{
                      gridColumn: `${a} / ${b + 1}`,
                      justifySelf: isMilestone ? 'end' : 'stretch',
                      originX: 0,
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.12 * i }}
                  >
                    {isMilestone ? (
                      <span className={`flex items-center gap-3 transition-opacity duration-300 ${dim(i) ? 'opacity-35' : ''}`}>
                        <span className="text-sm font-medium text-navy-950">{STAGE_SHORT[i]}</span>
                        <span
                          className={`h-4 w-4 rotate-45 transition-transform duration-300 ${STAGE_COLORS[i]} ${active === i ? 'scale-125' : ''}`}
                        />
                      </span>
                    ) : (
                      <span
                        className={`flex h-11 items-center rounded-full px-5 shadow-sm transition-[transform,box-shadow,opacity] duration-300 ${STAGE_COLORS[i]} ${
                          active === i ? '-translate-y-0.5 shadow-card-hover' : ''
                        } ${dim(i) ? 'opacity-35' : ''}`}
                      >
                        <span className={`truncate text-sm font-medium ${i === 1 ? 'text-ink dark:text-white' : 'text-white'}`}>
                          {STAGE_SHORT[i]}
                        </span>
                      </span>
                    )}
                  </motion.button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Descriptions (all sizes); tap one on mobile to highlight it */}
      <ol className="grid gap-4 md:grid-cols-2 lg:mt-8 lg:grid-cols-4">
        {STAGES.map((s, i) => (
          <Reveal as="li" key={s.number} delay={0.06 * i}>
            <button
              type="button"
              {...bind(i)}
              className={`h-full w-full rounded-xl border p-5 text-left transition-[border-color,background-color,opacity,transform] duration-300 ${
                active === i
                  ? '-translate-y-1 border-navy-300 bg-surface shadow-card-hover'
                  : 'border-transparent bg-transparent hover:bg-surface'
              } ${dim(i) ? 'opacity-50' : 'opacity-100'}`}
            >
              <span className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${STAGE_COLORS[i]} ${i === 3 ? 'rotate-45 rounded-none' : ''}`} />
                <span className="text-[13px] font-medium text-muted-500">{s.when}</span>
              </span>
              <span className="mt-2 block text-lg font-semibold text-navy-950">{s.title}</span>
              <span className="mt-2 block text-[15px] leading-relaxed text-muted-600">{s.description}</span>
            </button>
          </Reveal>
        ))}
      </ol>
    </figure>
  );
}

/* ----------------------------------------------------------------------------
 * Figure: the rubric as one proportional bar.
 * --------------------------------------------------------------------------*/

// Five steps from Bridge blue to periwinkle; labels chosen for contrast.
const RUBRIC_SHADES = ['bg-ink', 'bg-[#3e5f95]', 'bg-[#56709c]', 'bg-[#7c94b8]', 'bg-[#b1bbcb]', 'bg-[#d9d9d8]'];
const RUBRIC_INK = ['text-white', 'text-white', 'text-white', 'text-white', 'text-ink', 'text-ink'];

export function RubricFigure() {
  const [active, setActive] = useState<number | null>(null);
  const total = RUBRIC.reduce((sum, r) => sum + r.points, 0);
  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item: Variants = {
    hidden: { scaleX: 0, opacity: 0 },
    show: { scaleX: 1, opacity: 1, transition: { duration: 0.7, ease: EASE } },
  };
  const bind = (i: number) => ({
    onMouseEnter: () => setActive(i),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(i),
    onBlur: () => setActive(null),
    onClick: () => setActive((cur) => (cur === i ? null : i)),
  });
  const current = active === null ? null : RUBRIC[active];

  return (
    <figure>
      <div className="mb-4 flex min-h-[1.75rem] items-baseline justify-between gap-4" aria-live="polite">
        <p className="text-[15px] text-muted-600">
          {current ? (
            <>
              <span className="font-semibold text-navy-950">{current.criterion}</span> is{' '}
              {Math.round((current.points / total) * 100)}% of the score
            </>
          ) : (
            'Hover over or tap a part of the bar to see what it covers.'
          )}
        </p>
        <p className="shrink-0 text-sm text-muted-500">
          <span className="font-semibold text-navy-950">{current ? current.points : total}</span>
          {current ? ` of ${total}` : ''} points
        </p>
      </div>
      <motion.div
        className="flex h-16 gap-1 overflow-hidden rounded-full"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        {RUBRIC.map((r, i) => (
          <motion.button
            type="button"
            key={r.criterion}
            {...bind(i)}
            variants={item}
            style={{ flexGrow: r.points, originX: 0 }}
            className="flex basis-0 cursor-pointer"
            aria-label={`${r.criterion}: ${r.points} points`}
          >
            <span
              className={`flex h-full w-full items-center justify-center transition-opacity duration-300 ${
                RUBRIC_SHADES[i % RUBRIC_SHADES.length]
              } ${active !== null && active !== i ? 'opacity-30' : ''}`}
            >
              <span className={`text-lg font-semibold ${RUBRIC_INK[i % RUBRIC_INK.length]}`}>{r.points}</span>
            </span>
          </motion.button>
        ))}
      </motion.div>
      <ol className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {RUBRIC.map((r, i) => (
          <li key={r.criterion}>
            <button
              type="button"
              {...bind(i)}
              className={`flex h-full w-full gap-3 rounded-lg p-3 text-left transition-[background-color,opacity] duration-300 ${
                active === i ? 'bg-navy-100' : 'hover:bg-navy-50'
              } ${active !== null && active !== i ? 'opacity-50' : ''}`}
            >
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${RUBRIC_SHADES[i % RUBRIC_SHADES.length]}`} />
              <span>
                <span className="block text-[15px] font-medium text-navy-950">
                  {r.criterion} <span className="tabular-nums text-muted-500">({r.points} points)</span>
                </span>
                <span className="mt-0.5 block text-sm text-muted-500">{r.evaluates}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/* ----------------------------------------------------------------------------
 * Awards podium: 2nd, 1st, 3rd on steps of different heights. The steps rise
 * from the floor when scrolled into view, then the prizes count up.
 * --------------------------------------------------------------------------*/

const PODIUM_ORDER = [1, 0, 2] as const; // indexes into AWARDS: 2nd, 1st, 3rd
const STEP_HEIGHT = ['h-44 sm:h-60 lg:h-72', 'h-32 sm:h-44 lg:h-52', 'h-24 sm:h-32 lg:h-36'];
const STEP_COLOR = ['bg-ink', 'bg-[#56709c]', 'bg-[#7c94b8]'];
// Rise order by place: 3rd, then 2nd, then 1st last and tallest.
const STEP_DELAY = [0.35, 0.18, 0];

export function Podium({ winners }: { winners?: Partial<Record<string, ReactNode>> }) {
  const reduce = useReducedMotion();
  return (
    <div className="mx-auto max-w-4xl">
      <ol className="grid grid-cols-3 items-end gap-2 sm:gap-4">
        {PODIUM_ORDER.map((place) => {
          const a = AWARDS[place];
          const first = place === 0;
          const delay = STEP_DELAY[place];
          return (
            <li key={a.key} className="group flex flex-col items-center text-center">
              {/* What's on the step: medal, prize, title, winner */}
              <motion.div
                className="mb-4 flex w-full flex-col items-center px-1 sm:mb-5"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease: EASE, delay: delay + 0.55 }}
              >
                <div className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-1.5">
                  {first && (
                    <motion.div
                      className="mb-3"
                      animate={reduce ? undefined : { y: [0, -6, 0] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <AtomMark className="h-10 w-10 drop-shadow-md sm:h-14 sm:w-14" />
                    </motion.div>
                  )}
                  <CountUp
                    value={a.prize}
                    className={`font-semibold tabular-nums text-navy-950 ${
                      first ? 'text-3xl sm:text-5xl lg:text-6xl' : 'text-2xl sm:text-4xl lg:text-5xl'
                    }`}
                  />
                  <p className="mt-1.5 text-xs font-semibold leading-snug text-navy-950 sm:text-base">{a.title}</p>
                  {winners?.[a.key] && <div className="mt-3 w-full text-left">{winners[a.key]}</div>}
                </div>
              </motion.div>

              {/* The step */}
              <motion.div
                className={`relative w-full overflow-hidden rounded-t-2xl ${STEP_HEIGHT[place]} ${STEP_COLOR[place]}`}
                style={{ originY: 1 }}
                initial={reduce ? false : { scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, ease: EASE, delay }}
              >
                {/* top highlight, like light catching the edge of the step */}
                <span className="absolute inset-x-0 top-0 h-1.5 bg-white/25" aria-hidden />
                <span
                  className={`absolute inset-x-0 top-3 text-center font-semibold leading-none text-white/90 sm:top-5 ${
                    first ? 'text-6xl sm:text-8xl' : 'text-5xl sm:text-7xl'
                  }`}
                  aria-hidden
                >
                  {place + 1}
                </span>
                <span className="absolute inset-x-0 bottom-3 text-center text-[11px] font-medium text-white/75 sm:bottom-4 sm:text-sm">
                  {a.place}
                </span>
              </motion.div>
            </li>
          );
        })}
      </ol>
      {/* floor */}
      <div className="h-3 rounded-b-xl bg-[#d9d9d8] dark:bg-muted-200" aria-hidden />
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Ruled list — hairline rows instead of icon bullets.
 * --------------------------------------------------------------------------*/

export function RuledList({ items, numbered = false }: { items: readonly ReactNode[]; numbered?: boolean }) {
  return (
    <ol className="border-t border-muted-300">
      {items.map((item, i) => (
        <Reveal
          as="li"
          key={i}
                    delay={Math.min(i, 6) * 0.04}
          className="grid grid-cols-[2.25rem_1fr] gap-3 border-b border-muted-300 py-5 text-[17px] leading-relaxed text-navy-900"
        >
          <span className={numbered ? 'pt-px text-lg font-semibold text-teal-600' : 'pt-[0.65em]'}>
            {numbered ? i + 1 : <span className="block h-2 w-2 rounded-full bg-navy-400" />}
          </span>
          <span>{item}</span>
        </Reveal>
      ))}
    </ol>
  );
}

/* ----------------------------------------------------------------------------
 * RiseHeading — a page title that rises in word by word on first load.
 * --------------------------------------------------------------------------*/

export function RiseHeading({ text, className, delay = 0.1 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <h1 className={className}>{text}</h1>;
  const words = text.split(' ');
  return (
    <h1 className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: delay + i * 0.07 }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </h1>
  );
}
