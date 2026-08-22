import { useCallback, useState } from 'react'
import { ArrowCounterClockwise, ClockCounterClockwise } from '@phosphor-icons/react'
import { useCart } from '../cart/CartContext'
import {
  clearOrders,
  orderItemCount,
  readOrders,
  summariseOrder,
  type StoredOrder,
} from '../cart/orders'
import { formatNaira } from '../lib/money'
import { ICON } from './Icons'
import styles from './RecentOrders.module.css'

const dateFormat = new Intl.DateTimeFormat('en-NG', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/**
 * Past orders from this device, with one-tap re-ordering.
 *
 * Repeat custom is the whole economy of a restaurant, and re-ordering is the
 * cheapest thing a menu can offer someone who already knows what they want.
 *
 * Read once into state rather than on every render: `localStorage` is
 * synchronous, and this sits on the cart page which re-renders on every
 * quantity tap.
 */
export function RecentOrders({ heading = 'Order it again' }: { heading?: string }) {
  const { add, setNote } = useCart()
  const [orders, setOrders] = useState<StoredOrder[]>(readOrders)
  const [justAdded, setJustAdded] = useState<string | null>(null)

  const reorder = useCallback(
    (order: StoredOrder) => {
      for (const line of order.lines) {
        add(line.id, line.quantity)
        // `add` merges into any existing line, so the note is applied after.
        if (line.note) setNote(line.id, line.note)
      }
      setJustAdded(order.reference)
      window.setTimeout(() => setJustAdded(null), 2200)
    },
    [add, setNote],
  )

  if (orders.length === 0) return null

  return (
    <section className={styles.wrap} aria-labelledby="recent-orders-title">
      <div className={styles.head}>
        <h2 id="recent-orders-title" className={styles.title}>
          <ClockCounterClockwise weight={ICON.strong} aria-hidden />
          {heading}
        </h2>
        <button
          type="button"
          className={styles.forget}
          onClick={() => {
            clearOrders()
            setOrders([])
          }}
        >
          Forget history
        </button>
      </div>

      <ul className={styles.list}>
        {orders.map((order) => {
          const count = orderItemCount(order)
          return (
            <li key={order.reference} className={styles.order}>
              <div className={styles.orderBody}>
                <p className={styles.summary}>{summariseOrder(order)}</p>
                <p className={styles.meta}>
                  <time dateTime={order.placedAt}>
                    {dateFormat.format(new Date(order.placedAt))}
                  </time>
                  {' · '}
                  {count} {count === 1 ? 'item' : 'items'}
                  {' · '}
                  {formatNaira(order.total)}
                  {' · '}
                  {order.fulfilment === 'delivery' ? 'Delivered' : 'Collected'}
                </p>
              </div>

              <button
                type="button"
                className={styles.again}
                data-added={justAdded === order.reference}
                onClick={() => reorder(order)}
              >
                <ArrowCounterClockwise weight={ICON.strong} aria-hidden />
                {justAdded === order.reference ? 'Added to cart' : 'Order again'}
                <span className="visuallyHidden"> — {summariseOrder(order)}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <p className={styles.note}>
        Kept on this device only — we have no account system, and nothing here is sent anywhere.
      </p>
    </section>
  )
}
