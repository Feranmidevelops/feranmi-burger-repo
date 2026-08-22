import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE_URL } from '../data/site'
import { fullTitle, metaForPath, normalisePath } from '../lib/seo'

/** Creates the tag if the build did not already bake one in. */
function upsert(selector: string, create: () => HTMLElement): HTMLElement {
  const existing = document.head.querySelector<HTMLElement>(selector)
  if (existing) return existing
  const created = create()
  document.head.append(created)
  return created
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  const tag = upsert(`meta[${attribute}="${key}"]`, () => {
    const element = document.createElement('meta')
    element.setAttribute(attribute, key)
    return element
  })
  tag.setAttribute('content', content)
}

/**
 * Keeps the head in step with client-side navigation.
 *
 * The build bakes correct tags into a static file per route, so a crawler or a
 * WhatsApp link preview never depends on this. This is for the visitor already
 * in the app: the tab title, and the canonical URL, following them around.
 */
export function useSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const path = normalisePath(pathname)
    const meta = metaForPath(path)
    const url = `${SITE_URL}${path === '/' ? '/' : path}`
    const title = fullTitle(meta)

    document.title = title
    setMeta('name', 'description', meta.description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', meta.description)
    setMeta('property', 'og:url', url)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', meta.description)

    // Cart, checkout and 404 are noise in an index; the tag has to be removed
    // again on the way out or it would stick for the rest of the session.
    const robots = document.head.querySelector('meta[name="robots"]')
    if (meta.indexable) {
      robots?.remove()
    } else {
      setMeta('name', 'robots', 'noindex, follow')
    }

    const canonical = upsert('link[rel="canonical"]', () => {
      const element = document.createElement('link')
      element.rel = 'canonical'
      return element
    }) as HTMLLinkElement
    canonical.href = url
  }, [pathname])
}
