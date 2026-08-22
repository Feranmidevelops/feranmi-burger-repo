import { describe, expect, it } from 'vitest'
import { orderMessage, reservationMessage, whatsappLink, type OrderDetails } from './whatsapp'
import { deliveryZones, site } from '../data/site'
import { menu } from '../data/menu'
import type { ResolvedLine } from '../cart/CartContext'

/**
 * This message *is* the order. There is no database and no order API — whatever
 * ends up in the WhatsApp chat is the only record the kitchen ever sees, so
 * anything missing here is an order that cannot be cooked or delivered.
 */

const [burger, drink] = menu
if (!burger || !drink) throw new Error('The menu needs at least two items for these tests')

const line = (item: typeof burger, quantity: number, note?: string): ResolvedLine => ({
  id: item.id,
  quantity,
  item,
  lineTotal: item.price * quantity,
  ...(note === undefined ? {} : { note }),
})

const zone = deliveryZones[0]
if (!zone) throw new Error('At least one delivery zone is required')

const lines = [line(burger, 2), line(drink, 1, 'no ice')]
const subtotal = lines.reduce((sum, entry) => sum + entry.lineTotal, 0)

const delivery: OrderDetails = {
  reference: 'FR-7K2Q9M',
  name: 'Ada Obi',
  phone: '2348012345678',
  fulfilment: 'delivery',
  zone,
  address: '5 Ozumba Mbadiwe Avenue, Flat 3',
  lines,
  subtotal,
  deliveryFee: zone.fee,
  total: subtotal + zone.fee,
}

describe('orderMessage — delivery', () => {
  const message = orderMessage(delivery)

  it('leads with the reference, so the kitchen can quote it back', () => {
    expect(message.split('\n')[0]).toBe('New order — FR-7K2Q9M')
  })

  it('lists every line with its quantity and total', () => {
    expect(message).toContain(`2x ${burger.name}`)
    expect(message).toContain(`1x ${drink.name}`)
  })

  it('carries the kitchen note attached to a line', () => {
    expect(message).toContain('note: no ice')
  })

  it('shows the subtotal, the delivery fee and the total', () => {
    expect(message).toContain('Subtotal:')
    expect(message).toContain(`Delivery (${zone.name}):`)
    expect(message).toContain('Total:')
  })

  it('carries the address and area, without which nothing can be delivered', () => {
    expect(message).toContain(delivery.address as string)
    expect(message).toContain(`Area: ${zone.name}`)
  })

  it('carries a callback number', () => {
    expect(message).toContain('Phone: 2348012345678')
  })

  it('uses the plain currency code, never the naira sign', () => {
    expect(message).toContain('NGN')
    expect(message).not.toContain('₦')
  })
})

describe('orderMessage — pickup', () => {
  const message = orderMessage({
    ...delivery,
    fulfilment: 'pickup',
    deliveryFee: 0,
    total: subtotal,
  })

  it('says there is no delivery fee', () => {
    expect(message).toContain('Pickup — no delivery fee')
  })

  it('gives the collection address rather than asking for one', () => {
    expect(message).toContain(site.address.street)
    expect(message).not.toContain('Area:')
  })
})

describe('reservationMessage', () => {
  const message = reservationMessage({
    reference: 'FR-BK4T2X',
    name: 'Ada Obi',
    phone: '2348012345678',
    date: '2026-09-04',
    time: '19:30',
    partySize: 4,
    occasion: 'Birthday',
  })

  it('carries date, time and party size', () => {
    expect(message).toContain('Date: 2026-09-04')
    expect(message).toContain('Time: 19:30')
    expect(message).toContain('Party: 4 guests')
  })

  it('says "guest" for a table of one', () => {
    const solo = reservationMessage({
      reference: 'FR-1',
      name: 'A',
      phone: '2348012345678',
      date: '2026-09-04',
      time: '19:30',
      partySize: 1,
    })
    expect(solo).toContain('Party: 1 guest')
    expect(solo).not.toContain('1 guests')
  })

  it('leaves out an occasion that was not given', () => {
    const plain = reservationMessage({
      reference: 'FR-1',
      name: 'A',
      phone: '2348012345678',
      date: '2026-09-04',
      time: '19:30',
      partySize: 2,
    })
    expect(plain).not.toContain('Occasion:')
  })
})

describe('whatsappLink', () => {
  it('points at the business number', () => {
    expect(whatsappLink('hi')).toBe(`https://wa.me/${site.whatsapp}?text=hi`)
  })

  it('encodes newlines and reserved characters so the message survives the URL', () => {
    const link = whatsappLink(orderMessage(delivery))
    expect(link).not.toMatch(/\n/)
    expect(link).toContain('%0A')
    // Decoding the query has to give back the message byte for byte.
    const text = new URL(link).searchParams.get('text')
    expect(text).toBe(orderMessage(delivery))
  })

  it('survives an ampersand in a customer note, which would otherwise truncate it', () => {
    const link = whatsappLink('fish & chips')
    expect(new URL(link).searchParams.get('text')).toBe('fish & chips')
  })
})
