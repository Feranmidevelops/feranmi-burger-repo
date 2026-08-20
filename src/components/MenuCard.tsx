import { useEffect, useState } from 'react'
import { badgeLabels, dietaryLabels, type MenuItem } from '../data/menu'
import { useCart } from '../cart/CartContext'
import { formatNaira } from '../lib/money'
import { asset } from '../lib/asset'
import { Burst, Check } from './Icons'
import styles from './MenuCard.module.css'

export function MenuCard({ item }: { item: MenuItem }) {
  const { add } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  // Reset the confirmation state so the button doesn't stay stuck on "Added".
  useEffect(() => {
    if (!justAdded) return
    const timer = window.setTimeout(() => setJustAdded(false), 1800)
    return () => window.clearTimeout(timer)
  }, [justAdded])

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img src={asset(item.image)} alt={item.alt} width={323} height={323} loading="lazy" />
      </div>

      {item.badge && (
        <span className={styles.flag} data-badge={item.badge}>
          <Burst className={styles.flagBurst} points={10} />
          <span className={styles.flagText}>{badgeLabels[item.badge]}</span>
        </span>
      )}

      <div className={styles.body}>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.description}>{item.description}</p>

        {item.dietary && item.dietary.length > 0 && (
          <ul className={styles.tags}>
            {item.dietary.map((tag) => (
              <li key={tag}>{dietaryLabels[tag]}</li>
            ))}
          </ul>
        )}

        <p className={styles.meta}>Ready in about {item.prepMinutes} min</p>

        <div className={styles.foot}>
          <span className={styles.price}>{formatNaira(item.price)}</span>
          <button
            type="button"
            className={styles.add}
            data-added={justAdded}
            onClick={() => {
              add(item.id)
              setJustAdded(true)
            }}
          >
            {justAdded ? (
              <>
                <Check className={styles.addIcon} />
                Added
              </>
            ) : (
              'Add to cart'
            )}
            <span className="visuallyHidden"> — {item.name}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
