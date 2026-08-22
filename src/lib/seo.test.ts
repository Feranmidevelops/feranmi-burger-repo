import { describe, expect, it } from 'vitest'
import { fullTitle, metaForPath, normalisePath, notFoundMeta, routes } from './seo'
import { site } from '../data/site'

describe('normalisePath', () => {
  it('treats a trailing slash as the same page', () => {
    // GitHub Pages redirects /menu to /menu/, so both have to resolve.
    expect(normalisePath('/menu/')).toBe('/menu')
    expect(normalisePath('/menu')).toBe('/menu')
    expect(normalisePath('/')).toBe('/')
    expect(normalisePath('')).toBe('/')
  })
})

describe('metaForPath', () => {
  it('finds each known route', () => {
    expect(metaForPath('/').title).toBe('')
    expect(metaForPath('/menu').title).toBe('Menu')
    expect(metaForPath('/reservations').title).toBe('Book a table')
  })

  it('falls back to the 404 entry for anything unknown', () => {
    expect(metaForPath('/nope')).toBe(notFoundMeta)
  })
})

describe('fullTitle', () => {
  it('uses the tagline on the home page rather than a bare site name', () => {
    expect(fullTitle(metaForPath('/'))).toBe(`${site.name} — ${site.tagline}`)
  })

  it('suffixes every other page with the business name', () => {
    expect(fullTitle(metaForPath('/menu'))).toBe(`Menu · ${site.name}`)
  })
})

/**
 * Guards against the quiet ways metadata rots. These are the limits Google
 * actually truncates at, so a failure here means a listing that reads badly.
 */
describe('route metadata', () => {
  const all = [...routes, notFoundMeta]

  // Only indexable pages get a floor: a noindex description is never rendered
  // in a search result, it is only there for a shared link. The ceiling applies
  // everywhere, because that one is about truncation in a preview card.
  it.each(routes.filter((route) => route.indexable).map((route) => [route.path, route] as const))(
    '%s has a description long enough to fill a search result',
    (_path, route) => {
      expect(route.description.length).toBeGreaterThanOrEqual(110)
    },
  )

  it.each(all.map((route) => [route.path, route] as const))(
    '%s has a description short enough not to be truncated',
    (_path, route) => {
      expect(route.description.length).toBeGreaterThan(0)
      expect(route.description.length).toBeLessThanOrEqual(165)
    },
  )

  it.each(all.map((route) => [route.path, route] as const))(
    '%s has a title short enough not to be cut off',
    (_path, route) => {
      expect(fullTitle(route).length).toBeLessThanOrEqual(65)
    },
  )

  it('has no duplicate paths, which would give two pages the same canonical', () => {
    const paths = routes.map((route) => route.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('has no duplicate descriptions', () => {
    const descriptions = routes.map((route) => route.description)
    expect(new Set(descriptions).size).toBe(descriptions.length)
  })

  it('keeps the personal pages out of the index', () => {
    expect(metaForPath('/cart').indexable).toBe(false)
    expect(metaForPath('/checkout').indexable).toBe(false)
    expect(notFoundMeta.indexable).toBe(false)
  })

  it('gives every indexable route sitemap hints', () => {
    for (const route of routes.filter((entry) => entry.indexable)) {
      expect(route.changefreq).toBeDefined()
      expect(route.priority).toBeGreaterThan(0)
    }
  })
})
