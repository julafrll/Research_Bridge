import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { siteUrl } from '@/lib/site';
import { Button, Input } from '@/components/ui';
import { AuthError, AuthNotice, AuthShell } from '@/components/AuthShell';
import { EmailCodeForm } from '@/components/EmailCodeForm';
import { friendlyCodeError } from '@/lib/authErrors';

type Method = 'password' | 'code';

export function LoginPage() {
  const { signIn, sendLoginCode, verifyEmailCode } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  /** Email the code was sent to; set once the code step is showing. */
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);

  const switchMethod = (next: Method) => {
    setMethod(next);
    setError(null);
    setNotice(null);
    setUnconfirmed(false);
    setCodeSentTo(null);
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setUnconfirmed(false);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      if (/not confirmed/i.test(signInError)) {
        setUnconfirmed(true);
        setError('Please confirm your email address first. Check your inbox for the confirmation email.');
      } else if (/invalid login credentials/i.test(signInError)) {
        setError('Incorrect email or password.');
      } else {
        setError(signInError);
      }
      setLoading(false);
      return;
    }

    navigate('/');
  };

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const target = email.trim();
    const { error: sendError } = await sendLoginCode(target);
    setLoading(false);
    if (sendError) {
      setError(friendlyCodeError(sendError));
      return;
    }
    setCodeSentTo(target);
  };

  const verifyCode = async (code: string) => {
    const target = codeSentTo ?? email.trim();
    const { error: verifyError, role } = await verifyEmailCode(target, code);
    if (verifyError) return verifyError;
    navigate(role === 'admin' ? '/admin' : '/competition', { replace: true });
    return null;
  };

  const resendCode = async () => (await sendLoginCode(codeSentTo ?? email.trim())).error;

  const resendConfirmation = async () => {
    setError(null);
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: siteUrl('competition') },
    });
    if (resendError) setError(friendlyCodeError(resendError.message));
    else setNotice(`We sent a new confirmation email to ${email}.`);
  };

  // Step 2 of code sign-in: type the code from the email.
  if (method === 'code' && codeSentTo) {
    return (
      <AuthShell title="Check your email" subtitle={<>We sent a 6-digit sign-in code to <strong>{codeSentTo}</strong>.</>}>
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
            <MailCheck className="h-7 w-7 text-teal-600" />
          </div>
        </div>
        <EmailCodeForm email={codeSentTo} onVerify={verifyCode} onResend={resendCode} submitLabel="Sign in" />
        <div className="mt-6 flex flex-col items-center gap-3 text-sm">
          <button type="button" onClick={() => setCodeSentTo(null)} className="text-muted-500 hover:text-navy-900">
            Use a different email
          </button>
          <button type="button" onClick={() => switchMethod('password')} className="text-muted-500 hover:text-navy-900">
            Sign in with a password instead
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your competition entry.">
      <div role="tablist" aria-label="Sign-in method" className="mb-6 grid grid-cols-2 gap-1 rounded-lg border border-muted-200 bg-surface p-1">
        {(
          [
            ['password', 'Password'],
            ['code', 'Email me a code'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={method === value}
            onClick={() => switchMethod(value)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              method === value ? 'bg-teal-600 text-white shadow-sm' : 'text-muted-600 hover:text-navy-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <AuthError>
          {error}
          {unconfirmed && (
            <button type="button" onClick={resendConfirmation} className="mt-2 block font-semibold underline">
              Resend confirmation email
            </button>
          )}
          {method === 'code' && /no account/i.test(error) && (
            <Link to="/register" className="mt-2 block font-semibold underline">
              Create an account
            </Link>
          )}
        </AuthError>
      )}
      {notice && <AuthNotice>{notice}</AuthNotice>}

      {method === 'password' ? (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
          <div>
            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            <div className="mt-2 text-right">
              <Link to="/forgot-password" state={{ email }} className="link-teal text-sm">
                Forgot password?
              </Link>
            </div>
          </div>
          <Button type="submit" fullWidth loading={loading} size="lg">
            Sign in
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSendCode} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            hint="We'll email you a 6-digit code. No password needed."
            required
            autoComplete="email"
          />
          <Button type="submit" fullWidth loading={loading} size="lg">
            Send me a code
          </Button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-muted-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="link-teal">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
