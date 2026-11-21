import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { siteUrl } from '@/lib/site';
import type { Profile, UserRole } from '@/types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  /** Email a one-time sign-in code to an existing account. */
  sendLoginCode: (email: string) => Promise<{ error: string | null }>;
  /** Check a code from any of our emails (sign-in or sign-up confirmation) and sign the user in. */
  verifyEmailCode: (email: string, code: string) => Promise<{ error: string | null; role: UserRole | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const role: UserRole | null = (user?.app_metadata?.role as UserRole) ?? null;
  const isAdmin = role === 'admin';

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error.message);
      return;
    }
    setProfile(data as Profile | null);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        fetchProfile(initialSession.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      // A reset link can land on the home page if Supabase's redirect
      // allow-list doesn't include /reset-password — send it to the form.
      if (event === 'PASSWORD_RECOVERY' && !window.location.pathname.endsWith('/reset-password')) {
        window.location.replace(siteUrl('reset-password'));
        return;
      }
      (async () => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // Where the "confirm your email" link sends people back to.
        emailRedirectTo: siteUrl('competition'),
      },
    });

    if (error) return { error: error.message };

    if (!data.user) {
      return { error: 'Registration failed. Please try again.' };
    }

    // With email confirmation on, Supabase returns a user but no session.
    // An empty identities list means the email is already registered.
    if (!data.session && data.user.identities && data.user.identities.length === 0) {
      return { error: 'An account with this email already exists. Try signing in or resetting your password.' };
    }

    return { error: null, needsConfirmation: !data.session };
  }, []);

  const sendLoginCode = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Sign-in only: new participants register first so we collect their name.
        shouldCreateUser: false,
        emailRedirectTo: siteUrl('competition'),
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const verifyEmailCode = useCallback(async (email: string, code: string) => {
    // type 'email' covers both the sign-in code and the sign-up confirmation code.
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    if (error) return { error: error.message, role: null };
    if (!data.session) return { error: 'We could not sign you in. Please request a new code.', role: null };
    return { error: null, role: (data.session.user.app_metadata?.role as UserRole) ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const value: AuthContextValue = {
    session,
    user,
    profile,
    role,
    loading,
    isAdmin,
    signIn,
    signUp,
    sendLoginCode,
    verifyEmailCode,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
