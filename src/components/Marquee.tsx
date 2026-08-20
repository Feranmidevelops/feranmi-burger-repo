import { marqueeText } from '../data/content'
import { Sparkle } from './Icons'
import styles from './Marquee.module.css'

const REPEATS = 8

function Track({ reverse }: { reverse?: boolean }) {
  return (
    <div className={styles.band} data-reverse={reverse ? 'true' : 'false'}>
      <div className={styles.track}>
        {Array.from({ length: REPEATS }, (_, i) => (
          <span key={i} className={styles.item}>
            {marqueeText}
            <Sparkle className={styles.sparkle} />
          </span>
        ))}
      </div>
    </div>
  )
}

/** Figma: two yellow strips crossing at -2.66deg and +2.71deg. */
export function Marquee() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <Track />
      <Track reverse />
    </div>
  )
}
