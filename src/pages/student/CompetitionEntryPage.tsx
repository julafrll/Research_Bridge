import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FileText, Presentation, Upload, Send, Save, Copy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Alert, Badge, Button, Card, CardBody, Input, LoadingPage, Select, Textarea } from '@/components/ui';
import { FEATURES } from '@/config/features';
import { AGE_GROUPS, COMPETITION, RESEARCH_CATEGORIES } from '@/config/competition';
import { MAX_FILE_MB, signedFileUrl, uploadCompetitionFile } from '@/lib/competition';
import { formatDateTime } from '@/lib/utils';
import { ENTRY_STATUS, type CompetitionEntry } from '@/types/competition';


type Form = Omit<
  CompetitionEntry,
  'id' | 'user_id' | 'submission_code' | 'status' | 'organizer_note' | 'award' | 'is_published' | 'submitted_at' | 'created_at' | 'updated_at'
>;

const EMPTY: Form = {
  full_name: '',
  display_name: '',
  email: '',
  school: '',
  country: '',
  city: '',
  age_group: '',
  grade_level: '',
  project_title: '',
  category: '',
  is_collaborative: false,
  collaborators: '',
  abstract: '',
  paper_path: null,
  paper_name: null,
  poster_path: null,
  poster_name: null,
  video_url: '',
  contribution_confirmed: false,
  ai_disclosure: '',
  ethics_confirmed: false,
  public_display_consent: false,
  paper_public_consent: false,
  guardian_consent: false,
};

const PAPER_TYPES = '.pdf,.doc,.docx';
const POSTER_TYPES = '.pdf';

export function CompetitionEntryPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<CompetitionEntry | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState<'draft' | 'submit' | null>(null);
  const [uploading, setUploading] = useState<'paper' | 'poster' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('competition_entries').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        const e = data as CompetitionEntry;
        setEntry(e);
        const f = { ...EMPTY };
        (Object.keys(EMPTY) as (keyof Form)[]).forEach((k) => {
          (f as Record<string, unknown>)[k] = e[k];
        });
        setForm(f);
      } else {
        setForm({ ...EMPTY, full_name: profile?.full_name ?? '', email: user.email ?? '' });
      }
      setLoading(false);
    })();
  }, [user, profile]);

  const status = entry?.status ?? 'draft';
  const locked = !COMPETITION.submissionsOpen || !['draft', 'submitted', 'returned'].includes(status);
  const isMinor = form.age_group !== '' && form.age_group !== '18 or older';

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const req: [keyof Form, string][] = [
      ['full_name', 'Enter your full name'],
      ['email', 'Enter your email'],
      ['school', 'Enter your school'],
      ['country', 'Enter your country'],
      ['city', 'Enter your city'],
      ['age_group', 'Choose your age group'],
      ['grade_level', 'Enter your grade level'],
      ['project_title', 'Enter your project title'],
      ['category', 'Choose a research category'],
      ['abstract', 'Add a short abstract'],
    ];
    req.forEach(([k, msg]) => {
      if (!String(form[k] ?? '').trim()) e[k] = msg;
    });
    if (form.is_collaborative && !form.collaborators.trim()) e.collaborators = 'List your collaborators';
    if (!form.paper_path) e.paper_path = 'Upload your research paper';
    if (!form.poster_path) e.poster_path = 'Upload your poster';
    if (FEATURES.videos && !/^https?:\/\//i.test(form.video_url.trim())) e.video_url = 'Add a link to your video';
    if (!form.contribution_confirmed) e.contribution_confirmed = 'Required';
    if (!form.ethics_confirmed) e.ethics_confirmed = 'Required';
    if (isMinor && form.public_display_consent && !form.guardian_consent)
      e.guardian_consent = 'A parent or guardian must agree before your work can be displayed publicly';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (submit: boolean) => {
    if (!user) return;
    setMessage(null);
    if (submit && !validate()) {
      setMessage({ type: 'error', text: 'Some required information is missing. Please check the highlighted fields.' });
      return;
    }
    setSaving(submit ? 'submit' : 'draft');

    const payload = {
      ...form,
      collaborators: form.is_collaborative ? form.collaborators : '',
      guardian_consent: isMinor ? form.guardian_consent : false,
      status: submit ? 'submitted' : entry?.status === 'submitted' ? 'submitted' : 'draft',
    };

    const query = entry
      ? supabase.from('competition_entries').update(payload).eq('id', entry.id).select().single()
      : supabase.from('competition_entries').insert({ ...payload, user_id: user.id }).select().single();

    const { data, error } = await query;
    setSaving(null);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    setEntry(data as CompetitionEntry);
    setMessage({
      type: 'success',
      text: submit
        ? 'Your entry has been submitted. You can keep editing it until the deadline.'
        : 'Draft saved.',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpload = async (kind: 'paper' | 'poster', file: File | undefined) => {
    if (!file || !user) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setErrors((e) => ({ ...e, [`${kind}_path`]: `File must be under ${MAX_FILE_MB} MB` }));
      return;
    }
    if (kind === 'poster' && file.type !== 'application/pdf') {
      setErrors((e) => ({ ...e, poster_path: 'Poster must be a PDF' }));
      return;
    }
    setUploading(kind);
    const { path, error } = await uploadCompetitionFile(user.id, kind, file);
    setUploading(null);
    if (error) {
      setErrors((e) => ({ ...e, [`${kind}_path`]: error }));
      return;
    }
    if (kind === 'paper') setForm((f) => ({ ...f, paper_path: path, paper_name: file.name }));
    else setForm((f) => ({ ...f, poster_path: path, poster_name: file.name }));
    setErrors((e) => ({ ...e, [`${kind}_path`]: '' }));
  };

  const openFile = async (path: string | null) => {
    const url = await signedFileUrl(path, 300);
    if (url) window.open(url, '_blank', 'noopener');
  };

  const completion = useMemo(() => {
    const checks = [
      !!(form.full_name && form.email && form.school && form.country && form.city && form.age_group && form.grade_level),
      !!(form.project_title && form.category && form.abstract),
      !!(form.paper_path && form.poster_path && (!FEATURES.videos || form.video_url)),
      form.contribution_confirmed && form.ethics_confirmed,
    ];
    return checks;
  }, [form]);

  if (loading) return <LoadingPage message="Loading your entry..." />;

  const statusInfo = ENTRY_STATUS[status];

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{COMPETITION.name}</p>
          <h1 className="mt-2 text-3xl text-navy-950">My competition entry</h1>
          <p className="mt-2 text-sm text-muted-500">
            Complete all four sections, then submit.{' '}
            <Link to="/guidelines" className="link-teal">
              Submission guidelines
            </Link>
          </p>
        </div>
        {entry && (
          <div className="rounded-md border border-muted-200 bg-surface px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wider text-muted-500">Submission ID</p>
            <button
              className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-lg font-semibold text-navy-950"
              onClick={() => navigator.clipboard?.writeText(entry.submission_code)}
              title="Copy"
            >
              {entry.submission_code} <Copy className="h-3.5 w-3.5 text-muted-400" />
            </button>
          </div>
        )}
      </div>

      {/* Status */}
      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            <p className="text-sm text-muted-600">
              {statusInfo.help}
              {entry?.submitted_at && (
                <span className="block text-xs text-muted-400">Last submitted {formatDateTime(entry.submitted_at)}</span>
              )}
            </p>
          </div>
          <ol className="flex gap-1.5">
            {['Participant', 'Research', 'Files', 'Declarations'].map((label, i) => (
              <li
                key={label}
                title={label}
                className={`h-1.5 w-10 rounded-full ${completion[i] ? 'bg-teal-500' : 'bg-muted-200'}`}
              />
            ))}
          </ol>
        </CardBody>
      </Card>

      {entry?.organizer_note && (
        <Alert variant={status === 'returned' ? 'warning' : 'info'} title="Note from the organizers">
          {entry.organizer_note}
        </Alert>
      )}
      {!COMPETITION.submissionsOpen && (
        <Alert variant="info" title="Submissions are closed">
          The submission period has ended. You can still view your entry below.
        </Alert>
      )}
      {locked && COMPETITION.submissionsOpen && (
        <Alert variant="info" title="Entry locked">
          Your entry is being reviewed and can no longer be edited. Contact the organizers if something needs to change.
        </Alert>
      )}
      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'}>
          {message.text}
        </Alert>
      )}

      <fieldset disabled={locked} className="space-y-6 disabled:opacity-80">
        {/* 1. Participant */}
        <Section n={1} title="Participant information" done={completion[0]}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name *" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} error={errors.full_name} />
            <Input
              label="Preferred display name"
              value={form.display_name}
              onChange={(e) => set('display_name', e.target.value)}
              hint="Used if your work is published. Leave empty to use your full name."
            />
            <Input label="Email *" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
            <Input label="School *" value={form.school} onChange={(e) => set('school', e.target.value)} error={errors.school} />
            <Input label="Country *" value={form.country} onChange={(e) => set('country', e.target.value)} error={errors.country} />
            <Input label="City *" value={form.city} onChange={(e) => set('city', e.target.value)} error={errors.city} />
            <Select
              label="Age group *"
              value={form.age_group}
              onChange={(e) => set('age_group', e.target.value)}
              error={errors.age_group}
            >
              <option value="">Select…</option>
              {AGE_GROUPS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
            <Input
              label="Grade level *"
              value={form.grade_level}
              onChange={(e) => set('grade_level', e.target.value)}
              placeholder="e.g. Grade 11"
              error={errors.grade_level}
            />
          </div>
        </Section>

        {/* 2. Research */}
        <Section n={2} title="Research information" done={completion[1]}>
          <div className="space-y-4">
            <Input label="Project title *" value={form.project_title} onChange={(e) => set('project_title', e.target.value)} error={errors.project_title} />
            <Select
              label="Research category *"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              error={errors.category}
            >
              <option value="">Select…</option>
              {RESEARCH_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Textarea
              label="Short abstract *"
              value={form.abstract}
              onChange={(e) => set('abstract', e.target.value)}
              error={errors.abstract}
              hint={`${form.abstract.trim() ? form.abstract.trim().split(/\s+/).length : 0} words · about 150–250 words recommended`}
              className="min-h-[160px]"
            />
            <div>
              <p className="label-text">Is this individual or collaborative work?</p>
              <div className="flex gap-3">
                {[
                  { v: false, l: 'Individual' },
                  { v: true, l: 'Collaborative' },
                ].map((o) => (
                  <label
                    key={o.l}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2.5 text-sm ${
                      form.is_collaborative === o.v ? 'border-brand-900 bg-navy-50 text-navy-950' : 'border-muted-200 bg-surface text-muted-600'
                    }`}
                  >
                    <input
                      type="radio"
                      className="accent-navy-900"
                      checked={form.is_collaborative === o.v}
                      onChange={() => set('is_collaborative', o.v)}
                    />
                    {o.l}
                  </label>
                ))}
              </div>
            </div>
            {form.is_collaborative && (
              <Input
                label="Collaborators’ names *"
                value={form.collaborators}
                onChange={(e) => set('collaborators', e.target.value)}
                placeholder="Separate names with commas"
                error={errors.collaborators}
              />
            )}
          </div>
        </Section>

        {/* 3. Files */}
        <Section n={3} title="Submission materials" done={completion[2]}>
          <div className="grid gap-4 md:grid-cols-2">
            <FileSlot
              icon={<FileText className="h-5 w-5" />}
              title="Research paper *"
              hint="PDF or Word · 1,000–3,000 words"
              accept={PAPER_TYPES}
              fileName={form.paper_name}
              uploading={uploading === 'paper'}
              error={errors.paper_path}
              onPick={(f) => handleUpload('paper', f)}
              onOpen={() => openFile(form.paper_path)}
            />
            <FileSlot
              icon={<Presentation className="h-5 w-5" />}
              title="Scientific poster *"
              hint="PDF · landscape, about 16:9 or A1"
              accept={POSTER_TYPES}
              fileName={form.poster_name}
              uploading={uploading === 'poster'}
              error={errors.poster_path}
              onPick={(f) => handleUpload('poster', f)}
              onOpen={() => openFile(form.poster_path)}
            />
          </div>
          {FEATURES.videos && (
            <div className="mt-4">
              <Input
                label="Video presentation link *"
                value={form.video_url}
                onChange={(e) => set('video_url', e.target.value)}
                placeholder="https://"
                hint="2–5 minutes, presenting on camera. Make sure the link is accessible."
                error={errors.video_url}
              />
            </div>
          )}
          <p className="mt-4 text-xs text-muted-500">Maximum {MAX_FILE_MB} MB per file. Keep your own copy of every file you submit.</p>
        </Section>

        {/* 4. Declarations */}
        <Section n={4} title="Declarations & consent" done={completion[3]}>
          <div className="space-y-4">
            <Check
              checked={form.contribution_confirmed}
              onChange={(v) => set('contribution_confirmed', v)}
              error={errors.contribution_confirmed}
              label="I confirm this is original work, that I contributed meaningfully to it, and that all sources, datasets, images, and tools are cited. *"
            />
            <Check
              checked={form.ethics_confirmed}
              onChange={(v) => set('ethics_confirmed', v)}
              error={errors.ethics_confirmed}
              label="If my project involves human participants, personal data, animals, or hazardous experiments, it complies with my school’s and local legal and ethical requirements. *"
            />
            <Textarea
              label="AI assistance disclosure"
              value={form.ai_disclosure}
              onChange={(e) => set('ai_disclosure', e.target.value)}
              placeholder="Describe any material AI assistance (e.g. grammar checking, code suggestions), or write “None”."
              hint="AI-generated claims or fabricated results are prohibited."
              className="min-h-[80px]"
            />

            <div className="rounded-md border border-muted-200 bg-muted-50 p-4">
              <p className="mb-3 text-sm font-semibold text-navy-900">Public display (optional)</p>
              <div className="space-y-3">
                <Check
                  checked={form.public_display_consent}
                  onChange={(v) => set('public_display_consent', v)}
                  label="My name, project title, abstract, and poster may be published in the online gallery and on Research Bridge’s Instagram."
                />
                <Check
                  checked={form.paper_public_consent}
                  onChange={(v) => set('paper_public_consent', v)}
                  disabled={!form.public_display_consent}
                  label="My full research paper may also be shared publicly."
                />
                {isMinor && (
                  <Check
                    checked={form.guardian_consent}
                    onChange={(v) => set('guardian_consent', v)}
                    error={errors.guardian_consent}
                    label="I am under 18 and my parent or guardian has given permission for this public display."
                  />
                )}
              </div>
            </div>
          </div>
        </Section>
      </fieldset>

      {/* Actions */}
      {!locked && (
        <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-3 border-t border-muted-200 bg-muted-50/95 px-4 py-4 backdrop-blur sm:flex-row sm:justify-end md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
          <Button variant="secondary" onClick={() => save(false)} loading={saving === 'draft'} disabled={!!saving || !!uploading}>
            <Save className="h-4 w-4" /> Save draft
          </Button>
          <Button onClick={() => save(true)} loading={saving === 'submit'} disabled={!!saving || !!uploading}>
            <Send className="h-4 w-4" /> {status === 'submitted' ? 'Update submission' : 'Submit entry'}
          </Button>
        </div>
      )}
    </div>
  );
}

function Section({ n, title, done, children }: { n: number; title: string; done: boolean; children: ReactNode }) {
  return (
    <Card>
      <div className="flex items-center justify-between border-b border-muted-200 px-5 py-4">
        <h2 className="flex items-center gap-3 font-sans text-base font-semibold text-navy-950">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-900 text-xs text-white">{n}</span>
          {title}
        </h2>
        {done && <CheckCircle2 className="h-5 w-5 text-teal-500" />}
      </div>
      <CardBody className="py-5">{children}</CardBody>
    </Card>
  );
}

function Check({
  checked,
  onChange,
  label,
  error,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className={`flex cursor-pointer items-start gap-3 text-sm ${disabled ? 'opacity-50' : ''}`}>
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-navy-900"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="leading-relaxed text-muted-700">{label}</span>
      </label>
      {error && <p className="ml-7 mt-1 text-xs text-error-600">{error}</p>}
    </div>
  );
}

function FileSlot({
  icon,
  title,
  hint,
  accept,
  fileName,
  uploading,
  error,
  onPick,
  onOpen,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  accept: string;
  fileName: string | null;
  uploading: boolean;
  error?: string;
  onPick: (f: File | undefined) => void;
  onOpen: () => void;
}) {
  return (
    <div className={`rounded-md border-2 border-dashed p-5 ${error ? 'border-error-300 bg-error-50' : fileName ? 'border-teal-300 bg-teal-50/50' : 'border-muted-300 bg-surface'}`}>
      <div className="flex items-center gap-2 text-navy-900">
        <span className="text-teal-600">{icon}</span>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <p className="mt-1 text-xs text-muted-500">{hint}</p>
      {fileName && (
        <button type="button" onClick={onOpen} className="mt-3 block max-w-full truncate text-left text-sm font-medium text-teal-700 underline-offset-2 hover:underline">
          {fileName}
        </button>
      )}
      <label className="btn-secondary mt-3 cursor-pointer px-3 py-2 text-xs">
        {uploading ? (
          'Uploading…'
        ) : (
          <>
            <Upload className="h-3.5 w-3.5" /> {fileName ? 'Replace file' : 'Upload file'}
          </>
        )}
        <input
          type="file"
          accept={accept}
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            onPick(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </label>
      {error && <p className="mt-2 text-xs text-error-600">{error}</p>}
    </div>
  );
}
