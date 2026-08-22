/**
 * Per-route metadata, in one table.
 *
 * Used twice: at build time to bake real `<title>`, description, canonical and
 * Open Graph tags into a static HTML file per route, and at runtime to keep the
 * same tags in step as the router navigates.
 *
 * The build-time half is the one that matters commercially. WhatsApp, Facebook
 * and Google's crawlers do not run JavaScript, so a single-page app that only
 * sets its tags in React is, to them, one untitled page — which is why a pasted
 * link shows no preview card.
 *
 * Node-importable: no browser globals, no `import.meta`.
 */

import { site } from '../data/site'

export interface RouteMeta {
  /** Route path, always with a leading slash and no trailing one (except "/"). */
  path: string
  /** Tab title, without the site-name suffix. Empty on the home page. */
  title: string
  description: string
  /** Left out of the sitemap and marked noindex when false. */
  indexable: boolean
  /** Sitemap hints. Ignored when `indexable` is false. */
  changefreq?: 'daily' | 'weekly' | 'monthly'
  priority?: number
}

export const HOME_TITLE = `${site.name} — ${site.tagline}`

export const routes: readonly RouteMeta[] = [
  {
    path: '/',
    title: '',
    description:
      'Burgers, suya-spiced fries and Chapman, cooked to order on Admiralty Way, Lekki. Order for delivery across Lagos on WhatsApp, or book a table.',
    indexable: true,
    changefreq: 'weekly',
    priority: 1,
  },
  {
    path: '/menu',
    title: 'Menu',
    description:
      'The full Feranmi Restaurant menu — ten dishes across burgers, chicken, sides and drinks, with Lagos prices and prep times. Search, filter and add to your order.',
    indexable: true,
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    path: '/reservations',
    title: 'Book a table',
    description:
      'Reserve a table at Feranmi Restaurant, 12 Admiralty Way, Lekki Phase 1. Pick a date, a time and a party size — the booking goes straight to us on WhatsApp.',
    indexable: true,
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    path: '/cart',
    title: 'Your order',
    // Personal, and different for every visitor — nothing for a crawler here.
    description: 'Review the items in your Feranmi Restaurant order before checkout.',
    indexable: false,
  },
  {
    path: '/checkout',
    title: 'Checkout',
    description: 'Confirm your delivery details and send your Feranmi Restaurant order.',
    indexable: false,
  },
]

export const notFoundMeta: RouteMeta = {
  path: '/404',
  title: 'Page not found',
  description: 'That page has moved or never existed. Head back to the menu.',
  indexable: false,
}

/** Normalises a pathname so "/menu/" and "/menu" resolve to the same entry. */
export function normalisePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

export function metaForPath(pathname: string): RouteMeta {
  const path = normalisePath(pathname)
  return routes.find((route) => route.path === path) ?? notFoundMeta
}

export function fullTitle(meta: RouteMeta): string {
  return meta.title ? `${meta.title} · ${site.name}` : HOME_TITLE
}
