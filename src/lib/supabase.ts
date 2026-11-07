import { createClient } from '@supabase/supabase-js';

/** Strip whitespace and accidental surrounding quotes from a pasted value. */
function clean(value: string | undefined): string {
  return (value ?? '').trim().replace(/^['"]|['"]$/g, '').trim();
}

/**
 * Accepts the common ways a Supabase URL gets pasted into a secret:
 *   https://abcd.supabase.co   abcd.supabase.co   https://abcd.supabase.co/
 *   abcd (just the project ref)
 * Returns '' if the value can't be turned into a valid http(s) URL.
 */
function normalizeUrl(raw: string): string {
  let value = raw;
  if (!value) return '';
  if (/^[a-z0-9]{15,30}$/.test(value)) value = `${value}.supabase.co`;
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return '';
  }
}

const rawUrl = clean(import.meta.env.VITE_SUPABASE_URL);
const supabaseUrl = normalizeUrl(rawUrl);
const supabaseAnonKey = clean(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // Don't crash the whole site: the public pages still render, and only
  // sign-in, entries and the gallery stop working until the keys are fixed.
  const problems = [
    !rawUrl && 'VITE_SUPABASE_URL is empty',
    rawUrl && !supabaseUrl && 'VITE_SUPABASE_URL is not a valid URL (expected https://<project>.supabase.co)',
    !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY is empty',
  ].filter(Boolean);
  console.error(
    `Supabase is not configured: ${problems.join('; ')}. ` +
      'Set these in .env locally, or as repository secrets for the GitHub Pages build.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://not-configured.supabase.co',
  supabaseAnonKey || 'not-configured',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
