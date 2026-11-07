import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Download, ExternalLink, FileText } from 'lucide-react';
import { PageMasthead } from '@/layouts/PublicLayout';
import { Spinner } from '@/components/ui';
import { BridgeArch, EASE, Reveal } from '@/components/editorial';
import { FEATURES } from '@/config/features';
import { RESEARCH_CATEGORIES, CATEGORY_SHORT, type CompetitionCategory } from '@/config/competition';
import { awardLabel, fetchGallery, signedFileUrl } from '@/lib/competition';
import type { GalleryProject } from '@/types/competition';

const AWARD_MARK: Record<string, string> = {
  first: 'bg-gold-400',
  second: 'bg-muted-400',
  third: 'bg-[#c08552]',
};

export function GalleryPage() {
  const [projects, setProjects] = useState<GalleryProject[] | null>(null);
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    fetchGallery().then(setProjects);
  }, []);

  const filtered = useMemo(
    () => (projects ?? []).filter((p) => category === 'all' || p.category === category),
    [projects, category]
  );

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    (projects ?? []).forEach((p) => m.set(p.category, (m.get(p.category) ?? 0) + 1));
    return m;
  }, [projects]);

  const tabs = [
    { key: 'all', label: 'All fields', count: projects?.length ?? 0 },
    ...RESEARCH_CATEGORIES.filter((c) => counts.has(c)).map((c) => ({
      key: c,
      label: CATEGORY_SHORT[c as CompetitionCategory] ?? c,
      count: counts.get(c) ?? 0,
    })),
  ];

  return (
    <>
      <PageMasthead
        eyebrow="Online exhibition"
        title="Research gallery"
        intro="Posters and abstracts from participants who agreed to share their work, organized by research field."
      />

      <div className="mx-auto max-w-7xl px-5 pb-28 sm:px-8">
        {projects === null ? (
          <div className="flex justify-center border-t border-muted-200 py-24">
            <Spinner />
          </div>
        ) : projects.length === 0 ? (
          <Reveal className="grid items-center gap-12 border-t border-muted-300 py-20 lg:grid-cols-[11rem_1fr_1fr] lg:gap-x-12">
            <p className="text-[13px] font-medium text-muted-500">Status</p>
            <div>
              <h2 className="text-4xl md:text-5xl">The gallery opens with the results.</h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-600">
                Approved posters and abstracts appear here after judging. Only work whose authors consented to public
                display is shown.
              </p>
              <Link to="/guidelines" className="link-teal mt-8 inline-block">
                Read the submission guidelines
              </Link>
            </div>
            <div className="hidden h-40 rounded-md bg-ink p-8 lg:block">
              <BridgeArch animate={false} traveller={false} stroke="faint" />
            </div>
          </Reveal>
        ) : (
          <>
            {/* Field tabs */}
            <div className="sticky top-16 z-10 -mx-5 overflow-x-auto border-b border-muted-300 bg-muted-50/90 px-5 backdrop-blur-xl sm:-mx-8 sm:px-8">
              <div className="flex gap-6">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setCategory(t.key)}
                    className={`relative shrink-0 py-4 text-[14px] font-medium transition-colors ${
                      category === t.key ? 'text-navy-950' : 'text-muted-500 hover:text-navy-950'
                    }`}
                  >
                    {t.label} <span className="tabular-nums text-muted-400">{t.count}</span>
                    {category === t.key && (
                      <motion.span layoutId="gallery-tab" className="absolute inset-x-0 -bottom-px h-[2px] bg-teal-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Index of projects */}
            <motion.ol layout className="divide-y divide-muted-300">
              <AnimatePresence initial={false} mode="popLayout">
                {filtered.map((p, i) => {
                  const award = awardLabel(p.award);
                  return (
                    <motion.li
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE, delay: Math.min(i, 8) * 0.03 } }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    >
                      <Link
                        to={`/gallery/${p.id}`}
                        className="group grid gap-3 py-8 md:grid-cols-[11rem_1fr_14rem] md:gap-12"
                      >
                        <div className="flex items-center gap-2 text-[13px] font-medium text-teal-600 md:block">
                          {CATEGORY_SHORT[p.category as CompetitionCategory] ?? p.category}
                          {award && (
                            <span className="inline-flex items-center gap-2 text-navy-800 md:mt-3 md:flex">
                              <span className={`h-2.5 w-2.5 rotate-45 ${AWARD_MARK[p.award ?? ''] ?? ''}`} />
                              {award.place}
                            </span>
                          )}
                        </div>
                        <div>
                          <h2 className="text-2xl leading-snug transition-colors group-hover:text-teal-700 md:text-[2rem]">
                            {p.project_title}
                          </h2>
                          <p className="mt-3 line-clamp-2 max-w-2xl leading-relaxed text-muted-600">{p.abstract}</p>
                        </div>
                        <div className="flex items-start justify-between gap-4 text-[15px] md:flex-col md:items-end md:text-right">
                          <div>
                            <p className="font-medium text-navy-950">{p.author}</p>
                            {p.collaborators && <p className="text-muted-500">{p.collaborators}</p>}
                            {p.country && <p className="text-muted-500">{p.country}</p>}
                          </div>
                          <ArrowUpRight className="h-5 w-5 text-muted-400 transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-600" />
                        </div>
                      </Link>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ol>
          </>
        )}
      </div>
    </>
  );
}

export function GalleryProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<GalleryProject | null | undefined>(undefined);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [paperUrl, setPaperUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchGallery().then(async (all) => {
      const p = all.find((x) => x.id === projectId) ?? null;
      setProject(p);
      if (p) {
        setPosterUrl(await signedFileUrl(p.poster_path));
        setPaperUrl(await signedFileUrl(p.paper_path));
      }
    });
  }, [projectId]);

  if (project === undefined) {
    return (
      <div className="flex justify-center py-40">
        <Spinner />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <h1 className="text-5xl">Project not found</h1>
        <p className="mt-4 max-w-md text-lg text-muted-600">
          It may not be published yet, or it was removed at the author’s request.
        </p>
        <Link to="/gallery" className="link-teal mt-8 inline-block">
          Back to the gallery
        </Link>
      </div>
    );
  }

  const award = awardLabel(project.award);

  return (
    <article className="mx-auto max-w-7xl px-5 pb-28 pt-10 sm:px-8">
      <Link to="/gallery" className="group inline-flex items-center gap-2 text-sm text-muted-500 hover:text-navy-950">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Research gallery
      </Link>

      <header className="mt-10 grid gap-x-12 gap-y-6 border-b border-muted-300 pb-12 lg:grid-cols-[11rem_1fr]">
        <div className="text-[13px] font-medium lg:pt-4">
          <p className="text-teal-600">{project.category}</p>
          {award && (
            <p className="mt-3 inline-flex items-center gap-2 text-navy-800">
              <span className={`h-2.5 w-2.5 rotate-45 ${AWARD_MARK[project.award ?? ''] ?? ''}`} />
              {award.place}, {award.title}
            </p>
          )}
        </div>
        <div>
          <motion.h1
            className="max-w-4xl text-4xl leading-[1.05] md:text-6xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {project.project_title}
          </motion.h1>
          <p className="mt-6 text-lg text-navy-900">
            {project.author}
            {project.collaborators && `, ${project.collaborators}`}
            {project.country && <span className="text-muted-500">, {project.country}</span>}
          </p>
          <p className="mt-1 text-[13px] text-muted-400">Submission {project.submission_code}</p>
        </div>
      </header>

      <section className="grid gap-x-12 gap-y-4 py-12 lg:grid-cols-[11rem_1fr]">
        <h2 className="font-sans text-[13px] font-medium tracking-normal text-muted-500">Abstract</h2>
        <p className="max-w-3xl whitespace-pre-line text-lg leading-relaxed text-navy-900">{project.abstract}</p>
      </section>

      {posterUrl && (
        <section className="grid gap-x-12 gap-y-4 border-t border-muted-300 py-12 lg:grid-cols-[11rem_1fr]">
          <div className="flex items-start justify-between lg:block">
            <h2 className="font-sans text-[13px] font-medium tracking-normal text-muted-500">Poster</h2>
            <a href={posterUrl} target="_blank" rel="noreferrer" className="link-teal inline-flex items-center gap-1.5 text-sm lg:mt-3">
              <Download className="h-4 w-4" /> Open PDF
            </a>
          </div>
          <div className="aspect-[16/9] overflow-hidden rounded-md border border-muted-300 bg-surface shadow-card-hover">
            <iframe src={posterUrl} title="Poster" className="h-full w-full" />
          </div>
        </section>
      )}

      {(paperUrl || (FEATURES.videos && project.video_url)) && (
        <section className="grid gap-x-12 gap-y-4 border-t border-muted-300 py-12 lg:grid-cols-[11rem_1fr]">
          <h2 className="font-sans text-[13px] font-medium tracking-normal text-muted-500">Materials</h2>
          <div className="flex flex-wrap gap-3">
            {paperUrl && (
              <a href={paperUrl} target="_blank" rel="noreferrer" className="btn-secondary group">
                <FileText className="h-4 w-4 text-teal-600" /> Read the full paper
              </a>
            )}
            {FEATURES.videos && project.video_url && (
              <a href={project.video_url} target="_blank" rel="noreferrer" className="btn-secondary group">
                Watch the presentation <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </section>
      )}

      <p className="mt-6 border-t border-muted-300 pt-6 text-[13px] leading-relaxed text-muted-500 lg:pl-[calc(11rem+3rem)]">
        Published with the author’s consent. Appearing in the exhibition doesn’t mean this research has been
        scientifically validated or endorsed by the organizers.
      </p>
    </article>
  );
}
