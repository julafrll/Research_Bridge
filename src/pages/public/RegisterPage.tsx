import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';

export function RegisterPage() {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    const { error: signUpError } = await signUp(email, password, fullName);

    if (signUpError) {
      setError(signUpError);
      setLoading(false);
      return;
    }

    // Auto sign-in after registration
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError('Account created. Please sign in.');
      setLoading(false);
      navigate('/login');
      return;
    }

    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted-50">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <BrandLogo size="md" showTagline />
          </div>

          <div className="card rounded-xl p-8">
            <h1 className="text-2xl font-bold text-navy-900">Create your account</h1>
            <p className="mt-2 text-sm text-muted-500">
              Create an account to register for the Online Research Paper Competition.
            </p>

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
              <Input
                label="Password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
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
                autoComplete="new-password"
              />
              <Button type="submit" fullWidth loading={loading} size="lg">
                Create Account
              </Button>
            </form>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-navy-50 px-4 py-3 text-xs text-navy-600">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-navy-500" />
              <span>You'll be registered as a student. Admin access is set up separately.</span>
            </div>

            <p className="mt-6 text-center text-sm text-muted-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-navy-700 hover:text-navy-900"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
