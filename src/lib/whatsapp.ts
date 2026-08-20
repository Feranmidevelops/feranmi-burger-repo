import type { ResolvedLine } from '../cart/CartContext'
import { site, type DeliveryZone } from '../data/site'
import { formatNairaPlain } from './money'

export interface OrderDetails {
  reference: string
  name: string
  phone: string
  fulfilment: 'delivery' | 'pickup'
  zone?: DeliveryZone
  address?: string
  notes?: string
  lines: ResolvedLine[]
  subtotal: number
  deliveryFee: number
  total: number
}

export interface ReservationDetails {
  reference: string
  name: string
  phone: string
  date: string
  time: string
  partySize: number
  occasion?: string
  notes?: string
}

/**
 * Builds the message the customer sends. Kept plain-text and line-broken so it
 * is readable in the WhatsApp chat itself, which is where the kitchen reads it.
 */
export function orderMessage(order: OrderDetails): string {
  const lines: string[] = [
    `New order — ${order.reference}`,
    '',
    ...order.lines.map((line) => {
      const base = `${line.quantity}x ${line.item.name} — ${formatNairaPlain(line.lineTotal)}`
      return line.note ? `${base}\n    note: ${line.note}` : base
    }),
    '',
    `Subtotal: ${formatNairaPlain(order.subtotal)}`,
  ]

  if (order.fulfilment === 'delivery') {
    lines.push(`Delivery (${order.zone?.name ?? '—'}): ${formatNairaPlain(order.deliveryFee)}`)
  } else {
    lines.push('Pickup — no delivery fee')
  }

  lines.push(
    `Total: ${formatNairaPlain(order.total)}`,
    '',
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
  )

  if (order.fulfilment === 'delivery') {
    lines.push(`Address: ${order.address ?? ''}`, `Area: ${order.zone?.name ?? ''}`)
  } else {
    lines.push(`Pickup at: ${site.address.street}, ${site.address.area}`)
  }

  if (order.notes) lines.push('', `Notes: ${order.notes}`)

  return lines.join('\n')
}

export function reservationMessage(booking: ReservationDetails): string {
  const lines = [
    `Table request — ${booking.reference}`,
    '',
    `Date: ${booking.date}`,
    `Time: ${booking.time}`,
    `Party: ${booking.partySize} ${booking.partySize === 1 ? 'guest' : 'guests'}`,
    '',
    `Name: ${booking.name}`,
    `Phone: ${booking.phone}`,
  ]
  if (booking.occasion) lines.push(`Occasion: ${booking.occasion}`)
  if (booking.notes) lines.push('', `Notes: ${booking.notes}`)
  return lines.join('\n')
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`
}
