import { useEffect, useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { AuthError, AuthNotice } from '@/components/AuthShell';
import { friendlyCodeError } from '@/lib/authErrors';

/** Seconds a user must wait before asking for another code (Supabase's default per-user limit). */
const RESEND_COOLDOWN = 60;

interface EmailCodeFormProps {
  email: string;
  /** Check the code; resolve with an error message, or null on success. */
  onVerify: (code: string) => Promise<string | null>;
  /** Send a fresh code; resolve with an error message, or null on success. */
  onResend: () => Promise<string | null>;
  submitLabel?: string;
}

/** Field for the one-time code from the email, with a rate-limited "send a new code" link. */
export function EmailCodeForm({ email, onVerify, onResend, submitLabel = 'Verify and continue' }: EmailCodeFormProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const token = code.replace(/\D/g, '');
    if (token.length < 6) {
      setError('Enter the 6-digit code from the email.');
      return;
    }
    setVerifying(true);
    const verifyError = await onVerify(token);
    setVerifying(false);
    if (verifyError) setError(friendlyCodeError(verifyError));
  };

  const resend = async () => {
    setError(null);
    setNotice(null);
    setResending(true);
    const resendError = await onResend();
    setResending(false);
    if (resendError) {
      setError(friendlyCodeError(resendError));
      return;
    }
    setCode('');
    setCooldown(RESEND_COOLDOWN);
    setNotice(`A new code is on its way to ${email}. Only the newest code works.`);
  };

  return (
    <div>
      {error && <AuthError>{error}</AuthError>}
      {notice && <AuthNotice>{notice}</AuthNotice>}
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Code from the email"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^\d\s]/g, '').slice(0, 12))}
          placeholder="123456"
          inputMode="numeric"
          autoComplete="one-time-code"
          className="text-center font-mono text-2xl tracking-[0.5em]"
          required
          autoFocus
        />
        <Button type="submit" fullWidth size="lg" loading={verifying}>
          <KeyRound className="h-4 w-4" /> {submitLabel}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-500">
        Didn&apos;t get it? Check your spam folder, or{' '}
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0 || resending}
          className="link-teal disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resending ? 'sending…' : cooldown > 0 ? `send a new code in ${cooldown}s` : 'send a new code'}
        </button>
      </p>
    </div>
  );
}
