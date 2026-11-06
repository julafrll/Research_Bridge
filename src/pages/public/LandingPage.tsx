import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Presentation, Video, Trophy, Users, Scale, CalendarClock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeading } from '@/layouts/PublicLayout';
import { FEATURES } from '@/config/features';
import {
  COMPETITION,
  STAGES,
  RESEARCH_CATEGORIES,
  AWARDS,
  RUBRIC_TOTAL,
} from '@/config/competition';

export function LandingPage() {
  const { user, isAdmin } = useAuth();
  const entryLink = user ? (isAdmin ? '/admin/competition' : '/competition') : '/register';

  const materials = [
    {
      icon: FileText,
      title: 'Research paper',
      detail: '1,000–3,000 words, excluding references and appendices. PDF or Word.',
    },
    {
      icon: Presentation,
      title: 'Scientific poster',
      detail: 'Landscape PDF, about 16:9 or A1. Readable fonts, clear charts, credited images.',
    },
    ...(FEATURES.videos
      ? [
          {
            icon: Video,
            title: 'Video presentation',
            detail: '2–5 minutes, presenting your poster on camera in your own words.',
          },
        ]
      : []),
  ];

  const facts = [
    { value: String(RESEARCH_CATEGORIES.length), label: 'Research categories' },
    { value: '2+', label: 'Judges per project' },
    { value: String(RUBRIC_TOTAL), label: 'Point scoring rubric' },
    { value: '$500', label: 'In prizes' },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:py-28">
          <div>
            <p className="eyebrow-light">International Student Research Competition · {COMPETITION.edition}</p>
            <h1 className="mt-5 text-4xl leading-[1.15] text-white md:text-5xl md:leading-[1.15]">
              Share your research.
              <br />
              <span className="italic text-teal-200">Be judged by professionals.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-blue-100">{COMPETITION.summary}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to={entryLink}
                className="inline-flex items-center justify-center gap-2 rounded bg-white px-6 py-3 font-semibold text-navy-950 transition-colors hover:bg-blue-50"
              >
                {user ? 'Go to my entry' : 'Register & submit'} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/guidelines"
                className="inline-flex items-center justify-center gap-2 rounded border-2 border-white/70 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Read the guidelines
              </Link>
            </div>
            {COMPETITION.submissionDeadline && (
              <p className="mt-6 flex items-center gap-2 text-sm text-blue-200">
                <CalendarClock className="h-4 w-4 text-gold-300" />
                Submission deadline: <span className="font-semibold text-white">{COMPETITION.submissionDeadline}</span>
              </p>
            )}
          </div>
          <div className="hidden justify-center lg:flex">
            <div className="relative">
              <div className="absolute -inset-6 rounded-full border border-white/15" />
              <div className="absolute -inset-12 rounded-full border border-white/10" />
              <img
                src="/Research_Bridge_Logo-selection.png"
                alt="Research Bridge"
                className="relative h-64 w-64 rounded-full ring-4 ring-white/20 shadow-elevated"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Facts */}
      <section className="border-b border-muted-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:px-6 md:grid-cols-4">
          {facts.map((f) => (
            <div
              key={f.label}
              className="border-muted-200 py-8 text-center even:border-l md:border-l md:first:border-l-0"
            >
              <p className="font-serif text-3xl font-bold text-navy-900">{f.value}</p>
              <p className="mt-1 text-sm text-muted-500">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Important dates" title="How the competition runs" />
          <ol className="grid gap-px overflow-hidden rounded-md border border-muted-200 bg-muted-200 md:grid-cols-4">
            {STAGES.map((stage) => (
              <li key={stage.number} className="bg-white p-6">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-3xl font-bold text-teal-500">0{stage.number}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-500">{stage.when}</span>
                </div>
                <h3 className="mt-4 text-lg text-navy-950">{stage.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-600">{stage.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What to submit */}
      <section className="border-y border-muted-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Registration & submission"
            title="What you submit"
            action={
              <Link to="/guidelines" className="link-teal hidden text-sm sm:inline">
                Full guidelines →
              </Link>
            }
          />
          <div className={`grid gap-6 ${materials.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {materials.map((m) => (
              <div key={m.title} className="rounded-md border border-muted-200 bg-muted-50 p-7">
                <m.icon className="h-6 w-6 text-teal-600" />
                <h3 className="mt-4 text-xl text-navy-950">{m.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-600">{m.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-500">
            Register on Research Bridge, fill in your participant and project details, upload your files, and you will receive a
            unique submission ID. You can edit your entry until the deadline.
          </p>
        </div>
      </section>

      {/* Categories + judging */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Fields" title="Research categories" />
            <ul className="divide-y divide-muted-200 border-y border-muted-200">
              {RESEARCH_CATEGORIES.map((c, i) => (
                <li key={c} className="flex items-center gap-4 py-3.5">
                  <span className="w-6 font-serif text-sm text-teal-600">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-medium text-navy-900">{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="Fair evaluation" title="Transparent judging" />
            <div className="space-y-5">
              {[
                {
                  icon: Users,
                  t: 'At least two judges per project',
                  d: 'Researchers, teachers, engineers, and subject-matter experts score every project independently.',
                },
                {
                  icon: Scale,
                  t: `A standardized ${RUBRIC_TOTAL}-point rubric`,
                  d: 'Research question, scientific understanding, methodology, results, and originality.',
                },
                {
                  icon: Trophy,
                  t: 'Quality over resources',
                  d: 'Judges evaluate the research itself — not school prestige, expensive equipment, or background.',
                },
              ].map((x) => (
                <div key={x.t} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50">
                    <x.icon className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy-950">{x.t}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-600">{x.d}</p>
                  </div>
                </div>
              ))}
              <Link to="/about#judging" className="link-teal inline-block text-sm">
                See the full rubric →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="border-t border-muted-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Recognition" title="Awards & prizes" />
          <div className="grid gap-6 md:grid-cols-3">
            {AWARDS.map((a, i) => (
              <div
                key={a.key}
                className={`rounded-md border p-7 ${
                  i === 0 ? 'border-gold-300 bg-gold-50' : 'border-muted-200 bg-muted-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">{a.place}</span>
                  <Trophy className={`h-5 w-5 ${i === 0 ? 'text-gold-500' : 'text-gold-400'}`} />
                </div>
                <p className="mt-5 font-serif text-4xl font-bold text-navy-950">{a.prize}</p>
                <p className="mt-2 font-medium text-navy-800">{a.title}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-500">
            Every participant receives a digital certificate. Approved projects are published in the online research gallery.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-900 py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl text-white md:text-4xl">Ready to share your discovery?</h2>
          <p className="mt-4 text-lg text-blue-100">
            Students from every country and every field are welcome. Register, upload your work, and join a global
            community of young researchers.
          </p>
          <Link
            to={entryLink}
            className="mt-9 inline-flex items-center gap-2 rounded bg-white px-7 py-3 font-semibold text-navy-950 transition-colors hover:bg-blue-50"
          >
            {user ? 'Go to my entry' : 'Register now'} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
