/**
 * What to suggest alongside what is already in the cart.
 *
 * The commercial point is average order value: a burger without a drink is a
 * smaller bill than a burger with one, and the moment to ask is on the way to
 * checkout. The rule is deliberately narrow — only ever suggest a *complement*,
 * never another main. Nobody adds a second burger because a website asked.
 *
 * Pure, and ordered deterministically, so the suggestions are testable rather
 * than a shuffle nobody can reason about.
 */

import { menu, type Category, type MenuItem } from '../data/menu'

/** Categories that make a meal on their own. */
const MAINS: readonly Category[] = ['burgers', 'chicken']

/** What is missing, in the order it is worth asking about. */
const COMPLEMENTS: readonly Category[] = ['sides', 'drinks']

export interface SuggestionGroup {
  category: Category
  items: MenuItem[]
}

/**
 * @param inCart  ids already in the cart
 * @param perCategory how many dishes to offer from each missing category
 */
export function suggestFor(
  inCart: readonly string[],
  perCategory = 2,
  catalogue: readonly MenuItem[] = menu,
): SuggestionGroup[] {
  const ids = new Set(inCart)
  const chosen = catalogue.filter((item) => ids.has(item.id))

  // Nothing to complement yet — an empty cart gets the menu, not a nudge.
  if (chosen.length === 0) return []

  const hasMain = chosen.some((item) => MAINS.includes(item.category))
  if (!hasMain) return []

  return COMPLEMENTS.flatMap((category) => {
    const alreadyHas = chosen.some((item) => item.category === category)
    if (alreadyHas) return []

    const items = catalogue
      .filter((item) => item.category === category && !ids.has(item.id))
      .slice(0, perCategory)

    return items.length > 0 ? [{ category, items }] : []
  })
}

/**
 * Dishes to show on a dish page under "goes well with".
 *
 * A main is paired with complements; a side or a drink is paired with the mains
 * it belongs beside — so the suggestion always points towards a fuller order.
 */
export function pairingsFor(
  item: MenuItem,
  limit = 3,
  catalogue: readonly MenuItem[] = menu,
): MenuItem[] {
  const wanted: readonly Category[] = MAINS.includes(item.category) ? COMPLEMENTS : MAINS

  return catalogue
    .filter((other) => other.id !== item.id && wanted.includes(other.category))
    .slice(0, limit)
}
