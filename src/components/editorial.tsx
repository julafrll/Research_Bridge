/**
 * Building blocks shared by the public pages: plain sections, the schedule
 * and rubric charts drawn from real competition data, and the awards list.
 * The one decorative motif is the atom from the logo (see Atom.tsx).
 */
import type { ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { AtomOrbits } from '@/components/Atom';
import { AWARDS, RUBRIC, STAGES } from '@/config/competition';

export const EASE = [0.22, 1, 0.36, 1] as const;

/* ----------------------------------------------------------------------------
 * Reveal — kept for existing markup. Sections no longer fade in on scroll;
 * the only entrance animation on the site is the hero atom.
 * --------------------------------------------------------------------------*/

export function Reveal({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'section';
}) {
  const Comp = as;
  return <Comp className={className}>{children}</Comp>;
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
          <div className="mb-10 max-w-3xl md:mb-14">
            <h2 className="text-3xl md:text-[2.6rem]">{title ?? label}</h2>
            {intro && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-600">{intro}</div>}
          </div>
        )}
        {children}
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
  return (
    <figure>
      {/* Wide screens: Gantt */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-7 border-b border-muted-300 pb-3 text-[13px] text-muted-500">
          {weeks.map((w) => (
            <span key={w}>Week {w}</span>
          ))}
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
                  <motion.div
                    className="relative"
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
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-navy-950">{STAGE_SHORT[i]}</span>
                        <span className={`h-4 w-4 rotate-45 ${STAGE_COLORS[i]}`} />
                      </div>
                    ) : (
                      <div className={`flex h-11 items-center rounded-md px-4 ${STAGE_COLORS[i]}`}>
                        <span className={`truncate text-sm font-medium ${i === 1 ? 'text-ink dark:text-white' : 'text-white'}`}>{STAGE_SHORT[i]}</span>
                      </div>
                    )}
                  </motion.div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Descriptions (all sizes) */}
      <ol className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:mt-10 lg:grid-cols-4">
        {STAGES.map((s, i) => (
          <Reveal as="li" key={s.number} delay={0.06 * i} className="border-t border-muted-300 pt-4 lg:border-t-0 lg:pt-0">
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-sm ${STAGE_COLORS[i]} ${i === 3 ? 'rotate-45' : ''}`} />
              <span className="text-[13px] font-medium text-muted-500">{s.when}</span>
            </div>
            <h3 className="mt-2 text-lg text-navy-950">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-600">{s.description}</p>
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
  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item: Variants = {
    hidden: { scaleX: 0, opacity: 0 },
    show: { scaleX: 1, opacity: 1, transition: { duration: 0.7, ease: EASE } },
  };
  return (
    <figure>
      <motion.div
        className="flex h-14 gap-1 overflow-hidden rounded-md"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        {RUBRIC.map((r, i) => (
          <motion.div
            key={r.criterion}
            variants={item}
            style={{ flexGrow: r.points, originX: 0 }}
            className={`flex basis-0 items-end px-2.5 pb-2 ${RUBRIC_SHADES[i % RUBRIC_SHADES.length]}`}
            title={`${r.criterion}: ${r.points} points`}
          >
            <span className={`text-lg font-semibold ${RUBRIC_INK[i % RUBRIC_INK.length]}`}>{r.points}</span>
          </motion.div>
        ))}
      </motion.div>
      <ol className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {RUBRIC.map((r, i) => (
          <li key={r.criterion} className="flex gap-3">
            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-sm ${RUBRIC_SHADES[i % RUBRIC_SHADES.length]}`} />
            <div>
              <p className="text-[15px] font-medium text-navy-950">
                {r.criterion} <span className="tabular-nums text-muted-500">({r.points} points)</span>
              </p>
              <p className="mt-0.5 text-sm text-muted-500">{r.evaluates}</p>
            </div>
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
        <li key={a.key} className="grid grid-cols-[auto_1fr_auto] items-center gap-5 px-5 py-6 sm:gap-8 sm:px-8">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold ${
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
          <span className="text-3xl font-semibold tabular-nums text-navy-950 sm:text-4xl">{a.prize}</span>
        </li>
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
