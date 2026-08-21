import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { CaretDown, Check } from '@phosphor-icons/react'
import { ICON } from './Icons'
import styles from './Select.module.css'

export interface Option {
  value: string
  label: string
  /** Optional second line, e.g. a delivery fee and ETA. */
  meta?: string
}

interface SelectProps {
  id: string
  value: string
  options: readonly Option[]
  onChange: (value: string) => void
  describedBy?: string | undefined
  invalid?: boolean
  /** Accessible name when the field has no visible <label>. */
  label?: string
}

/**
 * A select-only combobox (WAI-ARIA 1.2 pattern), used instead of a native
 * <select> because a native option list cannot be themed — the popup is painted
 * by the OS, so brand colours stop at the closed control.
 *
 * Focus stays on the trigger and the active option is tracked with
 * aria-activedescendant, which keeps the keyboard model simple and consistent.
 */
export function Select({
  id,
  value,
  options,
  onChange,
  describedBy,
  invalid,
  label,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [dropUp, setDropUp] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const typeahead = useRef({ buffer: '', at: 0 })

  const listId = `${useId()}-listbox`
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const selected = options[selectedIndex]

  const close = useCallback((focusTrigger = true) => {
    setOpen(false)
    if (focusTrigger) triggerRef.current?.focus()
  }, [])

  const commit = useCallback(
    (index: number) => {
      const option = options[index]
      if (option) onChange(option.value)
      close()
    },
    [options, onChange, close],
  )

  // Open with the current selection active.
  const openList = useCallback(() => {
    setActiveIndex(selectedIndex)
    setOpen(true)
  }, [selectedIndex])

  // Flip the panel upwards when there isn't room below.
  useLayoutEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    const list = listRef.current
    if (!trigger || !list) return
    const rect = trigger.getBoundingClientRect()
    const needed = Math.min(list.scrollHeight, 320)
    setDropUp(rect.bottom + needed > window.innerHeight && rect.top > needed)
  }, [open])

  // Keep the active option in view while arrowing through a long list.
  useEffect(() => {
    if (!open) return
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function onKeyDown(event: React.KeyboardEvent) {
    const last = options.length - 1

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault()
        openList()
      }
      return
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        close()
        return
      case 'Tab':
        setOpen(false)
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        commit(activeIndex)
        return
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((index) => Math.min(last, index + 1))
        return
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((index) => Math.max(0, index - 1))
        return
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        return
      case 'End':
        event.preventDefault()
        setActiveIndex(last)
        return
      default:
        break
    }

    // Typeahead: printable keys jump to the next option starting with them.
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const now = Date.now()
      const state = typeahead.current
      state.buffer = now - state.at > 700 ? event.key : state.buffer + event.key
      state.at = now
      const needle = state.buffer.toLowerCase()
      const found = options.findIndex((option) => option.label.toLowerCase().startsWith(needle))
      if (found >= 0) setActiveIndex(found)
    }
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        role="combobox"
        className={styles.trigger}
        data-open={open}
        data-invalid={invalid ? 'true' : 'false'}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        {...(open ? { 'aria-activedescendant': `${listId}-${activeIndex}` } : {})}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
      >
        <span className={styles.value}>{selected?.label ?? ''}</span>
        <CaretDown className={styles.chevron} weight={ICON.strong} />
      </button>

      {open && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          className={styles.list}
          data-drop-up={dropUp}
          tabIndex={-1}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              className={styles.option}
              data-index={index}
              data-active={index === activeIndex}
              aria-selected={option.value === value}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => commit(index)}
            >
              <Check className={styles.tick} weight={ICON.strong} aria-hidden />
              <span className={styles.optionLabel}>{option.label}</span>
              {option.meta && <span className={styles.optionMeta}>{option.meta}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
