import { useState } from 'react'
import { reviewsSection, type Review } from '../data/content'
import { useMediaQuery } from '../hooks/useMediaQuery'
import styles from './Reviews.module.css'

const MOBILE_PREVIEW_COUNT = 3

function Card({ review }: { review: Review }) {
  return (
    <figure className={styles.card}>
      <img
        className={styles.avatar}
        src={review.avatar}
        alt=""
        width={48}
        height={48}
        loading="lazy"
      />
      <div className={styles.text}>
        <figcaption className={styles.author}>{review.author}</figcaption>
        <blockquote className={styles.quote}>
          {review.body.split('\n\n').map((para) => (
            <p key={para}>{para}</p>
          ))}
        </blockquote>
      </div>
    </figure>
  )
}

export function Reviews() {
  const [expanded, setExpanded] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 900px)')

  /** Desktop keeps the three masonry columns of the frame; mobile is one stack. */
  const flat = reviewsSection.columns.flat()
  const visible = expanded ? flat : flat.slice(0, MOBILE_PREVIEW_COUNT)

  return (
    <section id="reviews" className={styles.reviews}>
      <div className={`container ${styles.inner}`}>
        <header className={styles.intro}>
          <h2 className="sectionTitle">{reviewsSection.heading}</h2>
          <p className={`lead ${styles.introBody}`}>{reviewsSection.body}</p>
        </header>

        {isDesktop ? (
          <div className={styles.columns}>
            {reviewsSection.columns.map((column, index) => (
              <div key={index} className={styles.column}>
                {column.map((review) => (
                  <Card key={review.id} review={review} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className={styles.stack}>
              {visible.map((review) => (
                <Card key={review.id} review={review} />
              ))}
            </div>
            {!expanded && (
              <button
                type="button"
                className={styles.loadMore}
                onClick={() => setExpanded(true)}
              >
                {reviewsSection.loadMore}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  )
}
