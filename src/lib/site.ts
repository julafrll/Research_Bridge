/** Absolute URL to a page of this site (works under the GitHub Pages sub-path). */
export function siteUrl(path = ''): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

/**
 * The `type` of the Supabase email link the visitor arrived with ("signup",
 * "recovery", "magiclink", …), read once when the app loads, before the
 * Supabase client consumes the token and clears it from the URL.
 */
export const initialAuthLinkType: string | null = (() => {
  const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('type');
  return fromHash ?? new URLSearchParams(window.location.search).get('type');
})();
