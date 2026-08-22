/**
 * Bakes real metadata into the built HTML — one static file per route.
 *
 * A single-page app normally ships one `index.html` with one title. Every
 * crawler that matters here (Google, and the WhatsApp / Facebook / X link
 * unfurlers) reads that file *without running JavaScript*, so whatever React
 * sets later is invisible to them: pasted links show no preview card, and the
 * whole site indexes as a single untitled page.
 *
 * So at build time this emits `menu/index.html`, `reservations/index.html` and
 * so on, each with its own title, description, canonical and Open Graph tags,
 * plus JSON-LD, `robots.txt` and `sitemap.xml`. Everything is derived from
 * `src/data/*` and `src/lib/seo.ts`, so the markup cannot drift from the app.
 */

import type { Plugin } from 'vite'
import { SITE_URL, deliveryZones, site } from '../src/data/site'
import { categories, menu } from '../src/data/menu'
import { socialLinks } from '../src/data/content'
import { DAY_NAMES } from '../src/lib/hours'
import { fullTitle, notFoundMeta, routes, type RouteMeta } from '../src/lib/seo'

/** Replaced with the generated head tags. Present in `index.html`. */
const PLACEHOLDER = '<!--seo-->'

const OG_IMAGE = `${SITE_URL}/og-card.jpg`
const OG_WIDTH = 1200
const OG_HEIGHT = 630

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** A literal `</script>` inside a JSON-LD block would close the tag early. */
const escapeJsonLd = (value: string) => value.replace(/</g, '\\u003c')

const url = (path: string) => `${SITE_URL}${path === '/' ? '/' : path}`

/** Major units, as schema.org expects — the app stores kobo. */
const naira = (kobo: number) => (kobo / 100).toFixed(2)

function restaurantSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${SITE_URL}/#restaurant`,
    name: site.name,
    description: routes[0]?.description,
    url: url('/'),
    telephone: `+${site.whatsapp}`,
    email: site.email,
    image: [OG_IMAGE, `${SITE_URL}/img/burger-hero.jpg`],
    servesCuisine: ['Burgers', 'Nigerian', 'American'],
    priceRange: site.priceRange,
    currenciesAccepted: 'NGN',
    paymentAccepted: 'Cash, Bank transfer',
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.area,
      addressRegion: site.address.state,
      postalCode: site.address.postalCode,
      addressCountry: 'NG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    openingHoursSpecification: site.hours.map((block) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: block.days.map((day) => `https://schema.org/${DAY_NAMES[day]}`),
      opens: block.open,
      closes: block.close,
    })),
    hasMenu: url('/menu'),
    acceptsReservations: url('/reservations'),
    areaServed: deliveryZones.map((zone) => ({
      '@type': 'Place',
      name: `${zone.name}, Lagos`,
    })),
    sameAs: socialLinks.map((link) => link.href),
  }
}

function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: site.name,
    url: url('/'),
    inLanguage: 'en-NG',
    publisher: { '@id': `${SITE_URL}/#restaurant` },
    // The menu search lives in the URL as ?q=, so this is a real entry point.
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url('/menu')}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

function menuSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${SITE_URL}/menu#menu`,
    name: `${site.name} menu`,
    url: url('/menu'),
    inLanguage: 'en-NG',
    hasMenuSection: categories.map((category) => ({
      '@type': 'MenuSection',
      name: category.label,
      hasMenuItem: menu
        .filter((item) => item.category === category.id)
        .map((item) => ({
          '@type': 'MenuItem',
          name: item.name,
          description: item.description,
          image: `${SITE_URL}${item.image}`,
          ...(item.dietary?.includes('vegetarian')
            ? { suitableForDiet: 'https://schema.org/VegetarianDiet' }
            : {}),
          offers: {
            '@type': 'Offer',
            price: naira(item.price),
            priceCurrency: 'NGN',
            availability: 'https://schema.org/InStock',
          },
        })),
    })),
  }
}

function schemasFor(path: string): object[] {
  if (path === '/') return [restaurantSchema(), websiteSchema()]
  if (path === '/menu') return [menuSchema()]
  return []
}

function headFor(meta: RouteMeta, base: string): string {
  const title = fullTitle(meta)
  const canonical = url(meta.path)

  const lines = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    meta.indexable
      ? '<meta name="robots" content="index, follow, max-image-preview:large" />'
      : '<meta name="robots" content="noindex, follow" />',

    '',
    `<meta property="og:type" content="${meta.path === '/' ? 'restaurant.restaurant' : 'website'}" />`,
    `<meta property="og:site_name" content="${escapeHtml(site.name)}" />`,
    '<meta property="og:locale" content="en_NG" />',
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="${OG_WIDTH}" />`,
    `<meta property="og:image:height" content="${OG_HEIGHT}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(site.name + ' — ' + site.tagline)}" />`,

    '',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,

    '',
    `<link rel="icon" href="${base}favicon.svg" type="image/svg+xml" />`,
    `<link rel="icon" href="${base}favicon.ico" sizes="32x32" />`,
    `<link rel="apple-touch-icon" href="${base}apple-touch-icon.png" />`,
    `<link rel="manifest" href="${base}site.webmanifest" />`,
    '<meta name="theme-color" content="#ee4a1e" />',
    `<meta name="geo.position" content="${site.geo.latitude};${site.geo.longitude}" />`,
    '<meta name="geo.region" content="NG-LA" />',
    `<meta name="geo.placename" content="${escapeHtml(site.address.area)}" />`,
  ]

  for (const schema of schemasFor(meta.path)) {
    lines.push(
      '',
      `<script type="application/ld+json">${escapeJsonLd(JSON.stringify(schema))}</script>`,
    )
  }

  return lines.map((line) => (line ? `    ${line}` : '')).join('\n').trim()
}

function robotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    ...routes.filter((route) => !route.indexable).map((route) => `Disallow: ${route.path}`),
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n')
}

function sitemapXml(lastmod: string): string {
  const entries = routes
    .filter((route) => route.indexable)
    .map((route) =>
      [
        '  <url>',
        `    <loc>${url(route.path)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${route.changefreq ?? 'monthly'}</changefreq>`,
        `    <priority>${(route.priority ?? 0.5).toFixed(1)}</priority>`,
        '  </url>',
      ].join('\n'),
    )

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n')
}

export function seo(): Plugin {
  let base = '/'

  return {
    name: 'feranmi-seo',
    // Vite's own `vite:build-html` emits index.html in generateBundle. This has
    // to run after it, or there is nothing in the bundle to stamp.
    enforce: 'post',

    configResolved(config) {
      base = config.base
    },

    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        // Dev only. In a build the placeholder is left intact for
        // generateBundle, which stamps a different head onto each route.
        if (!ctx.server) return html
        const home = routes[0]
        return home ? html.replace(PLACEHOLDER, headFor(home, base)) : html
      },
    },

    generateBundle(_options, bundle) {
      const entry = bundle['index.html']
      if (!entry || entry.type !== 'asset') {
        this.warn('index.html is not in the bundle; no SEO tags were written')
        return
      }

      const shell = String(entry.source)
      if (!shell.includes(PLACEHOLDER)) {
        this.warn(`index.html has no ${PLACEHOLDER} marker; no SEO tags were written`)
        return
      }

      const render = (meta: RouteMeta) => shell.replace(PLACEHOLDER, headFor(meta, base))

      for (const route of routes) {
        if (route.path === '/') {
          entry.source = render(route)
          continue
        }
        // A directory index, so the host serves it for the bare path.
        this.emitFile({
          type: 'asset',
          fileName: `${route.path.replace(/^\//, '')}/index.html`,
          source: render(route),
        })
      }

      /*
       * GitHub Pages has no SPA rewrite: it serves 404.html for any path it has
       * no file for. Shipping the app shell there lets an unknown deep link
       * still boot the router, while the HTTP status stays a truthful 404.
       */
      this.emitFile({ type: 'asset', fileName: '404.html', source: render(notFoundMeta) })

      const lastmod = new Date().toISOString().slice(0, 10)
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(lastmod) })
    },
  }
}
