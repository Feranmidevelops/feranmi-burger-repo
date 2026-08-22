import { describe, expect, it } from 'vitest'
import { pairingsFor, suggestFor } from './upsell'
import { menu, type Category, type MenuItem } from '../data/menu'

const firstOf = (category: Category): MenuItem => {
  const item = menu.find((entry) => entry.category === category)
  if (!item) throw new Error(`The menu has no ${category}`)
  return item
}

const burger = firstOf('burgers')
const chicken = firstOf('chicken')
const side = firstOf('sides')
const drink = firstOf('drinks')

const categoriesIn = (groups: ReturnType<typeof suggestFor>) =>
  groups.map((group) => group.category)

describe('suggestFor', () => {
  it('suggests nothing for an empty cart — there is nothing to complement', () => {
    expect(suggestFor([])).toEqual([])
  })

  it('offers a side and a drink alongside a lone burger', () => {
    expect(categoriesIn(suggestFor([burger.id]))).toEqual(['sides', 'drinks'])
  })

  it('treats chicken as a main too', () => {
    expect(categoriesIn(suggestFor([chicken.id]))).toEqual(['sides', 'drinks'])
  })

  it('stops asking about a category already in the cart', () => {
    expect(categoriesIn(suggestFor([burger.id, side.id]))).toEqual(['drinks'])
    expect(categoriesIn(suggestFor([burger.id, drink.id]))).toEqual(['sides'])
  })

  it('goes quiet once the order is complete', () => {
    expect(suggestFor([burger.id, side.id, drink.id])).toEqual([])
  })

  /*
   * The rule that keeps this from being annoying. A cart holding only a drink
   * is somebody buying a drink; pushing a burger at them is the behaviour that
   * makes people distrust a checkout.
   */
  it('never suggests a main', () => {
    expect(suggestFor([side.id])).toEqual([])
    expect(suggestFor([drink.id])).toEqual([])

    const everySuggestion = suggestFor([burger.id]).flatMap((group) => group.items)
    expect(everySuggestion.every((item) => !['burgers', 'chicken'].includes(item.category))).toBe(
      true,
    )
  })

  it('never suggests something already in the cart', () => {
    const suggested = suggestFor([burger.id]).flatMap((group) => group.items.map((i) => i.id))
    expect(suggested).not.toContain(burger.id)
  })

  it('honours the per-category limit', () => {
    for (const group of suggestFor([burger.id], 1)) {
      expect(group.items).toHaveLength(1)
    }
  })

  it('is deterministic — the same cart always gets the same offer', () => {
    expect(suggestFor([burger.id])).toEqual(suggestFor([burger.id]))
  })

  it('omits a category with nothing left to offer', () => {
    const catalogue = [burger, side]
    // Only one side exists in this catalogue, and it is already in the cart.
    expect(suggestFor([burger.id, side.id], 2, catalogue)).toEqual([])
  })
})

describe('pairingsFor', () => {
  it('pairs a main with complements', () => {
    const pairings = pairingsFor(burger)
    expect(pairings.length).toBeGreaterThan(0)
    expect(pairings.every((item) => ['sides', 'drinks'].includes(item.category))).toBe(true)
  })

  it('pairs a side with mains, pointing towards a fuller order', () => {
    expect(pairingsFor(side).every((item) => ['burgers', 'chicken'].includes(item.category))).toBe(
      true,
    )
  })

  it('never pairs a dish with itself', () => {
    for (const item of menu) {
      expect(pairingsFor(item).map((other) => other.id)).not.toContain(item.id)
    }
  })

  it('respects the limit', () => {
    expect(pairingsFor(burger, 2)).toHaveLength(2)
  })

  it('offers something for every dish on the menu', () => {
    for (const item of menu) {
      expect(pairingsFor(item).length).toBeGreaterThan(0)
    }
  })
})
