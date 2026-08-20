/**
 * Resolves a public asset against the deploy base path. GitHub Pages serves the
 * app from a sub-path, so a bare "/img/x.jpg" would 404 there.
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}
