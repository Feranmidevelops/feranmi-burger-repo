import type { ReactNode } from 'react'
import styles from './ui.module.css'

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string
  title: string
  children?: ReactNode
}) {
  return (
    <header className={styles.pageHeader}>
      <div className="container">
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={`display ${styles.pageTitle}`}>{title}</h1>
        {children && <div className={styles.pageIntro}>{children}</div>}
      </div>
    </header>
  )
}

export function QuantityStepper({
  value,
  onChange,
  label,
  min = 0,
  max = 20,
}: {
  value: number
  onChange: (next: number) => void
  label: string
  min?: number
  max?: number
}) {
  return (
    <div className={styles.stepper}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <output aria-label={`${label} quantity`}>{value}</output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  )
}

interface FieldProps {
  id: string
  label: string
  error?: string | undefined
  hint?: string
  children: (describedBy: string | undefined) => ReactNode
}

/**
 * Wires a label, hint and error message to a control via aria-describedby so
 * screen readers announce the failure with the field, not somewhere else.
 */
export function Field({ id, label, error, hint, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={styles.field} data-invalid={error ? 'true' : 'false'}>
      <label htmlFor={id}>{label}</label>
      {hint && (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      )}
      {children(describedBy)}
      {error && (
        <p className={styles.error} id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className={styles.empty}>
      <h2 className={`display ${styles.emptyTitle}`}>{title}</h2>
      <p>{body}</p>
      {action}
    </div>
  )
}

export function Summary({ rows, total }: { rows: [string, string][]; total: [string, string] }) {
  return (
    <dl className={styles.summary}>
      {rows.map(([term, value]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
      <div className={styles.summaryTotal}>
        <dt>{total[0]}</dt>
        <dd>{total[1]}</dd>
      </div>
    </dl>
  )
}
