import { different } from '../data/content'
import { ArrowDown } from './Icons'
import styles from './Different.module.css'

export function Different() {
  return (
    <section className={styles.band}>
      <img
        className={styles.bg}
        src={different.image}
        alt={different.imageAlt}
        width={1440}
        height={600}
        loading="lazy"
      />
      <a className={styles.action} href={different.href}>
        <span className={`display ${styles.heading}`}>{different.heading}</span>
        <span className={styles.dot} aria-hidden="true">
          <ArrowDown className={styles.arrow} />
        </span>
      </a>
    </section>
  )
}
