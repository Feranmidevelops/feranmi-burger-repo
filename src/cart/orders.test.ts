import { beforeEach, describe, expect, it } from 'vitest'
import {
  MAX_ORDERS,
  clearOrders,
  orderItemCount,
  parseOrders,
  readOrders,
  recordOrder,
  summariseOrder,
  toStoredOrder,
  type StoredOrder,
} from './orders'
import { menu } from '../data/menu'
import type { OrderDetails } from '../lib/whatsapp'
import type { ResolvedLine } from './CartContext'

const [first, second, third] = menu
if (!first || !second || !third) throw new Error('These tests need three menu items')

const line = (item: typeof first, quantity: number, note?: string): ResolvedLine => ({
  id: item.id,
  quantity,
  item,
  lineTotal: item.price * quantity,
  ...(note === undefined ? {} : { note }),
})

const order = (overrides: Partial<OrderDetails> = {}): OrderDetails => ({
  reference: 'FR-AAAAAA',
  name: 'Ada Obi',
  phone: '2348012345678',
  fulfilment: 'delivery',
  lines: [line(first, 2), line(second, 1, 'no ice')],
  subtotal: first.price * 2 + second.price,
  deliveryFee: 100_000,
  total: first.price * 2 + second.price + 100_000,
  ...overrides,
})

const at = (iso: string) => new Date(iso)

beforeEach(() => clearOrders())

describe('toStoredOrder', () => {
  it('keeps only what a re-order needs', () => {
    const stored = toStoredOrder(order(), at('2026-08-20T18:00:00Z'))
    expect(stored).toEqual({
      reference: 'FR-AAAAAA',
      placedAt: '2026-08-20T18:00:00.000Z',
      fulfilment: 'delivery',
      total: order().total,
      lines: [
        { id: first.id, quantity: 2 },
        { id: second.id, quantity: 1, note: 'no ice' },
      ],
    })
  })

  it('drops the customer’s name, phone and address', () => {
    const stored = JSON.stringify(toStoredOrder(order({ address: '5 Ozumba' }), new Date()))
    expect(stored).not.toContain('Ada Obi')
    expect(stored).not.toContain('2348012345678')
    expect(stored).not.toContain('Ozumba')
  })
})

describe('recordOrder', () => {
  it('stores an order and reads it back', () => {
    recordOrder(order(), at('2026-08-20T18:00:00Z'))
    const [stored] = readOrders()
    expect(stored?.reference).toBe('FR-AAAAAA')
    expect(stored?.lines).toHaveLength(2)
  })

  it('returns the newest first', () => {
    recordOrder(order({ reference: 'FR-OLD' }), at('2026-08-18T18:00:00Z'))
    recordOrder(order({ reference: 'FR-NEW' }), at('2026-08-20T18:00:00Z'))
    expect(readOrders().map((entry) => entry.reference)).toEqual(['FR-NEW', 'FR-OLD'])
  })

  it('replaces rather than duplicates when the same reference is recorded twice', () => {
    recordOrder(order(), at('2026-08-20T18:00:00Z'))
    recordOrder(order(), at('2026-08-20T18:05:00Z'))
    const all = readOrders()
    expect(all).toHaveLength(1)
    expect(all[0]?.placedAt).toBe('2026-08-20T18:05:00.000Z')
  })

  it('keeps the history bounded', () => {
    for (let index = 0; index < MAX_ORDERS + 5; index += 1) {
      recordOrder(
        order({ reference: `FR-${index}` }),
        at(`2026-08-${String(index + 1).padStart(2, '0')}T18:00:00Z`),
      )
    }
    expect(readOrders()).toHaveLength(MAX_ORDERS)
  })

  it('drops the oldest when the cap is reached', () => {
    for (let index = 0; index < MAX_ORDERS + 1; index += 1) {
      recordOrder(
        order({ reference: `FR-${index}` }),
        at(`2026-08-${String(index + 1).padStart(2, '0')}T18:00:00Z`),
      )
    }
    expect(readOrders().map((entry) => entry.reference)).not.toContain('FR-0')
  })
})

describe('parseOrders', () => {
  const valid: StoredOrder = {
    reference: 'FR-AAAAAA',
    placedAt: '2026-08-20T18:00:00.000Z',
    fulfilment: 'delivery',
    total: 500_000,
    lines: [{ id: first.id, quantity: 2 }],
  }

  it('accepts a well-formed record', () => {
    expect(parseOrders(JSON.stringify([valid]))).toEqual([valid])
  })

  it('survives anything that is not an order list', () => {
    expect(parseOrders(null)).toEqual([])
    expect(parseOrders('')).toEqual([])
    expect(parseOrders('not json')).toEqual([])
    expect(parseOrders('{"nope":true}')).toEqual([])
    expect(parseOrders('[null, 4, "x"]')).toEqual([])
  })

  /*
   * The menu is edited over time and this data outlives it. A dish that has
   * been taken off cannot be re-ordered, so it must not survive the read.
   */
  it('drops lines whose dish has left the menu', () => {
    const stale = { ...valid, lines: [{ id: 'discontinued', quantity: 1 }, ...valid.lines] }
    expect(parseOrders(JSON.stringify([stale]))[0]?.lines).toEqual(valid.lines)
  })

  it('drops an order entirely once none of its dishes exist', () => {
    const gone = { ...valid, lines: [{ id: 'discontinued', quantity: 1 }] }
    expect(parseOrders(JSON.stringify([gone]))).toEqual([])
  })

  it('rejects records missing a field it would have to render', () => {
    const missing = [
      { ...valid, reference: '' },
      { ...valid, placedAt: 'whenever' },
      { ...valid, fulfilment: 'teleport' },
      { ...valid, total: -1 },
      { ...valid, total: 'free' },
      { ...valid, lines: 'everything' },
    ]
    for (const entry of missing) {
      expect(parseOrders(JSON.stringify([entry]))).toEqual([])
    }
  })

  it('clamps an absurd quantity rather than trusting it', () => {
    const silly = { ...valid, lines: [{ id: first.id, quantity: 9999 }] }
    expect(parseOrders(JSON.stringify([silly]))[0]?.lines[0]?.quantity).toBe(20)
  })
})

describe('summariseOrder / orderItemCount', () => {
  const build = (lines: StoredOrder['lines']): StoredOrder => ({
    reference: 'FR-X',
    placedAt: '2026-08-20T18:00:00.000Z',
    fulfilment: 'pickup',
    total: 0,
    lines,
  })

  it('counts items, not lines', () => {
    expect(orderItemCount(build([{ id: first.id, quantity: 2 }, { id: second.id, quantity: 3 }]))).toBe(5)
  })

  it('names a single dish', () => {
    expect(summariseOrder(build([{ id: first.id, quantity: 1 }]))).toBe(first.name)
  })

  it('joins two dishes with "and"', () => {
    expect(summariseOrder(build([{ id: first.id, quantity: 1 }, { id: second.id, quantity: 1 }]))).toBe(
      `${first.name} and ${second.name}`,
    )
  })

  it('summarises a longer order instead of listing all of it', () => {
    const many = build([
      { id: first.id, quantity: 1 },
      { id: second.id, quantity: 1 },
      { id: third.id, quantity: 1 },
    ])
    expect(summariseOrder(many)).toBe(`${first.name}, ${second.name} and 1 more`)
  })
})
