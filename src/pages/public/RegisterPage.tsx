import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { siteUrl } from '@/lib/site';
import { Button, Input } from '@/components/ui';
import { AuthError, AuthShell } from '@/components/AuthShell';
import { EmailCodeForm } from '@/components/EmailCodeForm';

export function RegisterPage() {
  const { signUp, verifyEmailCode } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

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
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: siteUrl('competition') },
    });
    return resendError?.message ?? null;
  };

  const verifyCode = async (code: string) => {
    const { error: verifyError } = await verifyEmailCode(email.trim(), code);
    if (verifyError) return verifyError;
    navigate('/competition', { replace: true });
    return null;
  };

  if (awaitingConfirmation) {
    return (
      <AuthShell
        title="Confirm your email"
        subtitle={<>We sent a 6-digit code to <strong>{email}</strong>. Enter it below to activate your account.</>}
      >
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
            <MailCheck className="h-7 w-7 text-teal-600" />
          </div>
        </div>
        <EmailCodeForm email={email} onVerify={verifyCode} onResend={resend} submitLabel="Confirm and continue" />
        <div className="mt-6 flex flex-col items-center gap-3 text-sm">
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
      subtitle="Register for the Online Research Paper Competition. You'll confirm your email with a code in the next step."
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
