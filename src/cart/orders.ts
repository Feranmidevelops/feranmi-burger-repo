/**
 * A local record of orders this device has placed.
 *
 * The business has no database — orders arrive as WhatsApp messages — so this
 * is not the restaurant's order book, and it is not a receipt. It exists for
 * one reason: repeat custom. Somebody who ordered the same thing last Friday
 * should be two taps from ordering it again, and on this stack the only place
 * that history can live is the customer's own browser.
 *
 * Treated with the same suspicion as the stored cart: the menu changes under
 * saved data, so everything is re-validated on read.
 */

import { menuById } from '../data/menu'
import type { OrderDetails } from '../lib/whatsapp'

const STORAGE_KEY = 'feranmi.orders.v1'

/** Enough to recognise a habit; not so many the cart page turns into an archive. */
export const MAX_ORDERS = 8

export interface StoredOrderLine {
  id: string
  quantity: number
  note?: string
}

export interface StoredOrder {
  reference: string
  /** ISO timestamp of when the order was sent. */
  placedAt: string
  fulfilment: 'delivery' | 'pickup'
  /** Total at the time of ordering, in kobo. Prices move; this is what was paid. */
  total: number
  lines: StoredOrderLine[]
}

const clampQuantity = (value: number) => Math.max(1, Math.min(20, Math.trunc(value)))

/**
 * Parses stored history, dropping anything that no longer holds up.
 *
 * Exported so the rules can be tested without a browser: an order whose dishes
 * have all left the menu is not re-orderable and is simply gone.
 */
export function parseOrders(raw: string | null): StoredOrder[] {
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.flatMap((entry): StoredOrder[] => {
      if (typeof entry !== 'object' || entry === null) return []
      const { reference, placedAt, fulfilment, total, lines } = entry as Record<string, unknown>

      if (typeof reference !== 'string' || reference === '') return []
      if (typeof placedAt !== 'string' || Number.isNaN(Date.parse(placedAt))) return []
      if (fulfilment !== 'delivery' && fulfilment !== 'pickup') return []
      if (typeof total !== 'number' || !Number.isFinite(total) || total < 0) return []
      if (!Array.isArray(lines)) return []

      const valid = lines.flatMap((line): StoredOrderLine[] => {
        if (typeof line !== 'object' || line === null) return []
        const { id, quantity, note } = line as Record<string, unknown>
        if (typeof id !== 'string' || !menuById.has(id)) return []
        if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity < 1) return []
        const kept = { id, quantity: clampQuantity(quantity) }
        return [typeof note === 'string' && note !== '' ? { ...kept, note } : kept]
      })

      // Every dish has left the menu — there is nothing left to re-order.
      if (valid.length === 0) return []

      return [{ reference, placedAt, fulfilment, total, lines: valid }]
    })
  } catch {
    return []
  }
}

/** Newest first. Safe to call during a render — never throws. */
export function readOrders(): StoredOrder[] {
  try {
    return parseOrders(localStorage.getItem(STORAGE_KEY)).sort(
      (a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt),
    )
  } catch {
    // Private mode, or storage disabled. History is a nicety, not a feature to
    // break the page over.
    return []
  }
}

/** Turns a placed order into a history entry. Pure — the clock is a parameter. */
export function toStoredOrder(order: OrderDetails, placedAt: Date): StoredOrder {
  return {
    reference: order.reference,
    placedAt: placedAt.toISOString(),
    fulfilment: order.fulfilment,
    total: order.total,
    lines: order.lines.map((line) => ({
      id: line.id,
      quantity: line.quantity,
      ...(line.note ? { note: line.note } : {}),
    })),
  }
}

/**
 * Records an order, newest first, keeping at most {@link MAX_ORDERS}.
 * A re-send of the same reference replaces the earlier entry rather than
 * stacking a duplicate.
 */
export function recordOrder(order: OrderDetails, placedAt: Date): StoredOrder[] {
  const entry = toStoredOrder(order, placedAt)
  const next = [entry, ...readOrders().filter((prior) => prior.reference !== entry.reference)].slice(
    0,
    MAX_ORDERS,
  )

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Quota or private mode. The order still went to WhatsApp, which is the
    // part that matters; only the convenience of re-ordering is lost.
  }

  return next
}

export function clearOrders(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* nothing to do */
  }
}

/** "3 items" / "1 item" — the line count, not the number of distinct dishes. */
export function orderItemCount(order: StoredOrder): number {
  return order.lines.reduce((sum, line) => sum + line.quantity, 0)
}

/** "Suya Smash, Chapman and 2 more" — a glanceable summary of an old order. */
export function summariseOrder(order: StoredOrder, shown = 2): string {
  const names = order.lines.flatMap((line) => {
    const item = menuById.get(line.id)
    return item ? [item.name] : []
  })

  if (names.length === 0) return ''
  if (names.length === 1) return names[0] as string
  if (names.length <= shown) {
    return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  }

  const rest = names.length - shown
  return `${names.slice(0, shown).join(', ')} and ${rest} more`
}
