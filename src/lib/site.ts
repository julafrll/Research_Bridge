/** Absolute URL to a page of this site (works under the GitHub Pages sub-path). */
export function siteUrl(path = ''): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
