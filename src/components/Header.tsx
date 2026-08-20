import { useEffect, useState } from 'react'
import { navLinks, socialLinks } from '../data/content'
import { SocialIcon } from './Icons'
import styles from './Header.module.css'

export function Header() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <ul className={styles.social}>
          {socialLinks.map((s) => (
            <li key={s.name}>
              <a href={s.href} target="_blank" rel="noreferrer noopener">
                <SocialIcon name={s.name} className={styles.socialIcon} />
                <span className="visuallyHidden">{s.name}</span>
              </a>
            </li>
          ))}
        </ul>

        <nav className={styles.nav} aria-label="Primary">
          <ul className={styles.navList}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a className={styles.navLink} href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className={styles.burger}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="visuallyHidden">{open ? 'Close menu' : 'Open menu'}</span>
          <span className={styles.burgerBars} data-open={open} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>
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
              <a href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
