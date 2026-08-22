import { describe, expect, it } from 'vitest'
import { formatDayRange, openState, toClock, toMinutes, zonedNow } from './hours'
import type { HoursBlock } from '../data/site'

/**
 * The real schedule, restated here rather than imported, so a change to the
 * trading hours in `site.ts` fails loudly instead of silently rewriting the
 * expectations it is supposed to be checked against.
 */
const HOURS: readonly HoursBlock[] = [
  { days: [1, 2, 3, 4], open: '11:00', close: '22:00' },
  { days: [5, 6], open: '11:00', close: '23:30' },
  { days: [0], open: '12:00', close: '21:00' },
]

/** Lagos is UTC+1 all year — no daylight saving — so this offset is stable. */
const lagos = (iso: string) => new Date(`${iso}+01:00`)

describe('toMinutes / toClock', () => {
  it('round-trips a clock time', () => {
    expect(toMinutes('11:00')).toBe(660)
    expect(toMinutes('23:30')).toBe(1410)
    expect(toClock(660)).toBe('11:00')
    expect(toClock(1410)).toBe('23:30')
  })

  it('wraps times that ran past midnight back into a readable clock', () => {
    expect(toClock(1500)).toBe('01:00')
  })
})

describe('zonedNow', () => {
  it('reads the weekday and time in the restaurant timezone, not the visitor’s', () => {
    // 23:30 UTC on Friday is already 00:30 Saturday in Lagos.
    const friday = new Date('2026-08-21T23:30:00Z')
    expect(zonedNow(friday, 'Africa/Lagos')).toEqual({ day: 6, minutes: 30 })
    expect(zonedNow(friday, 'UTC')).toEqual({ day: 5, minutes: 23 * 60 + 30 })
  })
})

describe('openState', () => {
  // 2026-08-19 is a Wednesday, 2026-08-21 a Friday, 2026-08-23 a Sunday.

  it('is open in the middle of a weekday service', () => {
    const state = openState(lagos('2026-08-19T13:00:00'), HOURS)
    expect(state).toMatchObject({ open: true, label: 'Open now', detail: 'Closes at 22:00' })
  })

  it('opens exactly on the hour, not a minute before', () => {
    expect(openState(lagos('2026-08-19T10:59:00'), HOURS).open).toBe(false)
    expect(openState(lagos('2026-08-19T11:00:00'), HOURS).open).toBe(true)
  })

  it('is shut the instant the kitchen closes', () => {
    expect(openState(lagos('2026-08-19T21:59:00'), HOURS).open).toBe(true)
    expect(openState(lagos('2026-08-19T22:00:00'), HOURS).open).toBe(false)
  })

  it('points at today when it has not opened yet', () => {
    expect(openState(lagos('2026-08-19T09:00:00'), HOURS).detail).toBe('Opens today at 11:00')
  })

  it('points at tomorrow once the day is done', () => {
    expect(openState(lagos('2026-08-19T23:00:00'), HOURS).detail).toBe('Opens tomorrow at 11:00')
  })

  it('uses the later Friday closing time', () => {
    const state = openState(lagos('2026-08-21T23:00:00'), HOURS)
    expect(state).toMatchObject({ open: true, detail: 'Closes at 23:30' })
  })

  it('uses the shorter Sunday hours', () => {
    expect(openState(lagos('2026-08-23T11:30:00'), HOURS).open).toBe(false)
    expect(openState(lagos('2026-08-23T12:30:00'), HOURS).open).toBe(true)
    expect(openState(lagos('2026-08-23T21:30:00'), HOURS).open).toBe(false)
  })

  it('names the weekday when the next opening is further out', () => {
    // Closed all Monday and Tuesday in this schedule.
    const sparse: HoursBlock[] = [{ days: [3], open: '11:00', close: '22:00' }]
    expect(openState(lagos('2026-08-24T12:00:00'), sparse).detail).toBe(
      'Opens on wednesday at 11:00',
    )
  })

  it('judges a visitor abroad by the Lagos clock', () => {
    // 21:30 UTC on Wednesday is 22:30 in Lagos — the kitchen has shut.
    const state = openState(new Date('2026-08-19T21:30:00Z'), HOURS)
    expect(state.open).toBe(false)
  })

  it('stays open through a block that runs past midnight', () => {
    const late: HoursBlock[] = [{ days: [5], open: '18:00', close: '02:00' }]
    expect(openState(lagos('2026-08-21T20:00:00'), late).open).toBe(true)
    // Saturday 01:00 is still inside Friday's window.
    expect(openState(lagos('2026-08-22T01:00:00'), late).open).toBe(true)
    expect(openState(lagos('2026-08-22T03:00:00'), late).open).toBe(false)
  })

  it('does not crash when the restaurant never opens', () => {
    expect(openState(lagos('2026-08-19T12:00:00'), []).open).toBe(false)
  })
})

describe('formatDayRange', () => {
  it('collapses a consecutive run', () => {
    expect(formatDayRange([1, 2, 3, 4])).toBe('Monday – Thursday')
    expect(formatDayRange([5, 6])).toBe('Friday – Saturday')
  })

  it('leaves a single day alone', () => {
    expect(formatDayRange([0])).toBe('Sunday')
  })

  it('reads the week Monday-first, so Sunday closes the weekend rather than opening the week', () => {
    // Saturday and Sunday are adjacent only under Monday-first ordering; with
    // JavaScript's Sunday-first numbering (0 and 6) they look like opposite ends.
    expect(formatDayRange([0, 6])).toBe('Saturday – Sunday')
    expect(formatDayRange([0, 1])).toBe('Monday, Sunday')
  })

  it('splits a run that has a gap in it', () => {
    expect(formatDayRange([1, 2, 4, 5])).toBe('Monday – Tuesday, Thursday – Friday')
  })

  it('is order-independent and ignores duplicates', () => {
    expect(formatDayRange([4, 1, 3, 2, 2])).toBe('Monday – Thursday')
  })
})
