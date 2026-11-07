import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Atom,
  CalendarClock,
  Cpu,
  Dna,
  FileText,
  FlaskConical,
  Globe2,
  Medal,
  Presentation,
  Scale,
  Sigma,
  Trophy,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { HeroBackdrop, SectionHeading } from '@/layouts/PublicLayout';
import { FEATURES } from '@/config/features';
import { COMPETITION, STAGES, RESEARCH_CATEGORIES, AWARDS, RUBRIC_TOTAL } from '@/config/competition';

const CATEGORY_ICONS: LucideIcon[] = [Dna, FlaskConical, Atom, Cpu, Sigma, Globe2];

const MEDALS = [
  { ring: 'border-gold-300 dark:border-gold-400/60', bg: 'bg-gold-50', icon: 'text-gold-500', label: 'text-gold-700' },
  { ring: 'border-muted-300', bg: 'bg-muted-100', icon: 'text-muted-500', label: 'text-muted-600' },
  { ring: 'border-[#d9b38c] dark:border-[#8a5a33]', bg: 'bg-[#fbf3ec] dark:bg-[#2a1d14]', icon: 'text-[#b4753f]', label: 'text-[#8a5a33] dark:text-[#d9a77a]' },
];

export function LandingPage() {
  const { user, isAdmin } = useAuth();
  const entryLink = user ? (isAdmin ? '/admin/competition' : '/competition') : '/register';

  const materials = [
    { icon: FileText, title: 'Research paper', detail: '1,000–3,000 words, excluding references and appendices. PDF or Word.' },
    { icon: Presentation, title: 'Scientific poster', detail: 'Landscape PDF, about 16:9 or A1. Readable fonts, clear charts, credited images.' },
    ...(FEATURES.videos
      ? [{ icon: Video, title: 'Video presentation', detail: '2–5 minutes, presenting your poster on camera in your own words.' }]
      : []),
  ];

  const facts = [
    { value: String(RESEARCH_CATEGORIES.length), label: 'Research fields' },
    { value: '2+', label: 'Judges per project' },
    { value: String(RUBRIC_TOTAL), label: 'Point rubric' },
    { value: '$500', label: 'In prizes' },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <HeroBackdrop />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-32 pt-20 sm:px-6 lg:grid-cols-[1.25fr_1fr] lg:pb-40 lg:pt-28">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-blue-100 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4daea5] shadow-[0_0_0_3px_rgba(77,174,165,0.25)]" />
              {COMPETITION.submissionsOpen ? 'Submissions open' : 'Submissions closed'} · {COMPETITION.edition}
            </span>
            <h1 className="mt-6 text-[2.6rem] leading-[1.1] text-white md:text-6xl md:leading-[1.08]">
              Share your research.
              <br />
              <span className="italic text-aqua-200">Be judged by professionals.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-blue-100/90">{COMPETITION.summary}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to={entryLink}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-brand-950 shadow-elevated transition-all hover:-translate-y-0.5 hover:bg-blue-50"
              >
                {user ? 'Go to my entry' : 'Register & submit'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/guidelines"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10"
              >
                Read the guidelines
              </Link>
            </div>
            {COMPETITION.submissionDeadline && (
              <p className="mt-6 flex items-center gap-2 text-sm text-blue-200">
                <CalendarClock className="h-4 w-4 text-[#e6c25c]" />
                Submission deadline: <span className="font-semibold text-white">{COMPETITION.submissionDeadline}</span>
              </p>
            )}
          </div>

          {/* Visual: logo + floating entry card */}
          <div className="relative hidden h-[22rem] lg:block">
            <div className="absolute right-6 top-0">
              <div className="absolute -inset-8 rounded-full border border-white/10" />
              <div className="absolute -inset-16 rounded-full border border-white/[0.06]" />
              <img
                src={`${import.meta.env.BASE_URL}Research_Bridge_Logo-selection.png`}
                alt="Research Bridge"
                className="relative h-56 w-56 rounded-full shadow-elevated ring-4 ring-white/15"
              />
            </div>
            <div className="absolute bottom-0 left-0 w-72 rounded-2xl border border-white/15 bg-white/10 p-5 shadow-elevated backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-blue-200">Example entry</span>
                <span className="rounded-full bg-[#4daea5]/20 px-2 py-0.5 text-[11px] font-semibold text-aqua-200">
                  Eligible — in judging
                </span>
              </div>
              <p className="mt-3 font-serif text-[15px] font-bold leading-snug text-white">
                Microplastic uptake in freshwater algae
              </p>
              <p className="mt-1 text-xs text-blue-200">Biology and Life Sciences</p>
              <div className="mt-4 flex gap-2">
                {['Paper', 'Poster'].map((f) => (
                  <span key={f} className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] text-blue-100">
                    <FileText className="h-3 w-3" /> {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facts — overlaps the hero */}
      <section className="relative z-10 -mt-20 px-4 sm:px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 overflow-hidden rounded-2xl border border-muted-200 bg-surface shadow-elevated md:grid-cols-4">
          {facts.map((f, i) => (
            <div
              key={f.label}
              className={`px-4 py-7 text-center ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t md:border-t-0' : ''} ${i === 2 ? 'md:border-l' : ''} border-muted-200`}
            >
              <p className="font-serif text-3xl font-bold text-navy-950 md:text-4xl">{f.value}</p>
              <p className="mt-1.5 text-sm text-muted-500">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Important dates" title="How the competition runs" />
          <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
            <div className="absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-teal-400 via-navy-300 to-gold-400 md:block" />
            {STAGES.map((stage) => (
              <li key={stage.number} className="relative">
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-muted-50 bg-brand-900 text-sm font-bold text-white dark:bg-teal-500 dark:text-muted-50">
                  {stage.number}
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-teal-600">{stage.when}</p>
                <h3 className="mt-1.5 text-lg text-navy-950">{stage.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-600">{stage.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What to submit */}
      <section className="border-y border-muted-200 bg-surface py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow">Registration & submission</p>
            <h2 className="mt-3 text-3xl text-navy-950">What you submit</h2>
            <p className="mt-4 leading-relaxed text-muted-600">
              Create an account, fill in your participant and project details, and upload your files. You get a unique
              submission ID and can edit your entry until the deadline.
            </p>
            <Link to="/guidelines" className="link-teal mt-6 inline-flex items-center gap-1 text-sm">
              Full submission guidelines <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {materials.map((m) => (
              <div
                key={m.title}
                className="group rounded-2xl border border-muted-200 bg-muted-50 p-7 transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-card-hover"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-500 group-hover:text-white">
                  <m.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl text-navy-950">{m.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-600">{m.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Fields" title="Research categories" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RESEARCH_CATEGORIES.map((c, i) => {
              const Icon = CATEGORY_ICONS[i] ?? Atom;
              return (
                <div
                  key={c}
                  className="flex items-center gap-4 rounded-xl border border-muted-200 bg-surface p-5 transition-all hover:border-navy-300 hover:shadow-card"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium leading-snug text-navy-900">{c}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Judging */}
      <section className="border-y border-muted-200 bg-surface py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Fair evaluation"
            title="Transparent judging"
            action={
              <Link to="/about#judging" className="link-teal hidden text-sm sm:inline">
                See the full rubric →
              </Link>
            }
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Users, t: 'Two judges or more', d: 'Researchers, teachers, engineers and subject experts score every project independently.' },
              { icon: Scale, t: `A ${RUBRIC_TOTAL}-point rubric`, d: 'Research question, scientific understanding, methodology, results and originality.' },
              { icon: Trophy, t: 'Quality over resources', d: 'Judges evaluate the research itself — not school prestige, equipment budget or background.' },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl bg-muted-50 p-7">
                <x.icon className="h-6 w-6 text-teal-600" />
                <h3 className="mt-4 font-sans text-lg font-semibold text-navy-950">{x.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-600">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Recognition" title="Awards & prizes" />
          <div className="grid gap-6 md:grid-cols-3">
            {AWARDS.map((a, i) => {
              const m = MEDALS[i];
              return (
                <div key={a.key} className={`relative overflow-hidden rounded-2xl border-2 ${m.ring} ${m.bg} p-7`}>
                  <Medal className={`absolute -right-4 -top-4 h-28 w-28 opacity-[0.12] ${m.icon}`} />
                  <span className={`text-xs font-bold uppercase tracking-[0.18em] ${m.label}`}>{a.place}</span>
                  <p className="mt-5 font-serif text-5xl font-bold text-navy-950">{a.prize}</p>
                  <p className="mt-2 font-medium text-navy-800">{a.title}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-sm text-muted-500">
            Every participant receives a digital certificate. Approved projects are published in the online research gallery.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-brand-950 px-6 py-16 text-center text-white md:py-20">
          <HeroBackdrop />
          <div className="relative">
            <h2 className="text-3xl text-white md:text-4xl">Ready to share your discovery?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100/90">
              Students from every country and every field are welcome. Join a global community of young researchers.
            </p>
            <Link
              to={entryLink}
              className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-brand-950 shadow-elevated transition-all hover:-translate-y-0.5 hover:bg-blue-50"
            >
              {user ? 'Go to my entry' : 'Register now'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
