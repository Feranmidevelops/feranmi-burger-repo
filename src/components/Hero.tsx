import { Link } from 'react-router-dom'
import { hero } from '../data/content'
import { asset } from '../lib/asset'
import { Smiley } from '@phosphor-icons/react'
import { Burst, ICON } from './Icons'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <h1 className={`display ${styles.heading}`}>
            {hero.headingLines.map((line) => (
              <span key={line} className={styles.line}>
                {line}
              </span>
            ))}
          </h1>
          <p className={`lead ${styles.body}`}>{hero.body}</p>
          <Link className={styles.cta} to="/menu">
            {hero.cta}
          </Link>
        </div>

        <div className={styles.art}>
          <figure className={styles.figure}>
            <img
              src={asset(hero.image)}
              alt={hero.imageAlt}
              width={500}
              height={500}
              decoding="async"
            />
          </figure>
          <span className={styles.seal} aria-hidden="true">
            <Burst className={styles.sealBurst} />
            <Smiley className={styles.sealFace} weight={ICON.strong} />
          </span>
        </div>
      </div>
    </section>
  )
}
