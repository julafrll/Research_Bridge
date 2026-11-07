import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, Presentation, Search, Trophy, Globe, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge, Button, Card, CardBody, EmptyState, Input, LoadingPage, Modal, Select, Textarea, Alert } from '@/components/ui';
import { FEATURES } from '@/config/features';
import { AWARDS, CATEGORY_SHORT, RESEARCH_CATEGORIES, type CompetitionCategory } from '@/config/competition';
import { signedFileUrl } from '@/lib/competition';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ENTRY_STATUS, type CompetitionEntry, type EntryStatus } from '@/types/competition';

const STATUSES = Object.keys(ENTRY_STATUS) as EntryStatus[];

export function AdminCompetition() {
  const [entries, setEntries] = useState<CompetitionEntry[] | null>(null);
  const [status, setStatus] = useState<'all' | EntryStatus>('all');
  const [category, setCategory] = useState('all');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<CompetitionEntry | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from('competition_entries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error(error.message);
    setEntries((data as CompetitionEntry[]) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (entries ?? []).filter(
      (e) =>
        (status === 'all' || e.status === status) &&
        (category === 'all' || e.category === category) &&
        (!term ||
          [e.submission_code, e.project_title, e.full_name, e.email, e.school, e.country]
            .join(' ')
            .toLowerCase()
            .includes(term))
    );
  }, [entries, status, category, q]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (entries ?? []).forEach((e) => (c[e.status] = (c[e.status] ?? 0) + 1));
    return c;
  }, [entries]);

  if (entries === null) return <LoadingPage message="Loading entries..." />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl text-navy-950">Competition entries</h1>
          <p className="mt-1 text-sm text-muted-500">
            Track registrations, check eligibility, return incomplete entries, and publish approved projects.
          </p>
        </div>
        <Button variant="secondary" onClick={() => downloadCsv(filtered)} disabled={filtered.length === 0}>
          <Download className="h-4 w-4" /> Export CSV (Google Sheets)
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="All entries" value={entries.length} active={status === 'all'} onClick={() => setStatus('all')} />
        {STATUSES.map((s) => (
          <StatTile
            key={s}
            label={ENTRY_STATUS[s].label.replace(' — in judging', '').replace(' for correction', '')}
            value={counts[s] ?? 0}
            active={status === s}
            onClick={() => setStatus(s)}
          />
        ))}
      </div>

      <Card>
        <CardBody className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-400" />
            <input
              className="input-field pl-9"
              placeholder="Search by ID, title, name, email, school, country…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="md:w-72">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {RESEARCH_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title={entries.length === 0 ? 'No entries yet' : 'No entries match'}
            description={
              entries.length === 0
                ? 'Entries appear here as soon as participants start registering.'
                : 'Try a different filter or search term.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-muted-200 bg-muted-50 text-xs uppercase tracking-wider text-muted-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">Participant</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Category</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">Files</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted-200">
                {filtered.map((e) => (
                  <tr key={e.id} className="cursor-pointer hover:bg-muted-50" onClick={() => setSelected(e)}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-navy-900">{e.submission_code}</td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate font-medium text-navy-950">{e.project_title || <em className="text-muted-400">Untitled</em>}</p>
                      <div className="mt-0.5 flex gap-1.5">
                        {e.award && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700">
                            <Trophy className="h-3 w-3" /> {AWARDS.find((a) => a.key === e.award)?.place}
                          </span>
                        )}
                        {e.is_published && (
                          <span className="inline-flex items-center gap-1 text-xs text-teal-700">
                            <Globe className="h-3 w-3" /> Published
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <p className="text-navy-900">{e.full_name}</p>
                      <p className="text-xs text-muted-500">{[e.school, e.country].filter(Boolean).join(' · ')}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-600 lg:table-cell">
                      {CATEGORY_SHORT[e.category as CompetitionCategory] ?? (e.category || '—')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ENTRY_STATUS[e.status].variant} className="whitespace-nowrap">{ENTRY_STATUS[e.status].label}</Badge>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div className="flex gap-2 text-muted-400">
                        <FileText className={`h-4 w-4 ${e.paper_path ? 'text-teal-600' : ''}`} />
                        <Presentation className={`h-4 w-4 ${e.poster_path ? 'text-teal-600' : ''}`} />
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-500 lg:table-cell">{formatDate(e.submitted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <EntryModal
          entry={selected}
          onClose={() => setSelected(null)}
          onSaved={(updated) => {
            setEntries((list) => (list ?? []).map((x) => (x.id === updated.id ? updated : x)));
            setSelected(updated);
          }}
        />
      )}
    </div>
  );
}

function StatTile({ label, value, active, onClick }: { label: string; value: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-4 py-3 text-left transition-colors ${
        active ? 'border-brand-900 bg-brand-900 text-white' : 'border-muted-200 bg-surface hover:border-muted-300'
      }`}
    >
      <p className={`font-serif text-2xl ${active ? 'text-white' : 'text-navy-950'}`}>{value}</p>
      <p className={`text-xs ${active ? 'text-blue-100' : 'text-muted-500'}`}>{label}</p>
    </button>
  );
}

function EntryModal({
  entry,
  onClose,
  onSaved,
}: {
  entry: CompetitionEntry;
  onClose: () => void;
  onSaved: (e: CompetitionEntry) => void;
}) {
  const [status, setStatus] = useState<EntryStatus>(entry.status);
  const [note, setNote] = useState(entry.organizer_note);
  const [award, setAward] = useState<string>(entry.award ?? '');
  const [published, setPublished] = useState(entry.is_published);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canPublish = entry.public_display_consent && status === 'eligible';

  const open = async (path: string | null) => {
    const url = await signedFileUrl(path, 600);
    if (url) window.open(url, '_blank', 'noopener');
  };

  const save = async () => {
    setSaving(true);
    setError('');
    const { data, error: err } = await supabase
      .from('competition_entries')
      .update({
        status,
        organizer_note: note,
        award: award || null,
        is_published: canPublish ? published : false,
      })
      .eq('id', entry.id)
      .select()
      .single();
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved(data as CompetitionEntry);
  };

  const row = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-1.5 text-sm">
      <dt className="text-muted-500">{label}</dt>
      <dd className="text-navy-900">{value || <span className="text-muted-400">—</span>}</dd>
    </div>
  );

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={`${entry.submission_code} · ${entry.project_title || 'Untitled'}`}
      description={`Last updated ${formatDateTime(entry.updated_at)}`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={save} loading={saving}>
            Save review
          </Button>
        </div>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <section>
            <h4 className="mb-2 text-sm font-medium text-teal-700">Participant</h4>
            <dl className="divide-y divide-muted-100">
              {row('Full name', entry.full_name)}
              {row('Display name', entry.display_name)}
              {row('Email', entry.email && <a className="link-teal" href={`mailto:${entry.email}`}>{entry.email}</a>)}
              {row('School', entry.school)}
              {row('Location', [entry.city, entry.country].filter(Boolean).join(', '))}
              {row('Age group / grade', [entry.age_group, entry.grade_level].filter(Boolean).join(' · '))}
            </dl>
          </section>
          <section>
            <h4 className="mb-2 text-sm font-medium text-teal-700">Research</h4>
            <dl className="divide-y divide-muted-100">
              {row('Category', entry.category)}
              {row('Work type', entry.is_collaborative ? `Collaborative — ${entry.collaborators}` : 'Individual')}
              {row('AI disclosure', entry.ai_disclosure)}
            </dl>
            <p className="mt-3 whitespace-pre-line rounded-md bg-muted-50 p-3 text-sm leading-relaxed text-muted-700">
              {entry.abstract || 'No abstract yet.'}
            </p>
          </section>
          <section>
            <h4 className="mb-2 text-sm font-medium text-teal-700">Materials</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" disabled={!entry.paper_path} onClick={() => open(entry.paper_path)}>
                <FileText className="h-4 w-4" /> Paper
              </Button>
              <Button variant="secondary" size="sm" disabled={!entry.poster_path} onClick={() => open(entry.poster_path)}>
                <Presentation className="h-4 w-4" /> Poster
              </Button>
              {FEATURES.videos && entry.video_url && (
                <a href={entry.video_url} target="_blank" rel="noreferrer" className="btn-secondary px-3 py-2 text-xs">
                  <ExternalLink className="h-4 w-4" /> Video
                </a>
              )}
            </div>
          </section>
          <section>
            <h4 className="mb-2 text-sm font-medium text-teal-700">Declarations & consent</h4>
            <ul className="space-y-1 text-sm">
              <Flag ok={entry.contribution_confirmed}>Original work / meaningful contribution</Flag>
              <Flag ok={entry.ethics_confirmed}>Ethics & safety requirements</Flag>
              <Flag ok={entry.public_display_consent}>Public display consent</Flag>
              <Flag ok={entry.paper_public_consent}>Full paper may be shared</Flag>
              {entry.age_group && entry.age_group !== '18 or older' && (
                <Flag ok={entry.guardian_consent}>Parent/guardian permission</Flag>
              )}
            </ul>
          </section>
        </div>

        <div className="space-y-4 rounded-lg border border-muted-200 bg-muted-50 p-5">
          <h4 className="font-sans text-sm font-semibold text-navy-950">Organizer review</h4>
          {error && <Alert variant="error">{error}</Alert>}
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as EntryStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {ENTRY_STATUS[s].label}
              </option>
            ))}
          </Select>
          <Textarea
            label="Note to participant"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            hint="Shown on the participant's entry page — explain what to fix when returning an entry."
          />
          <Select label="Award" value={award} onChange={(e) => setAward(e.target.value)}>
            <option value="">No award</option>
            {AWARDS.map((a) => (
              <option key={a.key} value={a.key}>
                {a.place} — {a.title}
              </option>
            ))}
          </Select>
          <label className={`flex items-start gap-3 text-sm ${canPublish ? '' : 'opacity-50'}`}>
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-navy-900"
              checked={canPublish && published}
              disabled={!canPublish}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <span className="text-muted-700">
              Publish in the public gallery
              {!canPublish && (
                <span className="block text-xs text-muted-500">
                  Requires status “Eligible” and the participant’s public display consent.
                </span>
              )}
            </span>
          </label>
          <Input label="Submission ID" value={entry.submission_code} readOnly />
        </div>
      </div>
    </Modal>
  );
}

function Flag({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${ok ? 'bg-teal-500' : 'bg-muted-300'}`} />
      <span className={ok ? 'text-navy-900' : 'text-muted-500'}>{children}</span>
    </li>
  );
}

function downloadCsv(entries: CompetitionEntry[]) {
  const cols: [string, (e: CompetitionEntry) => string | boolean | null][] = [
    ['Submission ID', (e) => e.submission_code],
    ['Status', (e) => ENTRY_STATUS[e.status].label],
    ['Submitted at', (e) => e.submitted_at],
    ['Full name', (e) => e.full_name],
    ['Display name', (e) => e.display_name],
    ['Email', (e) => e.email],
    ['School', (e) => e.school],
    ['Country', (e) => e.country],
    ['City', (e) => e.city],
    ['Age group', (e) => e.age_group],
    ['Grade level', (e) => e.grade_level],
    ['Project title', (e) => e.project_title],
    ['Category', (e) => e.category],
    ['Collaborative', (e) => e.is_collaborative],
    ['Collaborators', (e) => e.collaborators],
    ['Paper uploaded', (e) => !!e.paper_path],
    ['Poster uploaded', (e) => !!e.poster_path],
    ...(FEATURES.videos ? [['Video link', (e: CompetitionEntry) => e.video_url] as [string, (e: CompetitionEntry) => string]] : []),
    ['AI disclosure', (e) => e.ai_disclosure],
    ['Public display consent', (e) => e.public_display_consent],
    ['Paper sharing consent', (e) => e.paper_public_consent],
    ['Guardian consent', (e) => e.guardian_consent],
    ['Award', (e) => AWARDS.find((a) => a.key === e.award)?.place ?? ''],
    ['Published', (e) => e.is_published],
    ['Organizer note', (e) => e.organizer_note],
  ];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    // Neutralize spreadsheet formulas and quote every cell.
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const csv = [cols.map((c) => esc(c[0])).join(','), ...entries.map((e) => cols.map((c) => esc(c[1](e))).join(','))].join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `competition-entries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
