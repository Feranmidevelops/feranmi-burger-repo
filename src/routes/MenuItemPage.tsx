import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Clock, Fire, Fish, Leaf, Plus, Warning } from '@phosphor-icons/react'
import { badgeLabels, dietaryLabels, menuById, type DietaryTag } from '../data/menu'
import { useCart } from '../cart/CartContext'
import { formatNaira } from '../lib/money'
import { asset } from '../lib/asset'
import { pairingsFor } from '../lib/upsell'
import { Burst, ICON } from '../components/Icons'
import { MenuCard } from '../components/MenuCard'
import { QuantityStepper } from '../components/ui'
import { NotFound } from './NotFound'
import styles from './MenuItemPage.module.css'

const dietaryIcons: Record<DietaryTag, typeof Leaf> = {
  vegetarian: Leaf,
  spicy: Fire,
  'contains-nuts': Warning,
  seafood: Fish,
}

/**
 * One dish, at its own URL.
 *
 * Two reasons this page exists. The long-form copy in `item.detail` was written
 * and then never shown anywhere — the cards only have room for a single line.
 * And a dish needs a link of its own: "the Double Trouble" pasted into a chat
 * or an Instagram bio should open the dish, with its own photo in the preview.
 */
export function MenuItemPage() {
  const { itemId } = useParams()
  const item = itemId ? menuById.get(itemId) : undefined

  const { add } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  // An unknown id is a 404, not an empty page — and the head tags agree,
  // because metaForPath falls through to the not-found entry.
  if (!item) return <NotFound />

  const pairings = pairingsFor(item)

  return (
    <>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <div className="container">
          <ol>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/menu">Menu</Link>
            </li>
            <li aria-current="page">{item.name}</li>
          </ol>
        </div>
      </nav>

      <article className={styles.dish}>
        <div className={`container ${styles.layout}`}>
          <div className={styles.media}>
            <img
              src={asset(item.image)}
              alt={item.alt}
              width={640}
              height={640}
              /* The subject of the page — never deferred. */
              loading="eager"
              decoding="async"
            />
            {item.badge && (
              <span className={styles.flag} data-badge={item.badge}>
                <Burst className={styles.flagBurst} points={10} />
                <span className={styles.flagText}>{badgeLabels[item.badge]}</span>
              </span>
            )}
          </div>

          <div className={styles.body}>
            <h1 className={`display ${styles.name}`}>{item.name}</h1>
            <p className={styles.price}>{formatNaira(item.price)}</p>
            <p className={styles.lead}>{item.description}</p>
            <p className={styles.detail}>{item.detail}</p>

            <ul className={styles.facts}>
              <li>
                <Clock weight={ICON.strong} aria-hidden />
                Ready in about {item.prepMinutes} min
              </li>
              {item.dietary?.map((tag) => {
                const Glyph = dietaryIcons[tag]
                return (
                  <li key={tag}>
                    <Glyph weight={ICON.strong} aria-hidden />
                    {dietaryLabels[tag]}
                  </li>
                )
              })}
            </ul>

            <div className={styles.actions}>
              <QuantityStepper
                value={quantity}
                min={1}
                label={item.name}
                onChange={setQuantity}
              />
              <button
                type="button"
                className={styles.add}
                data-added={added}
                onClick={() => {
                  add(item.id, quantity)
                  setAdded(true)
                  window.setTimeout(() => setAdded(false), 1800)
                }}
              >
                {added ? (
                  <>
                    <Check weight={ICON.strong} aria-hidden />
                    Added
                  </>
                ) : (
                  <>
                    <Plus weight={ICON.strong} aria-hidden />
                    Add {quantity > 1 ? `${quantity} ` : ''}to cart
                  </>
                )}
              </button>
            </div>

            <p className={styles.aside}>
              Pay on delivery or at the counter — nothing is charged here.
            </p>

            <Link className={styles.back} to="/menu">
              <ArrowLeft weight={ICON.strong} aria-hidden />
              Back to the full menu
            </Link>
          </div>
        </div>
      </article>

      {pairings.length > 0 && (
        <section className={styles.pairings} aria-labelledby="pairings-title">
          <div className="container">
            <h2 id="pairings-title" className={`display ${styles.pairingsTitle}`}>
              Goes well with
            </h2>
            <ul className={styles.pairingGrid}>
              {pairings.map((pairing) => (
                <li key={pairing.id}>
                  <MenuCard item={pairing} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
