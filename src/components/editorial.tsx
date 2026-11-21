/**
 * Building blocks shared by the public pages: plain sections, the schedule
 * and rubric charts drawn from real competition data, and the awards list.
 * The one decorative motif is the atom from the logo (see Atom.tsx).
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { AtomOrbits } from '@/components/Atom';
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
    <section id={id} className={`scroll-mt-24 ${tone === 'surface' ? 'bg-surface' : ''}`}>
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
 * Awards: first to third, prize on the right.
 * --------------------------------------------------------------------------*/

export function Podium({ winners }: { winners?: Partial<Record<string, ReactNode>> }) {
  return (
    <ol className="divide-y divide-muted-200 overflow-hidden rounded-xl border border-muted-200 bg-surface">
      {AWARDS.map((a, i) => (
        <Reveal
          as="li"
          key={a.key}
          delay={0.1 * i}
          className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 px-5 py-6 transition-colors duration-300 hover:bg-navy-50 sm:gap-8 sm:px-8"
        >
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold transition-transform duration-300 group-hover:scale-110 ${
              i === 0 ? 'bg-ink text-white' : 'bg-navy-100 text-navy-950'
            }`}
          >
            {i + 1}
          </span>
          <div>
            <p className="text-lg font-semibold text-navy-950">{a.title}</p>
            <p className="text-sm text-muted-500">{a.place}</p>
            {winners?.[a.key] && <div className="mt-3">{winners[a.key]}</div>}
          </div>
          <CountUp value={a.prize} className="text-3xl font-semibold tabular-nums text-navy-950 sm:text-4xl" />
        </Reveal>
      ))}
    </ol>
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
