import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MailCheck, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { siteUrl } from '@/lib/site';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Spinner } from '@/components/ui';
import { AuthError, AuthNotice, AuthShell } from '@/components/AuthShell';

/* ----------------------------------------------------------------------------
 * Step 1 — request a reset link by email
 * --------------------------------------------------------------------------*/

export function ForgotPasswordPage() {
  const location = useLocation();
  const [email, setEmail] = useState<string>((location.state as { email?: string } | null)?.email ?? '');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: siteUrl('reset-password'),
    });
    setLoading(false);
    if (resetError) {
      setError(
        /rate limit/i.test(resetError.message)
          ? 'Too many emails were requested. Please wait a few minutes and try again.'
          : resetError.message
      );
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthShell title="Check your email">
        <div className="rounded-2xl border border-muted-200 bg-surface p-6 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
            <MailCheck className="h-7 w-7 text-teal-600" />
          </div>
          <p className="mt-4 text-navy-900">
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to reset your password.
          </p>
          <p className="mt-2 text-sm text-muted-500">
            The link expires in one hour. Check your spam folder if you don&apos;t see it.
          </p>
        </div>
        {error && <div className="mt-4"><AuthError>{error}</AuthError></div>}
        <div className="mt-6 flex flex-col items-center gap-3 text-sm">
          <button type="button" onClick={() => send()} disabled={loading} className="link-teal disabled:opacity-50">
            {loading ? 'Sending…' : 'Resend the email'}
          </button>
          <Link to="/login" className="text-muted-500 hover:text-navy-900">
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter the email you registered with and we'll send you a link to set a new password."
    >
      {error && <AuthError>{error}</AuthError>}
      <form onSubmit={send} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          autoFocus
        />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Send reset link
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-500">
        Remembered it?{' '}
        <Link to="/login" className="link-teal">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

/* ----------------------------------------------------------------------------
 * Step 2 — the link from the email lands here; choose a new password
 * --------------------------------------------------------------------------*/

function linkErrorFromUrl(): string | null {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, '') || window.location.search);
  const description = params.get('error_description');
  if (!description) return null;
  return /expired|invalid/i.test(description)
    ? 'This reset link has expired or was already used. Please request a new one.'
    : description.replace(/\+/g, ' ');
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading, isAdmin } = useAuth();
  const [linkError] = useState(linkErrorFromUrl);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // The Supabase client reads the token from the link and opens a short
  // "recovery" session; wait for it before showing the form.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY' || s) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) setReady(true);
  }, [session]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError('Use at least 8 characters.');
    if (password !== confirm) return setError('The passwords don’t match.');
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError(
        /different from the old/i.test(updateError.message)
          ? 'Choose a password different from your old one.'
          : updateError.message
      );
      return;
    }
    setDone(true);
    setTimeout(() => navigate(isAdmin ? '/admin' : '/competition', { replace: true }), 1800);
  };

  if (linkError) {
    return (
      <AuthShell title="Link not valid">
        <AuthError>{linkError}</AuthError>
        <Link to="/forgot-password" className="btn-primary w-full py-3">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password updated">
        <AuthNotice>Your new password is saved. Taking you to your account…</AuthNotice>
      </AuthShell>
    );
  }

  if (!ready) {
    return (
      <AuthShell title="Set a new password">
        {authLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <>
            <p className="text-muted-600">
              Open this page from the link in your password-reset email. If the link didn&apos;t work, request a new
              one.
            </p>
            <Link to="/forgot-password" className="btn-primary mt-6 w-full py-3">
              Request a reset link
            </Link>
          </>
        )}
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a new password for your Research Bridge account.">
      {error && <AuthError>{error}</AuthError>}
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="At least 8 characters"
          required
          autoComplete="new-password"
          autoFocus
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />
        <Button type="submit" fullWidth size="lg" loading={saving}>
          <KeyRound className="h-4 w-4" /> Save new password
        </Button>
      </form>
    </AuthShell>
  );
}
