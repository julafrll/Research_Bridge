import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { siteUrl } from '@/lib/site';
import { Button, Input } from '@/components/ui';
import { AuthError, AuthNotice, AuthShell } from '@/components/AuthShell';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setUnconfirmed(false);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      if (/not confirmed/i.test(signInError)) {
        setUnconfirmed(true);
        setError('Please confirm your email address first. Check your inbox for the confirmation link.');
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

  const resendConfirmation = async () => {
    setError(null);
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: siteUrl('competition') },
    });
    if (resendError) setError(resendError.message);
    else setNotice(`We sent a new confirmation link to ${email}.`);
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your competition entry.">
      {error && (
        <AuthError>
          {error}
          {unconfirmed && (
            <button type="button" onClick={resendConfirmation} className="mt-2 block font-semibold underline">
              Resend confirmation email
            </button>
          )}
        </AuthError>
      )}
      {notice && <AuthNotice>{notice}</AuthNotice>}

      <form onSubmit={handleSubmit} className="space-y-4">
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

      <p className="mt-8 text-center text-sm text-muted-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="link-teal">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
