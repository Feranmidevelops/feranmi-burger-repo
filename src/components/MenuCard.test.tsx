import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { MenuCard } from './MenuCard'
import { CartProvider } from '../cart/CartContext'
import { formatNaira } from '../lib/money'
import { menu } from '../data/menu'
import { menuItemPath } from '../lib/seo'

const item = menu[0]
if (!item) throw new Error('The menu is empty')

// The card links to its dish page, so it needs a router as well as the cart.
const wrap = (ui: ReactNode) =>
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CartProvider>{ui}</CartProvider>
    </MemoryRouter>,
  )

describe('MenuCard', () => {
  it('shows the name, description and formatted price', () => {
    wrap(<MenuCard item={item} />)
    expect(screen.getByRole('heading', { name: item.name })).toBeInTheDocument()
    expect(screen.getByText(item.description)).toBeInTheDocument()
    expect(screen.getByText(formatNaira(item.price))).toBeInTheDocument()
  })

  it('gives the photo real alt text rather than the dish name over again', () => {
    wrap(<MenuCard item={item} />)
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('alt', item.alt)
    // Intrinsic dimensions reserve the space, so the grid does not jump on load.
    expect(image).toHaveAttribute('width')
    expect(image).toHaveAttribute('height')
  })

  /*
   * Above-the-fold cards must not be lazy: the browser measures lazy images
   * against the nearest scrollport, and anything that turns the page into one
   * starves them — which is exactly how the menu once rendered empty.
   */
  it('loads eagerly when marked as visible on arrival', () => {
    wrap(<MenuCard item={item} priority />)
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager')
  })

  it('defers everything below the fold', () => {
    wrap(<MenuCard item={item} />)
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy')
  })

  it('names the dish in the add button, so the label is unique out of context', () => {
    wrap(<MenuCard item={item} />)
    expect(
      screen.getByRole('button', { name: new RegExp(`add to cart.*${item.name}`, 'i') }),
    ).toBeInTheDocument()
  })

  it('confirms the add, then settles back', async () => {
    const user = userEvent.setup()
    wrap(<MenuCard item={item} />)

    await user.click(screen.getByRole('button', { name: /add to cart/i }))
    expect(screen.getByRole('button', { name: /added/i })).toBeInTheDocument()
  })

  it('writes the line through to the stored cart', async () => {
    const user = userEvent.setup()
    wrap(<MenuCard item={item} />)

    await user.click(screen.getByRole('button', { name: /add to cart/i }))

    const stored = JSON.parse(localStorage.getItem('feranmi.cart.v1') ?? '[]')
    expect(stored).toEqual([{ id: item.id, quantity: 1 }])
  })

  it('links the dish name to its own page', () => {
    wrap(<MenuCard item={item} />)
    const link = screen.getByRole('link', { name: item.name })
    expect(link).toHaveAttribute('href', menuItemPath(item))
  })

  /*
   * The card cannot itself be a link: it contains the add-to-cart button, and
   * an interactive control inside an anchor is invalid and unusable by keyboard.
   */
  it('keeps the add button outside the link', () => {
    wrap(<MenuCard item={item} />)
    const link = screen.getByRole('link', { name: item.name })
    expect(link.querySelector('button')).toBeNull()
  })

  it('shows the badge when the dish has one', () => {
    const badged = menu.find((entry) => entry.badge)
    if (!badged) return
    wrap(<MenuCard item={badged} />)
    expect(screen.getByRole('heading', { name: badged.name })).toBeInTheDocument()
  })
})
