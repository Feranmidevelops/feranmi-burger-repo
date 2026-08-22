import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { RecentOrders } from './RecentOrders'
import { CartProvider } from '../cart/CartContext'
import { clearOrders, recordOrder } from '../cart/orders'
import { menu } from '../data/menu'
import type { OrderDetails } from '../lib/whatsapp'
import type { ResolvedLine } from '../cart/CartContext'

const [first, second] = menu
if (!first || !second) throw new Error('These tests need two menu items')

const line = (item: typeof first, quantity: number, note?: string): ResolvedLine => ({
  id: item.id,
  quantity,
  item,
  lineTotal: item.price * quantity,
  ...(note === undefined ? {} : { note }),
})

const placed: OrderDetails = {
  reference: 'FR-7K2Q9M',
  name: 'Ada Obi',
  phone: '2348012345678',
  fulfilment: 'delivery',
  lines: [line(first, 2, 'no pickles'), line(second, 1)],
  subtotal: first.price * 2 + second.price,
  deliveryFee: 100_000,
  total: first.price * 2 + second.price + 100_000,
}

const wrap = (ui: ReactNode) => render(<CartProvider>{ui}</CartProvider>)

const storedCart = () => JSON.parse(localStorage.getItem('feranmi.cart.v1') ?? '[]')

// History lives under its own key, which the global setup does not clear.
afterEach(() => clearOrders())

describe('RecentOrders', () => {
  it('renders nothing when there is no history — no empty shell on a first visit', () => {
    const { container } = wrap(<RecentOrders />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lists a past order with its dishes, count and total', () => {
    recordOrder(placed, new Date('2026-08-20T18:00:00Z'))
    wrap(<RecentOrders />)

    expect(screen.getByText(`${first.name} and ${second.name}`)).toBeInTheDocument()
    expect(screen.getByText(/3 items/)).toBeInTheDocument()
    expect(screen.getByText(/Delivered/)).toBeInTheDocument()
  })

  it('puts the whole order back in the cart in one tap', async () => {
    const user = userEvent.setup()
    recordOrder(placed, new Date('2026-08-20T18:00:00Z'))
    wrap(<RecentOrders />)

    await user.click(screen.getByRole('button', { name: /order again/i }))

    expect(storedCart()).toEqual([
      { id: first.id, quantity: 2, note: 'no pickles' },
      { id: second.id, quantity: 1 },
    ])
  })

  it('confirms the re-order rather than leaving the tap unacknowledged', async () => {
    const user = userEvent.setup()
    recordOrder(placed, new Date('2026-08-20T18:00:00Z'))
    wrap(<RecentOrders />)

    await user.click(screen.getByRole('button', { name: /order again/i }))
    expect(screen.getByRole('button', { name: /added to cart/i })).toBeInTheDocument()
  })

  it('forgets the history on request, and stays gone', async () => {
    const user = userEvent.setup()
    recordOrder(placed, new Date('2026-08-20T18:00:00Z'))
    const { container } = wrap(<RecentOrders />)

    await user.click(screen.getByRole('button', { name: /forget history/i }))

    expect(container).toBeEmptyDOMElement()
    expect(localStorage.getItem('feranmi.orders.v1')).toBeNull()
  })

  it('takes a heading, so the empty cart can phrase it differently', () => {
    recordOrder(placed, new Date('2026-08-20T18:00:00Z'))
    wrap(<RecentOrders heading="Or order it again" />)
    expect(screen.getByRole('heading', { name: /or order it again/i })).toBeInTheDocument()
  })

  it('is honest that the history never leaves the device', () => {
    recordOrder(placed, new Date('2026-08-20T18:00:00Z'))
    wrap(<RecentOrders />)
    expect(screen.getByText(/kept on this device only/i)).toBeInTheDocument()
  })
})
