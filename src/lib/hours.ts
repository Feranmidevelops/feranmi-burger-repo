/**
 * Opening hours, resolved against a real clock.
 *
 * Everything here works in the *restaurant's* timezone, not the visitor's. A
 * customer browsing from London at 23:00 GMT is looking at a Lagos kitchen at
 * midnight, and the page has to say so — otherwise the app happily takes an
 * order into a dark kitchen.
 *
 * Pure and dependency-free: `now` is always passed in, never read from the
 * ambient clock, so the behaviour is testable at any instant.
 */

import { site, type HoursBlock } from '../data/site'

/** Indexed by JavaScript's weekday numbering (0 = Sunday). */
export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

/** A single day's trading window, in minutes from that day's midnight. */
interface Interval {
  day: number
  start: number
  /** May exceed 1440 when a block runs past midnight. */
  end: number
}

const MINUTES_PER_DAY = 1440

export function toMinutes(hhmm: string): number {
  const [hours = 0, minutes = 0] = hhmm.split(':').map(Number)
  return hours * 60 + minutes
}

export function toClock(minutes: number): string {
  const wrapped = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY
  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`
}

function intervals(blocks: readonly HoursBlock[]): Interval[] {
  return blocks.flatMap((block) => {
    const start = toMinutes(block.open)
    const rawEnd = toMinutes(block.close)
    // A close time at or before the open time means the block runs past midnight.
    const end = rawEnd <= start ? rawEnd + MINUTES_PER_DAY : rawEnd
    return block.days.map((day) => ({ day, start, end }))
  })
}

/**
 * The current weekday and minute-of-day in a given timezone.
 *
 * Derived from `Intl` rather than from date arithmetic so it stays correct
 * without shipping a timezone database — and it is the only place the
 * conversion happens.
 */
export function zonedNow(now: Date, timeZone: string): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'))
  return {
    day: day < 0 ? now.getUTCDay() : day,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  }
}

export interface OpenState {
  open: boolean
  /** Badge text — two words at most. */
  label: string
  /** Sentence for banners, e.g. "Closes at 22:00" or "Opens tomorrow at 11:00". */
  detail: string
  /** Local clock time of the next state change, "HH:MM". */
  at: string
}

/**
 * Whether the kitchen is trading at `now`, and when that next changes.
 *
 * @param blocks defaults to the configured opening hours
 * @param timeZone defaults to the restaurant's own timezone
 */
export function openState(
  now: Date,
  blocks: readonly HoursBlock[] = site.hours,
  timeZone: string = site.timeZone,
): OpenState {
  const all = intervals(blocks)
  const { day, minutes } = zonedNow(now, timeZone)

  // Today's windows, plus yesterday's shifted forward so an overnight block that
  // began before midnight is still seen as open.
  const active =
    all.find((slot) => slot.day === day && minutes >= slot.start && minutes < slot.end) ??
    all.find(
      (slot) =>
        slot.day === (day + 6) % 7 &&
        minutes + MINUTES_PER_DAY >= slot.start &&
        minutes + MINUTES_PER_DAY < slot.end,
    )

  if (active) {
    const closes = toClock(active.end)
    return { open: true, label: 'Open now', detail: `Closes at ${closes}`, at: closes }
  }

  for (let offset = 0; offset <= 7; offset += 1) {
    const target = (day + offset) % 7
    const next = all
      .filter((slot) => slot.day === target && !(offset === 0 && slot.start <= minutes))
      .sort((a, b) => a.start - b.start)[0]
    if (!next) continue

    const opens = toClock(next.start)
    const when =
      offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : `on ${DAY_NAMES[target]?.toLowerCase()}`
    return { open: false, label: 'Closed', detail: `Opens ${when} at ${opens}`, at: opens }
  }

  return { open: false, label: 'Closed', detail: 'Opening hours vary — call to check', at: '' }
}

/**
 * Turns `[1, 2, 3, 4]` into "Monday – Thursday", collapsing consecutive runs.
 * The week is read Monday-first, which is how the hours are written on the door.
 */
export function formatDayRange(days: readonly number[]): string {
  const mondayFirst = (day: number) => (day + 6) % 7
  const sorted = [...new Set(days)].sort((a, b) => mondayFirst(a) - mondayFirst(b))

  const runs: number[][] = []
  for (const day of sorted) {
    const current = runs[runs.length - 1]
    const previous = current?.[current.length - 1]
    if (current && previous !== undefined && mondayFirst(day) === mondayFirst(previous) + 1) {
      current.push(day)
    } else {
      runs.push([day])
    }
  }

  return runs
    .map((run) => {
      const first = DAY_NAMES[run[0] as number]
      const last = DAY_NAMES[run[run.length - 1] as number]
      return run.length === 1 ? first : `${first} – ${last}`
    })
    .join(', ')
}

/** Stable key for React lists over the hours blocks. */
export function blockKey(block: HoursBlock): string {
  return `${block.days.join('-')}-${block.open}`
}
