/**
 * Editorial building blocks shared by the public pages.
 *
 * The site is art-directed like a research paper: numbered sections with a
 * margin rail, figures drawn from real competition data (schedule, rubric,
 * awards), and one signature motif — the bridge arch.
 */
import type { ReactNode } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { AWARDS, RUBRIC, RUBRIC_TOTAL, STAGES } from '@/config/competition';

export const EASE = [0.22, 1, 0.36, 1] as const;

/* ----------------------------------------------------------------------------
 * Reveal — fades a block up once when it scrolls into view.
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
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

/* ----------------------------------------------------------------------------
 * Chapter — a numbered section with a margin rail, like a paper's sections.
 * --------------------------------------------------------------------------*/

export function Chapter({
  n,
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
    <section
      id={id}
      className={`scroll-mt-24 border-t border-muted-200 ${tone === 'surface' ? 'bg-surface' : ''}`}
    >
      <div className="mx-auto grid max-w-7xl gap-x-12 gap-y-8 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[11rem_1fr]">
        <div className="lg:pt-2">
          <div className="lg:sticky lg:top-28">
            <p className="flex items-baseline gap-3 text-[13px] font-medium text-muted-500">
              {n && <span className="display text-2xl text-teal-600">{n}</span>}
              <span>{label}</span>
            </p>
          </div>
        </div>
        <div className="min-w-0">
          {(title || intro) && (
            <Reveal className="mb-12 max-w-3xl md:mb-16">
              {title && <h2 className="text-[2.6rem] leading-[1.02] md:text-6xl">{title}</h2>}
              {intro && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-600">{intro}</div>}
            </Reveal>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * The bridge arch — curiosity on one side, discovery on the other.
 * --------------------------------------------------------------------------*/

const ARCH = 'M 8 150 C 70 22, 330 22, 392 150';
const ARCH_X = [8, 70, 330, 392];
const ARCH_Y = [150, 22, 22, 150];
const HANGERS = [0.16, 0.3, 0.7, 0.84];

function bezier([p0, p1, p2, p3]: number[], t: number) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

export function BridgeArch({
  animate = true,
  traveller = true,
  stroke = 'gradient',
  className = 'h-full w-full',
}: {
  animate?: boolean;
  traveller?: boolean;
  stroke?: 'gradient' | 'faint';
  className?: string;
}) {
  const reduce = useReducedMotion();
  const draw = animate ? { initial: { pathLength: 0 }, animate: { pathLength: 1 } } : {};
  const id = stroke === 'gradient' ? 'arch-stroke' : undefined;
  return (
    <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMax meet" className={`overflow-visible ${className}`} aria-hidden>
      {id && (
        <defs>
          <linearGradient id={id} x1="0" x2="1">
            <stop offset="0" stopColor="#7ccbc2" />
            <stop offset="1" stopColor="#e6c25c" />
          </linearGradient>
        </defs>
      )}
      <motion.line
        x1="0"
        y1="150"
        x2="400"
        y2="150"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        {...draw}
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
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            initial={animate ? { opacity: 0 } : undefined}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: animate ? 1.3 + i * 0.08 : 0 }}
          />
        );
      })}
      <motion.path
        d={ARCH}
        fill="none"
        stroke={id ? `url(#${id})` : 'rgba(255,255,255,0.35)'}
        strokeWidth={stroke === 'gradient' ? 3 : 1.5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        {...draw}
        transition={{ duration: 1.3, ease: EASE, delay: 0.35 }}
      />
      {traveller && !reduce && (
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
const STAGE_COLORS = ['bg-teal-500', 'bg-navy-400', 'bg-brand-900 dark:bg-navy-300', 'bg-gold-400'];

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
      <figcaption className="mt-10 text-[13px] text-muted-500">
        Figure 1. The competition runs over seven weeks, from first registration to the published results.
      </figcaption>
    </figure>
  );
}

/* ----------------------------------------------------------------------------
 * Figure: the rubric as one proportional bar.
 * --------------------------------------------------------------------------*/

const RUBRIC_SHADES = ['bg-brand-900 dark:bg-navy-300', 'bg-navy-500', 'bg-teal-500', 'bg-teal-300', 'bg-gold-400', 'bg-muted-400'];
// Label colour per shade, chosen for contrast in both themes.
const RUBRIC_INK = ['text-white', 'text-white dark:text-ink', 'text-white', 'text-ink dark:text-white', 'text-ink', 'text-ink dark:text-white'];

export function RubricFigure({ caption = true }: { caption?: boolean }) {
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
            <span className={`display text-xl ${RUBRIC_INK[i % RUBRIC_INK.length]}`}>{r.points}</span>
          </motion.div>
        ))}
      </motion.div>
      <ol className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {RUBRIC.map((r, i) => (
          <li key={r.criterion} className="flex gap-3">
            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-sm ${RUBRIC_SHADES[i % RUBRIC_SHADES.length]}`} />
            <div>
              <p className="text-[15px] font-medium text-navy-950">
                {r.criterion} <span className="tabular-nums text-muted-500">· {r.points}</span>
              </p>
              <p className="mt-0.5 text-sm text-muted-500">{r.evaluates}</p>
            </div>
          </li>
        ))}
      </ol>
      {caption && (
        <figcaption className="mt-8 text-[13px] text-muted-500">
          Figure 2. How the {RUBRIC_TOTAL} points are weighted. Each bar is proportional to its share of the score.
        </figcaption>
      )}
    </figure>
  );
}

/* ----------------------------------------------------------------------------
 * Figure: the award podium.
 * --------------------------------------------------------------------------*/

export function Podium({ winners }: { winners?: Partial<Record<string, ReactNode>> }) {
  const order = [AWARDS[1], AWARDS[0], AWARDS[2]];
  const height: Record<string, string> = { first: 'h-80', second: 'h-64', third: 'h-52' };
  const accent: Record<string, string> = {
    first: 'border-t-gold-400',
    second: 'border-t-muted-400',
    third: 'border-t-[#c08552]',
  };
  return (
    <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
      {order.map((a, i) => (
        <motion.div
          key={a.key}
          initial={{ scaleY: 0.3, opacity: 0 }}
          whileInView={{ scaleY: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: EASE, delay: [0.15, 0, 0.3][i] }}
          style={{ originY: 1 }}
          className={`${height[a.key]} relative flex flex-col overflow-hidden rounded-t-md border-t-[3px] bg-navy-50 p-4 sm:p-7 ${accent[a.key]}`}
        >
          <span className="text-[13px] font-medium text-muted-600">{a.place}</span>
          <span className="display mt-3 text-4xl text-navy-950 sm:text-7xl">{a.prize}</span>
          <div className="mt-auto">
            <span className="text-sm font-medium text-navy-800 sm:text-base">{a.title}</span>
            {winners?.[a.key] && <div className="mt-3 border-t border-muted-300 pt-3">{winners[a.key]}</div>}
          </div>
          <span className="display pointer-events-none absolute -bottom-6 right-2 text-[7rem] leading-none text-navy-950/[0.05] sm:text-[11rem]">
            {['2', '1', '3'][i]}
          </span>
        </motion.div>
      ))}
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
          delay={Math.min(i, 6) * 0.03}
          className="grid grid-cols-[2.25rem_1fr] gap-3 border-b border-muted-300 py-5 text-[17px] leading-relaxed text-navy-900"
        >
          <span className={numbered ? 'display pt-px text-lg text-teal-600' : 'pt-[0.6em]'}>
            {numbered ? i + 1 : <span className="block h-px w-4 bg-teal-500" />}
          </span>
          <span>{item}</span>
        </Reveal>
      ))}
    </ol>
  );
}
