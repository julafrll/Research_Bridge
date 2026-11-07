import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, Download, ExternalLink, FileText, Microscope } from 'lucide-react';
import { PageMasthead } from '@/layouts/PublicLayout';
import { Spinner } from '@/components/ui';
import { FEATURES } from '@/config/features';
import { RESEARCH_CATEGORIES } from '@/config/competition';
import { awardLabel, fetchGallery, signedFileUrl } from '@/lib/competition';
import type { GalleryProject } from '@/types/competition';

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

  return (
    <>
      <PageMasthead
        eyebrow="Online exhibition"
        title="Research gallery"
        intro="Posters and abstracts from participants who agreed to share their work, organized by research field."
      />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {projects === null ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : projects.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-muted-300 bg-surface px-8 py-16 text-center">
            <Microscope className="mx-auto h-8 w-8 text-teal-500" />
            <h2 className="mt-4 text-2xl text-navy-950">The gallery opens with the results</h2>
            <p className="mt-3 leading-relaxed text-muted-600">
              Approved posters and abstracts will be published here after judging. Only materials whose authors consented
              to public display are included.
            </p>
            <Link to="/guidelines" className="link-teal mt-6 inline-block text-sm">
              Read the submission guidelines →
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap gap-2">
              <FilterChip active={category === 'all'} onClick={() => setCategory('all')}>
                All fields <span className="opacity-60">({projects.length})</span>
              </FilterChip>
              {RESEARCH_CATEGORIES.filter((c) => counts.has(c)).map((c) => (
                <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                  {c} <span className="opacity-60">({counts.get(c)})</span>
                </FilterChip>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => {
                const award = awardLabel(p.award);
                return (
                  <Link
                    key={p.id}
                    to={`/gallery/${p.id}`}
                    className="group flex flex-col rounded-xl border border-muted-200 bg-surface p-6 transition-shadow hover:shadow-card-hover"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">{p.category}</span>
                      {award && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded bg-gold-50 px-2 py-0.5 text-xs font-semibold text-gold-700">
                          <Award className="h-3 w-3" /> {award.place}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-lg leading-snug text-navy-950 group-hover:text-navy-700">{p.project_title}</h3>
                    <p className="mt-2 text-sm text-muted-500">
                      {p.author}
                      {p.collaborators && `, ${p.collaborators}`}
                    </p>
                    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-600">{p.abstract}</p>
                    <span className="mt-auto pt-4 text-sm font-medium text-teal-600">View project →</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active ? 'border-brand-900 bg-brand-900 text-white' : 'border-muted-300 bg-surface text-navy-800 hover:border-navy-400'
      }`}
    >
      {children}
    </button>
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
      <div className="flex justify-center py-32">
        <Spinner />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl text-navy-950">Project not found</h1>
        <p className="mt-3 text-muted-600">It may not be published yet, or it was removed at the author’s request.</p>
        <Link to="/gallery" className="link-teal mt-6 inline-block">
          Back to the gallery
        </Link>
      </div>
    );
  }

  const award = awardLabel(project.award);

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link to="/gallery" className="inline-flex items-center gap-1.5 text-sm text-muted-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" /> Research gallery
      </Link>

      <header className="mt-6 border-b border-muted-200 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">{project.category}</span>
          {award && (
            <span className="inline-flex items-center gap-1 rounded bg-gold-50 px-2.5 py-1 text-xs font-semibold text-gold-700">
              <Award className="h-3.5 w-3.5" /> {award.place} — {award.title}
            </span>
          )}
        </div>
        <h1 className="mt-4 text-3xl leading-tight text-navy-950 md:text-4xl">{project.project_title}</h1>
        <p className="mt-4 text-muted-600">
          {project.author}
          {project.collaborators && `, ${project.collaborators}`}
          {project.country && <span className="text-muted-400"> · {project.country}</span>}
        </p>
        <p className="mt-1 font-mono text-xs text-muted-400">{project.submission_code}</p>
      </header>

      <section className="py-8">
        <h2 className="mb-3 text-xl text-navy-950">Abstract</h2>
        <p className="whitespace-pre-line leading-relaxed text-muted-700">{project.abstract}</p>
      </section>

      {posterUrl && (
        <section className="py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl text-navy-950">Poster</h2>
            <a href={posterUrl} target="_blank" rel="noreferrer" className="link-teal inline-flex items-center gap-1 text-sm">
              <Download className="h-4 w-4" /> Open PDF
            </a>
          </div>
          <div className="aspect-[16/9] overflow-hidden rounded-xl border border-muted-200 bg-surface">
            <iframe src={posterUrl} title="Poster" className="h-full w-full" />
          </div>
        </section>
      )}

      {FEATURES.videos && project.video_url && (
        <section className="py-4">
          <h2 className="mb-3 text-xl text-navy-950">Video presentation</h2>
          <a href={project.video_url} target="_blank" rel="noreferrer" className="link-teal inline-flex items-center gap-1">
            Watch the presentation <ExternalLink className="h-4 w-4" />
          </a>
        </section>
      )}

      {paperUrl && (
        <section className="py-4">
          <h2 className="mb-3 text-xl text-navy-950">Research paper</h2>
          <a
            href={paperUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded border border-muted-300 bg-surface px-4 py-2.5 text-sm font-medium text-navy-900 hover:border-navy-400"
          >
            <FileText className="h-4 w-4 text-teal-600" /> Read the full paper
          </a>
        </section>
      )}

      <p className="mt-10 border-t border-muted-200 pt-6 text-xs leading-relaxed text-muted-500">
        Published with the author’s consent. Appearing in the exhibition does not mean this research has been
        scientifically validated or endorsed by the organizers.
      </p>
    </article>
  );
}
