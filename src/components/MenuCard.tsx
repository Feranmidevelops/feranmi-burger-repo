import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { badgeLabels, dietaryLabels, type MenuItem } from '../data/menu'
import { useCart } from '../cart/CartContext'
import { formatNaira } from '../lib/money'
import { asset } from '../lib/asset'
import { menuItemPath } from '../lib/seo'
import { Check, Clock, Fire, Fish, Leaf, Plus, Warning } from '@phosphor-icons/react'
import { Burst, ICON } from './Icons'
import type { DietaryTag } from '../data/menu'
import styles from './MenuCard.module.css'

const dietaryIcons: Record<DietaryTag, typeof Leaf> = {
  vegetarian: Leaf,
  spicy: Fire,
  'contains-nuts': Warning,
  seafood: Fish,
}

/**
 * `priority` marks a card that is visible on arrival. Those images load eagerly:
 * lazy-loading anything in the first viewport delays the largest paint, and it
 * leaves the page looking broken if the lazy heuristic is starved for any reason.
 */
export function MenuCard({ item, priority = false }: { item: MenuItem; priority?: boolean }) {
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
        <img
          src={asset(item.image)}
          alt={item.alt}
          width={323}
          height={323}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>

      {item.badge && (
        <span className={styles.flag} data-badge={item.badge}>
          <Burst className={styles.flagBurst} points={10} />
          <span className={styles.flagText}>{badgeLabels[item.badge]}</span>
        </span>
      )}

      <div className={styles.body}>
        <h3 className={styles.name}>
          {/*
            The whole card is not a link: it holds an "add to cart" button, and
            nesting an interactive control inside an anchor is invalid and
            unusable with a keyboard. The name is the link instead.
          */}
          <Link className={styles.nameLink} to={menuItemPath(item)}>
            {item.name}
          </Link>
        </h3>
        <p className={styles.description}>{item.description}</p>

        {item.dietary && item.dietary.length > 0 && (
          <ul className={styles.tags}>
            {item.dietary.map((tag) => {
              const Glyph = dietaryIcons[tag]
              return (
                <li key={tag}>
                  <Glyph weight={ICON.strong} aria-hidden />
                  {dietaryLabels[tag]}
                </li>
              )
            })}
          </ul>
        )}

        <p className={styles.meta}>
          <Clock weight={ICON.strong} aria-hidden />
          Ready in about {item.prepMinutes} min
        </p>

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
                <Check className={styles.addIcon} weight={ICON.strong} />
                Added
              </>
            ) : (
              <>
                <Plus className={styles.addIcon} weight={ICON.strong} />
                Add to cart
              </>
            )}
            <span className="visuallyHidden"> — {item.name}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
