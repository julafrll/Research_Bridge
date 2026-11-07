import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Plus } from 'lucide-react';
import { PageMasthead } from '@/layouts/PublicLayout';
import { Chapter, EASE, Podium, Reveal } from '@/components/editorial';
import { COMPETITION, FAQ, JUDGES } from '@/config/competition';
import { fetchGallery } from '@/lib/competition';
import { initials } from '@/lib/utils';
import type { GalleryProject } from '@/types/competition';

/* ----------------------------------------------------------------------------
 * Judges
 * --------------------------------------------------------------------------*/

const JUDGE_BACKGROUNDS = ['Researchers', 'University students with relevant expertise', 'Teachers', 'Engineers', 'Scientists'];

export function JudgesPage() {
  return (
    <>
      <PageMasthead
        eyebrow="Judging panel"
        title="The people who read your work"
        intro="Professionals and advanced students who volunteer their expertise to review student research."
      />

      {JUDGES.length === 0 ? (
        <Chapter n="1" label="Panel" title="Being introduced soon">
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <p className="max-w-md text-lg leading-relaxed text-muted-600">
                We’re recruiting judges now. Only judges who agree to be identified publicly will be listed here, and
                their contact details stay private.
              </p>
              <p className="mt-8 text-[15px] text-muted-600">
                Have relevant expertise and want to help?{' '}
                <Link to="/contact" className="link-teal">
                  Get in touch
                </Link>
              </p>
            </Reveal>
            <div>
              <p className="mb-4 text-[13px] font-medium text-muted-500">Judges come from</p>
              <ul className="border-t border-muted-300">
                {JUDGE_BACKGROUNDS.map((b, i) => (
                  <Reveal as="li" key={b} delay={i * 0.05} className="border-b border-muted-300 py-4">
                    <span className="display text-2xl text-navy-950">{b}</span>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </Chapter>
      ) : (
        <Chapter n="1" label="Panel">
          <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {JUDGES.map((j, i) => (
              <Reveal key={j.name} delay={i * 0.05}>
                {j.photoUrl ? (
                  <img src={j.photoUrl} alt={j.name} className="aspect-[4/5] w-full rounded-md object-cover grayscale transition duration-500 hover:grayscale-0" />
                ) : (
                  <div className="flex aspect-[4/5] w-full items-end rounded-md bg-navy-100 p-6">
                    <span className="display text-7xl text-navy-300">{initials(j.name)}</span>
                  </div>
                )}
                <h3 className="display mt-5 text-2xl font-medium text-navy-950">{j.name}</h3>
                <p className="mt-1 text-[15px] font-medium text-teal-700">{j.role}</p>
                {j.affiliation && <p className="mt-1 text-[15px] text-navy-800">{j.affiliation}</p>}
                {j.bio && <p className="mt-3 text-[15px] leading-relaxed text-muted-600">{j.bio}</p>}
              </Reveal>
            ))}
          </div>
        </Chapter>
      )}
    </>
  );
}

/* ----------------------------------------------------------------------------
 * Winners
 * --------------------------------------------------------------------------*/

export function WinnersPage() {
  const [winners, setWinners] = useState<GalleryProject[]>([]);

  useEffect(() => {
    if (COMPETITION.resultsPublished) {
      fetchGallery().then((all) => setWinners(all.filter((p) => p.award)));
    }
  }, []);

  const byAward = Object.fromEntries(
    winners.map((w) => [
      w.award as string,
      <Link key={w.id} to={`/gallery/${w.id}`} className="group block">
        <span className="block font-semibold leading-snug text-navy-950 group-hover:text-teal-700">{w.project_title}</span>
        <span className="mt-1 block text-sm text-muted-600">{w.author}</span>
      </Link>,
    ])
  );

  return (
    <>
      <PageMasthead
        eyebrow="Results"
        title="Winners"
        intro={
          COMPETITION.resultsPublished
            ? 'The projects the judges ranked highest this edition.'
            : 'Winners are announced at the end of judging, in week seven. Participants hear by email before or at the public announcement.'
        }
      />
      <Chapter n="1" label="Awards" title={COMPETITION.resultsPublished ? undefined : 'Prizes this edition'}>
        <Podium winners={byAward} />
        <p className="mt-10 max-w-2xl text-[15px] leading-relaxed text-muted-600">
          Every participant receives a digital certificate. Names appear only with consent, and award-winning projects
          are marked in the gallery.
        </p>
      </Chapter>
    </>
  );
}

/* ----------------------------------------------------------------------------
 * Contact
 * --------------------------------------------------------------------------*/

export function ContactPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <PageMasthead
        eyebrow="Contact"
        title="Questions, answered"
        intro="About eligibility, submissions or published materials. We aim to reply within two business days."
      />

      <Chapter n="1" label="Write to us">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <p className="text-[13px] font-medium text-muted-500">Organizing team</p>
            {COMPETITION.contactEmail ? (
              <a
                href={`mailto:${COMPETITION.contactEmail}`}
                className="group display mt-3 inline-flex items-baseline gap-2 break-all text-3xl text-navy-950 hover:text-teal-700 md:text-5xl"
              >
                {COMPETITION.contactEmail}
                <ArrowUpRight className="h-6 w-6 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </a>
            ) : (
              <p className="display mt-3 text-3xl text-navy-950 md:text-5xl">Email address coming soon</p>
            )}
            {COMPETITION.instagramUrl && (
              <a href={COMPETITION.instagramUrl} target="_blank" rel="noreferrer" className="link-teal mt-6 inline-block">
                {COMPETITION.instagramHandle || 'Follow us on Instagram'}
              </a>
            )}
          </Reveal>
          <Reveal delay={0.1} className="rounded-md border border-muted-300 bg-surface p-7">
            <h2 className="text-3xl">Corrections and removal</h2>
            <p className="mt-3 leading-relaxed text-muted-600">
              To correct or remove anything published about you or your project, email us with:
            </p>
            <ol className="mt-5 space-y-2 text-[15px] text-navy-900">
              <li>1. Your submission ID, for example RB-0042</li>
              <li>2. The page or material concerned</li>
              <li>3. What should be corrected or removed</li>
            </ol>
            <p className="mt-5 text-sm text-muted-500">
              Parents and guardians of participants under 18 can make this request too.
            </p>
          </Reveal>
        </div>
      </Chapter>

      <Chapter n="2" label="FAQ" tone="surface" title="Frequently asked">
        <div className="border-t border-muted-300">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-muted-300">
                <button
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="display text-2xl text-navy-950 transition-colors group-hover:text-teal-700 md:text-[1.75rem]">
                    {f.q}
                  </span>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color] duration-300 ${
                      isOpen ? 'rotate-45 border-ink bg-ink text-white dark:border-teal-500 dark:bg-teal-500' : 'border-muted-300 text-navy-950'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-7 text-lg leading-relaxed text-muted-600">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Chapter>
    </>
  );
}
