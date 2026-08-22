import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ErrorBoundary } from './ErrorBoundary'
import { useSeo } from '../hooks/useSeo'

/**
 * Moves focus and scroll on navigation. Without this a router leaves screen
 * readers parked at the bottom of the previous page.
 */
function useRouteChange() {
  const { pathname, hash } = useLocation()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (hash) {
      const target = document.querySelector(hash)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0 })
    const main = document.getElementById('main')
    main?.focus({ preventScroll: true })
  }, [pathname, hash])
}

export function Layout() {
  useRouteChange()
  useSeo()
  const { pathname } = useLocation()

  return (
    <>
      <a className="skipLink" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        {/* Keyed on the path so navigating away from a broken page clears the
            error rather than leaving the visitor stranded on it. */}
        <ErrorBoundary key={pathname} variant="route">
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  )
}
