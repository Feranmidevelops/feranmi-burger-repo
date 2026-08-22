import { describe, expect, it } from 'vitest'
import { cartReducer, type CartLine } from './CartContext'
import { menu } from '../data/menu'

const [first, second] = menu
if (!first || !second) throw new Error('The menu needs at least two items for these tests')

const REAL = first.id
const OTHER = second.id
const MAX_QTY = 20

describe('cartReducer', () => {
  it('starts a new line', () => {
    expect(cartReducer([], { type: 'add', id: REAL })).toEqual([{ id: REAL, quantity: 1 }])
  })

  it('merges a repeat add into the existing line rather than duplicating it', () => {
    const once = cartReducer([], { type: 'add', id: REAL })
    const twice = cartReducer(once, { type: 'add', id: REAL, quantity: 2 })
    expect(twice).toEqual([{ id: REAL, quantity: 3 }])
  })

  it('keeps distinct items as separate lines, in the order they were added', () => {
    const state = cartReducer(cartReducer([], { type: 'add', id: REAL }), {
      type: 'add',
      id: OTHER,
    })
    expect(state.map((line) => line.id)).toEqual([REAL, OTHER])
  })

  /*
   * The id can come from a URL or from localStorage written by an older build,
   * so it is not trustworthy. An unknown item must never reach a bill.
   */
  it('ignores an item that is not on the menu', () => {
    const state: CartLine[] = []
    expect(cartReducer(state, { type: 'add', id: 'kebab-that-never-existed' })).toBe(state)
  })

  it('caps a line at the maximum quantity', () => {
    const state = cartReducer([], { type: 'add', id: REAL, quantity: 999 })
    expect(state).toEqual([{ id: REAL, quantity: MAX_QTY }])
  })

  it('caps a line that is topped up past the maximum', () => {
    const near = [{ id: REAL, quantity: 19 }]
    expect(cartReducer(near, { type: 'add', id: REAL, quantity: 5 })).toEqual([
      { id: REAL, quantity: MAX_QTY },
    ])
  })

  it('treats a fractional or negative quantity as nothing to add', () => {
    const state: CartLine[] = []
    expect(cartReducer(state, { type: 'add', id: REAL, quantity: 0.4 })).toBe(state)
    expect(cartReducer(state, { type: 'add', id: REAL, quantity: -3 })).toBe(state)
  })

  it('removes the line when the quantity is set to zero', () => {
    const state = [{ id: REAL, quantity: 3 }]
    expect(cartReducer(state, { type: 'setQuantity', id: REAL, quantity: 0 })).toEqual([])
  })

  it('sets an explicit quantity', () => {
    const state = [{ id: REAL, quantity: 3 }]
    expect(cartReducer(state, { type: 'setQuantity', id: REAL, quantity: 7 })).toEqual([
      { id: REAL, quantity: 7 },
    ])
  })

  it('stores a kitchen note against the line', () => {
    const state = [{ id: REAL, quantity: 1 }]
    expect(cartReducer(state, { type: 'setNote', id: REAL, note: 'no pickles' })).toEqual([
      { id: REAL, quantity: 1, note: 'no pickles' },
    ])
  })

  it('truncates a note so one customer cannot bloat the WhatsApp message', () => {
    const state = [{ id: REAL, quantity: 1 }]
    const long = 'x'.repeat(500)
    const [line] = cartReducer(state, { type: 'setNote', id: REAL, note: long })
    expect(line?.note).toHaveLength(140)
  })

  it('removes and clears', () => {
    const state = [
      { id: REAL, quantity: 1 },
      { id: OTHER, quantity: 2 },
    ]
    expect(cartReducer(state, { type: 'remove', id: REAL })).toEqual([{ id: OTHER, quantity: 2 }])
    expect(cartReducer(state, { type: 'clear' })).toEqual([])
  })

  it('never mutates the state it was handed', () => {
    const state: CartLine[] = [{ id: REAL, quantity: 1 }]
    const snapshot = structuredClone(state)
    cartReducer(state, { type: 'add', id: REAL })
    cartReducer(state, { type: 'setQuantity', id: REAL, quantity: 9 })
    cartReducer(state, { type: 'setNote', id: REAL, note: 'extra sauce' })
    cartReducer(state, { type: 'remove', id: REAL })
    expect(state).toEqual(snapshot)
  })
})
