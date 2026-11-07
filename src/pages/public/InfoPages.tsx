import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, ChevronDown, Mail, Instagram, Trophy, UserRound, Clock } from 'lucide-react';
import { PageMasthead, SectionHeading } from '@/layouts/PublicLayout';
import { AWARDS, COMPETITION, FAQ, JUDGES } from '@/config/competition';
import { fetchGallery } from '@/lib/competition';
import { initials } from '@/lib/utils';
import type { GalleryProject } from '@/types/competition';

/* ----------------------------------------------------------------------------
 * Judges
 * --------------------------------------------------------------------------*/

export function JudgesPage() {
  return (
    <>
      <PageMasthead
        eyebrow="Judging panel"
        title="Our judges"
        intro="Researchers, university students, teachers, engineers, and scientists who volunteer their expertise to review student work."
      />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {JUDGES.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-md border border-dashed border-muted-300 bg-white px-8 py-16 text-center">
            <UserRound className="mx-auto h-8 w-8 text-teal-500" />
            <h2 className="mt-4 text-2xl text-navy-950">The panel will be introduced soon</h2>
            <p className="mt-3 leading-relaxed text-muted-600">
              We are recruiting judges now. Only judges who agree to be publicly identified will be listed here.
            </p>
            <p className="mt-6 text-sm text-muted-600">
              Have relevant expertise and want to help?{' '}
              <Link to="/contact" className="link-teal">
                Get in touch
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {JUDGES.map((j) => (
              <div key={j.name} className="rounded-md border border-muted-200 bg-white p-6">
                <div className="flex items-center gap-4">
                  {j.photoUrl ? (
                    <img src={j.photoUrl} alt={j.name} className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-100 font-serif text-lg font-bold text-navy-800">
                      {initials(j.name)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg text-navy-950">{j.name}</h3>
                    <p className="text-sm text-teal-700">{j.role}</p>
                  </div>
                </div>
                {j.affiliation && <p className="mt-4 text-sm font-medium text-navy-800">{j.affiliation}</p>}
                {j.bio && <p className="mt-2 text-sm leading-relaxed text-muted-600">{j.bio}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="mx-auto mt-14 max-w-3xl border-t border-muted-200 pt-8 text-center text-sm text-muted-500">
          With thanks to every judge, volunteer, and partner who makes this competition possible.
        </div>
      </div>
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

  return (
    <>
      <PageMasthead
        eyebrow="Results"
        title="Winners"
        intro="Recognizing outstanding student research through transparent, expert judging."
      />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {!COMPETITION.resultsPublished && (
          <div className="mb-12 flex items-start gap-4 rounded-md border border-gold-200 bg-gold-50 px-6 py-5">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
            <div>
              <p className="font-semibold text-navy-950">Winners will be announced at the end of judging (Week 7).</p>
              <p className="mt-1 text-sm text-muted-700">
                Participants are notified by email before or at the public announcement. Every participant receives a
                digital certificate.
              </p>
            </div>
          </div>
        )}

        <SectionHeading eyebrow="Award categories" title="Awards & prizes" />
        <div className="grid gap-6 md:grid-cols-3">
          {AWARDS.map((a, i) => {
            const winner = winners.find((w) => w.award === a.key);
            return (
              <div
                key={a.key}
                className={`flex flex-col rounded-md border p-7 ${
                  i === 0 ? 'border-gold-300 bg-gold-50' : 'border-muted-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">{a.place}</span>
                  <Trophy className="h-5 w-5 text-gold-500" />
                </div>
                <p className="mt-4 font-serif text-xl font-bold text-navy-950">{a.title}</p>
                <p className="mt-1 text-sm text-muted-600">Prize: {a.prize}</p>
                <div className="mt-6 border-t border-gold-200/70 pt-5">
                  {winner ? (
                    <Link to={`/gallery/${winner.id}`} className="group block">
                      <p className="font-semibold leading-snug text-navy-950 group-hover:text-teal-700">
                        {winner.project_title}
                      </p>
                      <p className="mt-1 text-sm text-muted-600">{winner.author}</p>
                      <p className="mt-0.5 text-xs text-teal-700">{winner.category}</p>
                    </Link>
                  ) : (
                    <p className="text-sm italic text-muted-500">To be announced</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 flex items-start gap-2 text-sm text-muted-500">
          <Award className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
          Participant names are shown only with consent. Award-winning projects are clearly marked in the gallery.
        </p>
      </div>
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
        eyebrow="Get in touch"
        title="Contact & FAQ"
        intro="Questions about eligibility, submissions, or published materials? We aim to reply within two business days."
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-6">
          <div className="rounded-md border border-muted-200 bg-white p-6">
            <h2 className="text-xl text-navy-950">Organizing team</h2>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-teal-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-500">Email</p>
                  {COMPETITION.contactEmail ? (
                    <a href={`mailto:${COMPETITION.contactEmail}`} className="link-teal">
                      {COMPETITION.contactEmail}
                    </a>
                  ) : (
                    <p className="text-muted-600">To be announced</p>
                  )}
                </div>
              </div>
              {COMPETITION.instagramUrl && (
                <div className="flex items-start gap-3">
                  <Instagram className="mt-0.5 h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-500">Instagram</p>
                    <a href={COMPETITION.instagramUrl} target="_blank" rel="noreferrer" className="link-teal">
                      {COMPETITION.instagramHandle || 'Follow us'}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-md border-l-4 border-teal-500 bg-white p-6">
            <h2 className="text-xl text-navy-950">Corrections & removal</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-700">
              To correct or remove anything published about you or your project, email the organizing team with:
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-700">
              <li>• Your submission ID (e.g. RB-0042)</li>
              <li>• The page or material concerned</li>
              <li>• What should be corrected or removed</li>
            </ul>
            <p className="mt-3 text-sm text-muted-500">
              Parents and guardians of participants under 18 may also make this request.
            </p>
          </div>
        </div>

        <div>
          <SectionHeading eyebrow="Help" title="Frequently asked questions" />
          <div className="divide-y divide-muted-200 border-y border-muted-200">
            {FAQ.map((f, i) => (
              <div key={f.q}>
                <button
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  <span className="font-semibold text-navy-950">{f.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-400 transition-transform ${open === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {open === i && <p className="-mt-1 pb-5 leading-relaxed text-muted-700">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
