import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { menuById, type MenuItem } from '../data/menu'

const STORAGE_KEY = 'feranmi.cart.v1'
const MAX_QTY = 20

export interface CartLine {
  id: string
  quantity: number
  /** Free-text kitchen note, e.g. "no pickles". */
  note?: string
}

/** A line joined to its menu item, with the line total resolved. */
export interface ResolvedLine extends CartLine {
  item: MenuItem
  lineTotal: number
}

type Action =
  | { type: 'add'; id: string; quantity?: number }
  | { type: 'setQuantity'; id: string; quantity: number }
  | { type: 'setNote'; id: string; note: string }
  | { type: 'remove'; id: string }
  | { type: 'clear' }
  | { type: 'hydrate'; lines: CartLine[] }

const clamp = (n: number) => Math.max(0, Math.min(MAX_QTY, Math.trunc(n)))

export function cartReducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case 'add': {
      if (!menuById.has(action.id)) return state
      const delta = clamp(action.quantity ?? 1)
      if (delta === 0) return state
      const existing = state.find((line) => line.id === action.id)
      if (!existing) return [...state, { id: action.id, quantity: delta }]
      return state.map((line) =>
        line.id === action.id ? { ...line, quantity: clamp(line.quantity + delta) } : line,
      )
    }
    case 'setQuantity': {
      const quantity = clamp(action.quantity)
      if (quantity === 0) return state.filter((line) => line.id !== action.id)
      return state.map((line) => (line.id === action.id ? { ...line, quantity } : line))
    }
    case 'setNote':
      return state.map((line) =>
        line.id === action.id ? { ...line, note: action.note.slice(0, 140) } : line,
      )
    case 'remove':
      return state.filter((line) => line.id !== action.id)
    case 'clear':
      return []
    case 'hydrate':
      return action.lines
    default:
      return state
  }
}

/** Drops anything that no longer matches a menu item — the menu can change under a stored cart. */
function parseStored(raw: string | null): CartLine[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((entry): CartLine[] => {
      if (typeof entry !== 'object' || entry === null) return []
      const { id, quantity, note } = entry as Record<string, unknown>
      if (typeof id !== 'string' || !menuById.has(id)) return []
      if (typeof quantity !== 'number' || !Number.isFinite(quantity)) return []
      const qty = clamp(quantity)
      if (qty === 0) return []
      return [typeof note === 'string' ? { id, quantity: qty, note } : { id, quantity: qty }]
    })
  } catch {
    return []
  }
}

interface CartValue {
  lines: ResolvedLine[]
  count: number
  subtotal: number
  add: (id: string, quantity?: number) => void
  setQuantity: (id: string, quantity: number) => void
  setNote: (id: string, note: string) => void
  remove: (id: string) => void
  clear: () => void
}

const CartContext = createContext<CartValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, [])

  // Hydrate after mount so the reducer's initial state stays pure and testable.
  useEffect(() => {
    const stored = parseStored(localStorage.getItem(STORAGE_KEY))
    if (stored.length > 0) dispatch({ type: 'hydrate', lines: stored })
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const add = useCallback((id: string, quantity?: number) => {
    dispatch(quantity === undefined ? { type: 'add', id } : { type: 'add', id, quantity })
  }, [])
  const setQuantity = useCallback(
    (id: string, quantity: number) => dispatch({ type: 'setQuantity', id, quantity }),
    [],
  )
  const setNote = useCallback(
    (id: string, note: string) => dispatch({ type: 'setNote', id, note }),
    [],
  )
  const remove = useCallback((id: string) => dispatch({ type: 'remove', id }), [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])

  const value = useMemo<CartValue>(() => {
    const resolved = lines.flatMap((line): ResolvedLine[] => {
      const item = menuById.get(line.id)
      if (!item) return []
      return [{ ...line, item, lineTotal: item.price * line.quantity }]
    })
    return {
      lines: resolved,
      count: resolved.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: resolved.reduce((sum, line) => sum + line.lineTotal, 0),
      add,
      setQuantity,
      setNote,
      remove,
      clear,
    }
  }, [lines, add, setQuantity, setNote, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartValue {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside a <CartProvider>')
  return value
}
