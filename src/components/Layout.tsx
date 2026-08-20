import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

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

  return (
    <>
      <a className="skipLink" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
