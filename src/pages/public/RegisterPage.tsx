import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { siteUrl } from '@/lib/site';
import { Button, Input } from '@/components/ui';
import { AuthError, AuthNotice, AuthShell } from '@/components/AuthShell';

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    const { error: signUpError, needsConfirmation } = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }

    if (needsConfirmation) {
      setAwaitingConfirmation(true);
      return;
    }

    // Email confirmation is off in Supabase: the user is already signed in.
    navigate('/competition');
  };

  const resend = async () => {
    setError(null);
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: siteUrl('competition') },
    });
    if (resendError) setError(resendError.message);
    else setResent(true);
  };

  if (awaitingConfirmation) {
    return (
      <AuthShell title="Confirm your email">
        <div className="rounded-2xl border border-muted-200 bg-surface p-6 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
            <MailCheck className="h-7 w-7 text-teal-600" />
          </div>
          <p className="mt-4 text-navy-900">
            We sent a confirmation link to <strong>{email}</strong>.
          </p>
          <p className="mt-2 text-sm text-muted-500">
            Open it to activate your account — it brings you straight to your competition entry. Check your spam folder
            if it doesn&apos;t arrive within a few minutes.
          </p>
        </div>
        <div className="mt-5">
          {error && <AuthError>{error}</AuthError>}
          {resent && <AuthNotice>A new confirmation link is on its way.</AuthNotice>}
        </div>
        <div className="flex flex-col items-center gap-3 text-sm">
          <button type="button" onClick={resend} className="link-teal">
            Resend confirmation email
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
      title="Create your account"
      subtitle="Register for the Online Research Paper Competition. You'll confirm your email in the next step."
    >
      {error && (
        <AuthError>
          {error}
          {/already exists/i.test(error) && (
            <Link to="/forgot-password" state={{ email }} className="mt-2 block font-semibold underline">
              Reset your password
            </Link>
          )}
        </AuthError>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          type="text"
          name="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Doe"
          required
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            required
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" fullWidth loading={loading} size="lg">
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-500">
        Already have an account?{' '}
        <Link to="/login" className="link-teal">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
