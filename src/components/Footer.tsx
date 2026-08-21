import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { footer, navLinks, socialLinks } from '../data/content'
import { addressLine, site } from '../data/site'
import { Clock, EnvelopeSimple, MapPin, Phone } from '@phosphor-icons/react'
import { ICON, SocialIcon } from './Icons'
import styles from './Footer.module.css'

export function Footer() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // No mailing-list backend in this build — acknowledge locally.
    setSent(true)
    setEmail('')
  }

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.main}>
          <ul className={styles.social}>
            {socialLinks.map((social) => (
              <li key={social.name}>
                <a href={social.href} target="_blank" rel="noreferrer noopener">
                  <SocialIcon name={social.name} className={styles.socialIcon} />
                  <span className="visuallyHidden">{social.name}</span>
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

        <div className={styles.side}>
          <nav className={styles.nav} aria-label="Footer">
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.contact}>
            <h3 className={styles.contactTitle}>
              <MapPin weight={ICON.strong} aria-hidden />
              Visit us
            </h3>
            <address className={styles.address}>{addressLine}</address>
            <p className={styles.contactRow}>
              <Phone weight={ICON.body} aria-hidden />
              <a className={styles.link} href={`tel:+${site.whatsapp}`}>
                {site.phoneDisplay}
              </a>
            </p>
            <p className={styles.contactRow}>
              <EnvelopeSimple weight={ICON.body} aria-hidden />
              <a className={styles.link} href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </p>

            <h3 className={styles.contactTitle}>
              <Clock weight={ICON.strong} aria-hidden />
              Hours
            </h3>
            <dl className={styles.hours}>
              {site.hours.map((entry) => (
                <div key={entry.days}>
                  <dt>{entry.days}</dt>
                  <dd>
                    {entry.open} – {entry.close}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <p className={`container ${styles.colophon}`}>
        © {new Date().getFullYear()} {site.name} · {site.address.area}, {site.address.city},{' '}
        {site.address.country}
      </p>
    </footer>
  )
}
