import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { ClosedNotice, OpenBadge, OpeningHours } from './OpeningHours'
import { site } from '../data/site'

/**
 * The clock is faked rather than mocked out, so these exercise the real
 * `openState` against the real configured hours — the same path a visitor hits.
 */

/** Lagos is UTC+1 year-round, so a fixed offset is safe here. */
const atLagos = (iso: string) => vi.setSystemTime(new Date(`${iso}+01:00`))

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
afterEach(() => vi.useRealTimers())

describe('OpeningHours', () => {
  it('derives a readable label for every block instead of storing one', () => {
    render(<OpeningHours />)
    // site.ts holds day numbers; the words are computed.
    expect(screen.getByText('Monday – Thursday')).toBeInTheDocument()
    expect(screen.getByText('Friday – Saturday')).toBeInTheDocument()
    expect(screen.getByText('Sunday')).toBeInTheDocument()
  })

  it('renders one row per block, as a description list', () => {
    const { container } = render(<OpeningHours />)
    expect(container.querySelectorAll('dt')).toHaveLength(site.hours.length)
    expect(container.querySelectorAll('dd')).toHaveLength(site.hours.length)
  })
})

describe('OpenBadge', () => {
  it('says the kitchen is open during service, with the closing time', () => {
    atLagos('2026-08-19T13:00:00') // Wednesday lunch
    render(<OpenBadge />)

    const badge = screen.getByRole('status')
    expect(badge).toHaveAttribute('data-open', 'true')
    expect(badge).toHaveTextContent('Open now')
    expect(badge).toHaveTextContent('Closes at 22:00')
  })

  it('says the kitchen is closed overnight, with the next opening', () => {
    atLagos('2026-08-19T03:00:00')
    render(<OpenBadge />)

    const badge = screen.getByRole('status')
    expect(badge).toHaveAttribute('data-open', 'false')
    expect(badge).toHaveTextContent('Closed')
    expect(badge).toHaveTextContent('Opens today at 11:00')
  })

  it('judges by the Lagos clock, not the visitor’s', () => {
    // 22:30 UTC on Wednesday is 23:30 in Lagos — well after closing.
    vi.setSystemTime(new Date('2026-08-19T22:30:00Z'))
    render(<OpenBadge />)
    expect(screen.getByRole('status')).toHaveAttribute('data-open', 'false')
  })

  it('flips to closed on its own when service ends mid-visit', () => {
    atLagos('2026-08-19T21:59:30')
    render(<OpenBadge />)
    expect(screen.getByRole('status')).toHaveAttribute('data-open', 'true')

    // A tab left open past closing must not keep advertising an open kitchen.
    // `act` is what flushes the state update the interval schedules.
    act(() => vi.advanceTimersByTime(60_000))
    expect(screen.getByRole('status')).toHaveAttribute('data-open', 'false')
  })
})

describe('ClosedNotice', () => {
  it('stays out of the way while the kitchen is open', () => {
    atLagos('2026-08-19T13:00:00')
    const { container } = render(<ClosedNotice />)
    expect(container).toBeEmptyDOMElement()
  })

  it('warns when the kitchen is shut, and says when it opens', () => {
    atLagos('2026-08-19T23:30:00')
    render(<ClosedNotice />)

    const notice = screen.getByRole('status')
    expect(notice).toHaveTextContent('The kitchen is closed right now')
    expect(notice).toHaveTextContent('Opens tomorrow at 11:00')
  })

  /*
   * Deliberately a warning, not a block. Refusing the order would just send the
   * customer elsewhere; restaurants take pre-orders happily. What matters is
   * that nobody sends one believing it is being cooked now.
   */
  it('still invites the order through as a pre-order', () => {
    atLagos('2026-08-19T23:30:00')
    render(<ClosedNotice />)
    expect(screen.getByRole('status')).toHaveTextContent('pre-order')
  })
})
