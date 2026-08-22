import { describe, expect, it } from 'vitest'
import {
  allRoutes,
  clampDescription,
  DESCRIPTION_MAX,
  fullTitle,
  menuItemMeta,
  menuItemPath,
  menuItemRoutes,
  metaForPath,
  normalisePath,
  notFoundMeta,
  routes,
} from './seo'
import { site } from '../data/site'
import { menu } from '../data/menu'

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
  const all = [...allRoutes, notFoundMeta]

  // Only indexable pages get a floor: a noindex description is never rendered
  // in a search result, it is only there for a shared link. The ceiling applies
  // everywhere, because that one is about truncation in a preview card.
  it.each(allRoutes.filter((route) => route.indexable).map((route) => [route.path, route] as const))(
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
    const paths = allRoutes.map((route) => route.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('has no duplicate descriptions — duplicates get filtered out of an index', () => {
    const descriptions = allRoutes.map((route) => route.description)
    expect(new Set(descriptions).size).toBe(descriptions.length)
  })

  it('keeps the personal pages out of the index', () => {
    expect(metaForPath('/cart').indexable).toBe(false)
    expect(metaForPath('/checkout').indexable).toBe(false)
    expect(notFoundMeta.indexable).toBe(false)
  })

  it('gives every indexable route sitemap hints', () => {
    for (const route of allRoutes.filter((entry) => entry.indexable)) {
      expect(route.changefreq).toBeDefined()
      expect(route.priority).toBeGreaterThan(0)
    }
  })
})

describe('clampDescription', () => {
  it('leaves a description that already fits', () => {
    expect(clampDescription('Short and sweet.')).toBe('Short and sweet.')
  })

  it('trims to a word boundary rather than mid-word', () => {
    const long = 'a'.repeat(40) + ' ' + 'b'.repeat(200)
    const clamped = clampDescription(long, 60)
    expect(clamped.length).toBeLessThanOrEqual(60)
    expect(clamped).toBe('a'.repeat(40) + '…')
  })

  it('does not leave dangling punctuation before the ellipsis', () => {
    expect(clampDescription('Beef, onions, ragu, and a rye bun on the side', 20)).not.toContain(',…')
  })
})

describe('dish pages', () => {
  it('gives every dish its own route', () => {
    expect(menuItemRoutes).toHaveLength(menu.length)
    expect(allRoutes).toHaveLength(routes.length + menu.length)
  })

  it('resolves a dish path to that dish', () => {
    for (const item of menu) {
      const meta = metaForPath(menuItemPath(item))
      expect(meta.title).toBe(item.name)
      expect(meta.menuItemId).toBe(item.id)
    }
  })

  it('tolerates the trailing slash a static host redirects to', () => {
    const item = menu[0]
    if (!item) throw new Error('empty menu')
    expect(metaForPath(`/menu/${item.id}/`).menuItemId).toBe(item.id)
  })

  it('404s an unknown dish rather than rendering a blank page', () => {
    expect(metaForPath('/menu/pounded-yam')).toBe(notFoundMeta)
  })

  it('does not mistake the menu index for a dish', () => {
    expect(metaForPath('/menu').menuItemId).toBeUndefined()
  })

  it('describes each dish from its own long copy, within the search limit', () => {
    for (const item of menu) {
      const meta = menuItemMeta(item)
      expect(meta.description.length).toBeLessThanOrEqual(DESCRIPTION_MAX)
      expect(meta.description.length).toBeGreaterThanOrEqual(110)
      // The opening of the detail copy, so the two never drift apart.
      expect(item.detail.startsWith(meta.description.replace('…', '').trim())).toBe(true)
    }
  })

  it('keeps every dish indexable and in the sitemap', () => {
    expect(menuItemRoutes.every((route) => route.indexable)).toBe(true)
  })
})
