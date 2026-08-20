import { Link } from 'react-router-dom'
import { different } from '../data/content'
import { asset } from '../lib/asset'
import { ArrowDown } from './Icons'
import styles from './Different.module.css'

export function Different() {
  return (
    <section className={styles.band}>
      <img
        className={styles.bg}
        src={asset(different.image)}
        alt={different.imageAlt}
        width={1440}
        height={600}
        loading="lazy"
      />
      <Link className={styles.action} to="/menu">
        <span className={`display ${styles.heading}`}>{different.heading}</span>
        <span className={styles.dot} aria-hidden="true">
          <ArrowDown className={styles.arrow} />
        </span>
      </Link>
    </section>
  )
}
