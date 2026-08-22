import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Plus } from '@phosphor-icons/react'
import { useCart } from '../cart/CartContext'
import { categories } from '../data/menu'
import { menuItemPath } from '../lib/seo'
import { formatNaira } from '../lib/money'
import { asset } from '../lib/asset'
import { suggestFor } from '../lib/upsell'
import { ICON } from './Icons'
import styles from './Upsell.module.css'

const categoryLabel = (id: string) =>
  categories.find((category) => category.id === id)?.label ?? id

/**
 * "Anything with that?" — offered on the way to checkout.
 *
 * Only ever complements, never a second main: the rules live in
 * [`upsell.ts`](../lib/upsell.ts). Renders nothing when the cart already has a
 * side and a drink, so a complete order is not nagged.
 */
export function Upsell() {
  const { lines, add } = useCart()
  const [added, setAdded] = useState<string | null>(null)

  const groups = suggestFor(lines.map((line) => line.id))
  if (groups.length === 0) return null

  return (
    <section className={styles.wrap} aria-labelledby="upsell-title">
      <h2 id="upsell-title" className={styles.title}>
        Anything with that?
      </h2>
      <p className={styles.sub}>
        {groups.map((group) => categoryLabel(group.category).toLowerCase()).join(' and ')} to
        finish the order.
      </p>

      <ul className={styles.list}>
        {groups.flatMap((group) =>
          group.items.map((item) => (
            <li key={item.id} className={styles.item}>
              <Link className={styles.link} to={menuItemPath(item)}>
                <img
                  className={styles.thumb}
                  src={asset(item.image)}
                  alt=""
                  width={72}
                  height={72}
                  loading="lazy"
                />
                <span className={styles.itemBody}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.price}>{formatNaira(item.price)}</span>
                </span>
              </Link>

              <button
                type="button"
                className={styles.add}
                data-added={added === item.id}
                onClick={() => {
                  add(item.id)
                  setAdded(item.id)
                  window.setTimeout(() => setAdded(null), 1600)
                }}
              >
                {added === item.id ? (
                  <Check weight={ICON.strong} aria-hidden />
                ) : (
                  <Plus weight={ICON.strong} aria-hidden />
                )}
                <span className="visuallyHidden">
                  {added === item.id ? `${item.name} added` : `Add ${item.name}`}
                </span>
              </button>
            </li>
          )),
        )}
      </ul>
    </section>
  )
}
