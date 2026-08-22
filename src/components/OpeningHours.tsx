import { Moon } from '@phosphor-icons/react'
import { site } from '../data/site'
import { ICON } from './Icons'
import { blockKey, formatDayRange } from '../lib/hours'
import { useOpenState } from '../hooks/useOpenState'
import styles from './OpeningHours.module.css'

/** The trading timetable. The day labels are derived, never hand-written. */
export function OpeningHours({ className }: { className?: string }) {
  return (
    <dl className={className}>
      {site.hours.map((block) => (
        <div key={blockKey(block)}>
          <dt>{formatDayRange(block.days)}</dt>
          <dd>
            {block.open} – {block.close}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Live "Open now / Closed" pill. `role="status"` so a screen reader hears the
 * change if the kitchen closes while the page is open.
 */
export function OpenBadge({ className }: { className?: string }) {
  const state = useOpenState()

  return (
    <p
      className={[styles.badge, className].filter(Boolean).join(' ')}
      data-open={state.open}
      role="status"
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{state.label}</span>
      <span className={styles.detail}> · {state.detail}</span>
    </p>
  )
}

/**
 * Shown at checkout when the kitchen is shut.
 *
 * Deliberately a warning and not a block: restaurants take pre-orders happily,
 * and refusing the order would just send the customer somewhere else. What
 * matters is that nobody sends an order believing it is being cooked now.
 */
export function ClosedNotice({ className }: { className?: string }) {
  const state = useOpenState()
  if (state.open) return null

  return (
    <p className={[styles.closed, className].filter(Boolean).join(' ')} role="status">
      <Moon className={styles.closedIcon} weight={ICON.strong} aria-hidden />
      <span>
        <strong>The kitchen is closed right now.</strong> {state.detail} (
        {site.timeZone.split('/')[1]} time). You can still send this — we will start it as a
        pre-order the moment we open.
      </span>
    </p>
  )
}
