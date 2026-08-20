import { about } from '../data/content'
import { asset } from '../lib/asset'
import styles from './About.module.css'

export function About() {
  return (
    <section id="about" className={styles.about}>
      <div className={`container ${styles.inner}`}>
        <h2 className={`display ${styles.heading}`}>{about.heading}</h2>

        <figure className={styles.portrait}>
          <div className={styles.frame}>
            <img
              src={asset(about.portrait)}
              alt={about.portraitAlt}
              width={640}
              height={426}
              loading="lazy"
            />
          </div>
          <figcaption className={styles.caption}>{about.caption}</figcaption>
        </figure>

        <div className={styles.feature}>
          <div className={styles.featureImage}>
            <img
              src={asset(about.featureImage)}
              alt={about.featureImageAlt}
              width={640}
              height={640}
              loading="lazy"
            />
          </div>
          <div className={styles.featureCopy}>
            <h3 className={`display ${styles.featureHeading}`}>
              {about.featureHeadingLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h3>
            <p className={`lead ${styles.featureBody}`}>{about.featureBody}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
