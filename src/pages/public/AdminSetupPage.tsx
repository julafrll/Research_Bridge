import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, AlertCircle, ShieldCheck, Info } from 'lucide-react';
import { Button, Input, Alert } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export function AdminSetupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

    try {
      const { data, error: fnError } = await supabase.functions.invoke('setup-admin', {
        body: JSON.stringify({ email, password, fullName }),
      });

      if (fnError) {
        setError(fnError.message);
        setLoading(false);
        return;
      }

      const result = data as { success?: boolean; error?: string; message?: string };

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.success) {
        setSuccess(true);
        setLoading(false);
      }
    } catch {
      setError('Failed to set up admin account. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-muted-50">
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-navy-900">Research Bridge</span>
            </Link>

            <div className="card rounded-xl p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-50">
                <ShieldCheck className="h-7 w-7 text-success-600" />
              </div>
              <h1 className="text-2xl font-bold text-navy-900">Admin account created</h1>
              <p className="mt-2 text-sm text-muted-500">
                Your administrator account has been set up successfully. You can now sign
                in with your email and password.
              </p>
              <Button
                className="mt-6"
                size="lg"
                fullWidth
                onClick={() => navigate('/login')}
              >
                Sign In as Admin
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted-50">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-navy-900">Research Bridge</span>
          </Link>

          <div className="card rounded-xl p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100">
                <ShieldCheck className="h-5 w-5 text-navy-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy-900">Admin Setup</h1>
                <p className="text-sm text-muted-500">Create the first administrator account</p>
              </div>
            </div>

            <Alert variant="info" className="mt-4">
              This page creates the initial admin account for your platform. It only works
              when no admin exists yet. After setup, this page will be disabled for security.
            </Alert>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                label="Full Name"
                type="text"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Admin Name"
                required
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                hint="Minimum 8 characters"
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
              />
              <Button type="submit" fullWidth loading={loading} size="lg">
                Create Admin Account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-500">
              <Link
                to="/login"
                className="font-medium text-navy-700 hover:text-navy-900"
              >
                Back to sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted-100 px-4 py-3 text-xs text-muted-500">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span>
              The admin role is stored securely in your authentication metadata and cannot
              be self-assigned by regular users. Keep your credentials safe.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
