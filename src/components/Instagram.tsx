import { instagram } from '../data/content'
import styles from './Instagram.module.css'

export function Instagram() {
  return (
    <section id="social" className={styles.strip}>
      <h2 className="visuallyHidden">Follow us on Instagram</h2>
      {instagram.tiles.map((tile) => (
        <a
          key={tile.id}
          className={styles.tile}
          href={instagram.href}
          target="_blank"
          rel="noreferrer noopener"
        >
          <img src={tile.image} alt={tile.alt} width={288} height={289} loading="lazy" />
        </a>
      ))}

      <a
        className={styles.follow}
        href={instagram.href}
        target="_blank"
        rel="noreferrer noopener"
      >
        {instagram.headingLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </a>
    </section>
  )
}
