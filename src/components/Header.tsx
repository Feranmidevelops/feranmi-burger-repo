import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { navLinks } from '../data/content'
import { useCart } from '../cart/CartContext'
import { Hamburger, ShoppingBag, X } from '@phosphor-icons/react'
import { ICON } from './Icons'
import styles from './Header.module.css'

export function Header() {
  const [open, setOpen] = useState(false)
  const { count } = useCart()
  const { pathname, hash } = useLocation()

  // Close the mobile menu whenever navigation happens.
  useEffect(() => setOpen(false), [pathname, hash])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link className={styles.brand} to="/">
          <span className={styles.brandMark}>Feranmi</span>
          <span className={styles.brandSub}>Restaurant</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <ul className={styles.navList}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <NavLink
                  className={({ isActive }) =>
                    isActive && !link.href.includes('#')
                      ? `${styles.navLink} ${styles.navLinkActive}`
                      : styles.navLink
                  }
                  to={link.href}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Link className={styles.cart} to="/cart">
            <ShoppingBag className={styles.cartIcon} weight={ICON.strong} />
            <span className="visuallyHidden">
              {count === 0 ? 'Cart, empty' : `Cart, ${count} items`}
            </span>
            {count > 0 && (
              <span className={styles.badge} aria-hidden="true">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            className={styles.burger}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="visuallyHidden">{open ? 'Close menu' : 'Open menu'}</span>
            {open ? (
              <X className={styles.burgerIcon} weight={ICON.strong} />
            ) : (
              <Hamburger className={styles.burgerIcon} weight={ICON.strong} />
            )}
          </button>
        </div>
      </div>

      <nav
        id="mobile-menu"
        className={styles.mobileMenu}
        data-open={open}
        aria-label="Mobile"
        hidden={!open}
      >
        <ul>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link to={link.href}>{link.label}</Link>
            </li>
          ))}
          <li>
            <Link to="/cart">Cart{count > 0 ? ` (${count})` : ''}</Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
