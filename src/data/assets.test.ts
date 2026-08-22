import { describe, expect, it } from 'vitest'
import { menu } from './menu'
import { about, different, hero, instagram, menuSection, reviewsSection } from './content'

/**
 * Guards the one way images silently disappear in production.
 *
 * Development happens on Windows and macOS, where the filesystem does not care
 * about case. GitHub Actions and GitHub Pages are Linux, where it does. So a
 * path written as `/img/Chapman.jpg` against a file named `chapman.jpg` looks
 * perfect locally, builds green, and then 404s for every real visitor — the
 * failure mode hardest to catch by looking.
 *
 * These run in CI on Linux before the deploy step, so a mismatch fails the
 * build instead of reaching the site.
 */

/*
 * Enumerated through Vite rather than `node:fs`, so this stays inside the app's
 * own TypeScript project, which deliberately has no Node types.
 * `import.meta.glob` without `eager` returns loader functions and imports
 * nothing; only the keys are read.
 */
const FILES: string[] = Object.keys(import.meta.glob('/public/img/*')).map(
  (path) => path.split('/').pop() as string,
)

/** Component sources as text, for the hardcoded-src check. */
const SOURCES = import.meta.glob('/src/**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Every image path the app can ask for, gathered from the data it renders. */
function referencedPaths(): { path: string; source: string }[] {
  const refs: { path: string; source: string }[] = []

  for (const item of menu) refs.push({ path: item.image, source: `menu: ${item.id}` })
  for (const tile of instagram.tiles) {
    refs.push({ path: tile.image, source: `instagram: ${tile.id}` })
  }
  for (const card of menuSection.items) {
    refs.push({ path: card.image, source: `featured: ${card.id}` })
  }
  for (const column of reviewsSection.columns) {
    for (const review of column) refs.push({ path: review.avatar, source: `review: ${review.id}` })
  }

  refs.push(
    { path: hero.image, source: 'hero' },
    { path: about.portrait, source: 'about portrait' },
    { path: about.featureImage, source: 'about feature' },
    { path: different.image, source: 'different' },
  )

  return refs
}

describe('image assets', () => {
  const referenced = referencedPaths()

  it('finds the images on disk, and the references to them', () => {
    expect(FILES.length).toBeGreaterThan(20)
    expect(referenced.length).toBeGreaterThan(20)
    expect(Object.keys(SOURCES).length).toBeGreaterThan(10)
  })

  it.each(referenced.map((ref) => [ref.path, ref.source] as const))(
    '%s (%s) exists in public/img with exactly that case',
    (path) => {
      const name = path.replace('/img/', '')
      const insensitive = FILES.find((file) => file.toLowerCase() === name.toLowerCase())

      // Split so the message says which of the two problems it is.
      expect(insensitive, `nothing resembling ${name} in public/img`).toBeDefined()
      expect(FILES, `public/img has "${insensitive}" — the path says "${name}"`).toContain(name)
    },
  )

  it('references only paths under /img/, so asset() can resolve them', () => {
    for (const { path, source } of referenced) {
      expect(path.startsWith('/img/'), `${source} points at ${path}`).toBe(true)
    }
  })

  /*
   * A hardcoded src bypasses asset(), which is what prefixes the GitHub Pages
   * sub-path. It works on a dev server rooted at "/" and 404s once deployed.
   */
  it('never hardcodes an image src outside asset()', () => {
    const offenders: string[] = []
    const hardcoded = /src=\{?["'`]\/img\//

    for (const [path, source] of Object.entries(SOURCES)) {
      if (path.includes('.test.')) continue
      for (const line of source.split('\n')) {
        if (hardcoded.test(line)) offenders.push(`${path}: ${line.trim()}`)
      }
    }

    expect(offenders).toEqual([])
  })

  it('ships no image the app never asks for beyond the known spares', () => {
    const used = new Set(referenced.map((ref) => ref.path.replace('/img/', '')))
    // Referenced directly in a component rather than through the data files.
    used.add('kitchen-staff.jpg')

    const spare = FILES.filter((file) => !used.has(file)).sort()

    /*
     * Unused files still ship to Pages. These three are kept deliberately, so
     * the list is pinned: a new arrival means something was added and never
     * wired up, or unwired and left behind.
     */
    expect(spare).toEqual(['kitchen-bw.jpg', 'open-sign.jpg', 'plated-burger.jpg'])
  })
})
