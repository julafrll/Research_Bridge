/**
 * Interactive content blocks for the inner pages: icon cards, a step list
 * whose connecting line fills as you scroll, research-field chips, a
 * pre-submission checklist and a copyable email card.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { Atom, Check, Copy, Cpu, Dna, FlaskConical, Globe2, Mail, RotateCcw, Sigma, type LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/editorial';
import { RESEARCH_CATEGORIES } from '@/config/competition';

/* ----------------------------------------------------------------------------
 * Icon cards
 * --------------------------------------------------------------------------*/

export interface IconItem {
  icon: LucideIcon;
  text: ReactNode;
  title?: string;
}

/** Grid of cards, each with a round icon; cards lift and the icon turns on hover. */
export function IconCards({ items, columns = 3 }: { items: IconItem[]; columns?: 2 | 3 }) {
  return (
    <ul className={`grid gap-4 sm:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : ''}`}>
      {items.map(({ icon: Icon, text, title }, i) => (
        <Reveal as="li" key={i} delay={0.05 * i} className="h-full">
          <div className="group flex h-full gap-4 rounded-xl border border-muted-200 bg-surface p-5 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-card-hover sm:block sm:p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-100 text-navy-950 transition-[background-color,color,transform] duration-500 group-hover:-rotate-12 group-hover:scale-110 group-hover:bg-ink group-hover:text-white">
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div>
              {title && <p className="text-lg font-semibold text-navy-950 sm:mt-5">{title}</p>}
              <p className={`${title ? 'mt-1.5 text-[15px] text-muted-600' : 'pt-2.5 text-[16px] text-navy-900 sm:mt-5 sm:pt-0'} leading-relaxed`}>
                {text}
              </p>
            </div>
          </div>
        </Reveal>
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------------------------
 * Steps with a connecting line that fills as the list scrolls past
 * --------------------------------------------------------------------------*/

export function StepList({ items }: { items: readonly ReactNode[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <ol ref={ref} className="relative">
      {/* track and fill, behind the number circles */}
      <span className="absolute bottom-6 left-[1.1875rem] top-6 w-0.5 rounded-full bg-muted-200" aria-hidden />
      <motion.span
        className="absolute bottom-6 left-[1.1875rem] top-6 w-0.5 origin-top rounded-full bg-ink dark:bg-navy-500"
        style={{ scaleY: reduce ? 1 : fill }}
        aria-hidden
      />
      {items.map((item, i) => (
        <Reveal as="li" key={i} delay={Math.min(i, 6) * 0.04} className="relative flex gap-5 py-3">
          <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-surface text-sm font-semibold text-navy-950 dark:border-navy-500">
            {i + 1}
          </span>
          <span className="pt-2 text-[16px] leading-relaxed text-navy-900">{item}</span>
        </Reveal>
      ))}
    </ol>
  );
}

/* ----------------------------------------------------------------------------
 * Research field chips
 * --------------------------------------------------------------------------*/

const FIELD_ICONS: LucideIcon[] = [Dna, FlaskConical, Atom, Cpu, Sigma, Globe2];

export function FieldChips() {
  return (
    <ul className="flex flex-wrap gap-3">
      {RESEARCH_CATEGORIES.map((c, i) => {
        const Icon = FIELD_ICONS[i] ?? Atom;
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
  );
}

/* ----------------------------------------------------------------------------
 * Before-you-submit checklist (ticks are remembered in this browser)
 * --------------------------------------------------------------------------*/

const CHECKLIST_KEY = 'rb-submit-checklist';

function loadChecked(): string[] {
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function SubmitChecklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<string[]>(loadChecked);
  const done = items.filter((i) => checked.includes(i)).length;
  const pct = items.length ? done / items.length : 0;
  const complete = done === items.length;

  useEffect(() => {
    try {
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checked));
    } catch {
      /* storage unavailable: ticks just won't be remembered */
    }
  }, [checked]);

  const toggle = (item: string) =>
    setChecked((cur) => (cur.includes(item) ? cur.filter((c) => c !== item) : [...cur, item]));

  const r = 28;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="grid gap-8 rounded-2xl border border-muted-200 bg-surface p-6 md:grid-cols-[auto_1fr] md:gap-12 md:p-10">
      <div className="flex items-center gap-5 md:flex-col md:items-start">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-muted-200" />
            <motion.circle
              cx="32"
              cy="32"
              r={r}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              className={complete ? 'stroke-[#3e8b78]' : 'stroke-ink dark:stroke-navy-500'}
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference * (1 - pct) }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-navy-950">
            {done}/{items.length}
          </span>
        </div>
        <div className="max-w-[14rem]">
          <p className="font-semibold text-navy-950" aria-live="polite">
            {complete ? 'Ready to submit' : `${items.length - done} left to check`}
          </p>
          <p className="mt-1 text-sm text-muted-500">Your ticks are saved in this browser.</p>
          {done > 0 && (
            <button
              type="button"
              onClick={() => setChecked([])}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear all
            </button>
          )}
        </div>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const on = checked.includes(item);
          return (
            <li key={item}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(item)}
                className={`flex h-full w-full items-start gap-3 rounded-xl border p-4 text-left transition-[background-color,border-color] duration-200 ${
                  on ? 'border-navy-200 bg-navy-50' : 'border-muted-200 hover:border-navy-200 hover:bg-navy-50/60'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-200 ${
                    on ? 'border-ink bg-ink text-white dark:border-navy-500 dark:bg-navy-500' : 'border-muted-300'
                  }`}
                >
                  <motion.span initial={false} animate={{ scale: on ? 1 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </motion.span>
                </span>
                <span className={`text-[15px] leading-snug ${on ? 'text-muted-500 line-through decoration-muted-400' : 'text-navy-900'}`}>
                  {item}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Email card with a copy button
 * --------------------------------------------------------------------------*/

export function EmailCard({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };
  return (
    <div className="min-w-0 rounded-2xl bg-ink p-7 text-white md:p-9">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
        <Mail className="h-5 w-5" />
      </span>
      <p className="mt-6 text-blue-100">Email the organizing team</p>
      <a href={`mailto:${email}`} className="mt-1 block text-xl font-semibold [overflow-wrap:anywhere] hover:underline sm:text-2xl">
        {email}
      </a>
      <div className="mt-7 flex flex-wrap gap-3">
        <a href={`mailto:${email}`} className="btn-light px-5 py-2.5 text-sm">
          Write an email
        </a>
        <button type="button" onClick={copy} className="btn-outline-light px-5 py-2.5 text-sm" aria-live="polite">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy address'}
        </button>
      </div>
    </div>
  );
}
