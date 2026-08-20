import { useState, type FormEvent } from 'react'
import { footer, navLinks, socialLinks } from '../data/content'
import { SocialIcon } from './Icons'
import styles from './Footer.module.css'

export function Footer() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // No backend in the design — acknowledge locally so the control is testable.
    setSent(true)
    setEmail('')
  }

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.main}>
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

          <h2 className={`display ${styles.heading}`}>{footer.heading}</h2>
          <p className={styles.body}>{footer.body}</p>

          <form className={styles.form} onSubmit={onSubmit}>
            <label className="visuallyHidden" htmlFor="newsletter-email">
              {footer.emailPlaceholder}
            </label>
            <input
              id="newsletter-email"
              className={styles.input}
              type="email"
              name="email"
              required
              placeholder={footer.emailPlaceholder}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button type="submit" className={styles.submit}>
              {footer.submit}
            </button>
          </form>

          <p className={styles.status} role="status">
            {sent ? 'Thanks — you’re on the list.' : ''}
          </p>

          <ul className={styles.legal}>
            {footer.legal.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <nav className={styles.nav} aria-label="Footer">
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
