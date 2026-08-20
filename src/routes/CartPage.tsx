import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { formatNaira } from '../lib/money'
import { asset } from '../lib/asset'
import { DELIVERY_MINIMUM } from '../data/site'
import { EmptyState, PageHeader, QuantityStepper, Summary } from '../components/ui'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './CartPage.module.css'

export function CartPage() {
  useDocumentTitle('Your order')
  const { lines, count, subtotal, setQuantity, setNote, remove, clear } = useCart()

  const belowMinimum = subtotal > 0 && subtotal < DELIVERY_MINIMUM

  return (
    <>
      <PageHeader eyebrow="Step 1 of 2" title="Your order" />

      <section className={styles.cart}>
        <div className="container">
          {count === 0 ? (
            <EmptyState
              title="Nothing here yet"
              body="Your cart is empty. The Suya Smash is a good place to start."
              action={
                <Link className={styles.primary} to="/menu">
                  Browse the menu
                </Link>
              }
            />
          ) : (
            <div className={styles.layout}>
              <div>
                <ul className={styles.lines}>
                  {lines.map((line) => (
                    <li key={line.id} className={styles.line}>
                      <img
                        className={styles.thumb}
                        src={asset(line.item.image)}
                        alt=""
                        width={96}
                        height={96}
                        loading="lazy"
                      />

                      <div className={styles.lineBody}>
                        <div className={styles.lineHead}>
                          <h2 className={styles.lineName}>{line.item.name}</h2>
                          <p className={styles.lineTotal}>{formatNaira(line.lineTotal)}</p>
                        </div>

                        <p className={styles.unit}>{formatNaira(line.item.price)} each</p>

                        <div className={styles.lineControls}>
                          <QuantityStepper
                            value={line.quantity}
                            label={line.item.name}
                            min={1}
                            onChange={(next) => setQuantity(line.id, next)}
                          />
                          <button
                            type="button"
                            className={styles.remove}
                            onClick={() => remove(line.id)}
                          >
                            Remove
                            <span className="visuallyHidden"> {line.item.name}</span>
                          </button>
                        </div>

                        <label className={styles.note}>
                          <span>Note for the kitchen</span>
                          <input
                            type="text"
                            maxLength={140}
                            placeholder="e.g. no pickles, extra yaji"
                            value={line.note ?? ''}
                            onChange={(event) => setNote(line.id, event.target.value)}
                          />
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>

                <button type="button" className={styles.clear} onClick={clear}>
                  Empty cart
                </button>
              </div>

              <aside className={styles.aside}>
                <h2 className={styles.asideTitle}>Summary</h2>
                <Summary
                  rows={[[`Items (${count})`, formatNaira(subtotal)]]}
                  total={['Subtotal', formatNaira(subtotal)]}
                />
                <p className={styles.asideNote}>
                  Delivery is calculated at checkout, based on your area.
                </p>

                {belowMinimum && (
                  <p className={styles.warning} role="status">
                    Delivery orders start at {formatNaira(DELIVERY_MINIMUM)}. You can still choose
                    pickup at any total.
                  </p>
                )}

                <Link className={styles.primary} to="/checkout">
                  Continue to checkout
                </Link>
                <Link className={styles.secondary} to="/menu">
                  Add something else
                </Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
