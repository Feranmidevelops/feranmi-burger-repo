import { hero } from '../data/content'
import { Burst, Smiley } from './Icons'
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
          <a className={styles.cta} href="#menu">
            {hero.cta}
          </a>
        </div>

        <div className={styles.art}>
          <figure className={styles.figure}>
            <img
              src={hero.image}
              alt={hero.imageAlt}
              width={500}
              height={500}
              fetchPriority="high"
              decoding="async"
            />
          </figure>
          <span className={styles.seal} aria-hidden="true">
            <Burst className={styles.sealBurst} />
            <Smiley className={styles.sealFace} />
          </span>
        </div>
      </div>
    </section>
  )
}
