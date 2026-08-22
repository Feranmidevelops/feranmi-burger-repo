import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select, type Option } from './Select'

/**
 * This replaced a native <select>, which meant taking on the keyboard and
 * screen-reader behaviour the browser used to provide for free. These tests are
 * the contract for that: the WAI-ARIA select-only combobox pattern.
 */

const options: readonly Option[] = [
  { value: 'lekki', label: 'Lekki Phase 1', meta: '₦1,000 · 20 – 35 min' },
  { value: 'vi', label: 'Victoria Island', meta: '₦1,500 · 25 – 40 min' },
  { value: 'ikoyi', label: 'Ikoyi' },
  { value: 'yaba', label: 'Yaba' },
]

function setup(value = 'lekki') {
  const onChange = vi.fn()
  render(
    <Select id="zone" label="Delivery area" value={value} options={options} onChange={onChange} />,
  )
  return { onChange, trigger: screen.getByRole('combobox', { name: 'Delivery area' }) }
}

describe('Select', () => {
  it('exposes itself as a collapsed combobox', () => {
    const { trigger } = setup()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows the selected label, not the raw value', () => {
    const { trigger } = setup('vi')
    expect(trigger).toHaveTextContent('Victoria Island')
    expect(trigger).not.toHaveTextContent('vi')
  })

  it('opens on click and marks the current option as selected', async () => {
    const user = userEvent.setup()
    const { trigger } = setup('ikoyi')

    await user.click(trigger)

    const listbox = screen.getByRole('listbox')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(within(listbox).getByRole('option', { selected: true })).toHaveTextContent('Ikoyi')
  })

  it('reports the active option through aria-activedescendant while arrowing', async () => {
    const user = userEvent.setup()
    const { trigger } = setup('lekki')

    await user.click(trigger)
    const initial = trigger.getAttribute('aria-activedescendant')
    expect(initial).toBeTruthy()

    await user.keyboard('{ArrowDown}')
    const next = trigger.getAttribute('aria-activedescendant')
    expect(next).not.toBe(initial)
    expect(document.getElementById(next as string)).toHaveTextContent('Victoria Island')
  })

  it('commits the active option on Enter', async () => {
    const user = userEvent.setup()
    const { trigger, onChange } = setup('lekki')

    await user.click(trigger)
    await user.keyboard('{ArrowDown}{Enter}')

    expect(onChange).toHaveBeenCalledWith('vi')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opens from the keyboard alone, without a pointer', async () => {
    const user = userEvent.setup()
    const { trigger } = setup()

    trigger.focus()
    await user.keyboard('{ArrowDown}')

    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('closes on Escape without changing the value, and returns focus', async () => {
    const user = userEvent.setup()
    const { trigger, onChange } = setup('lekki')

    await user.click(trigger)
    await user.keyboard('{ArrowDown}{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
    expect(trigger).toHaveFocus()
  })

  it('jumps to an option by typing its first letters', async () => {
    const user = userEvent.setup()
    const { trigger, onChange } = setup('lekki')

    await user.click(trigger)
    await user.keyboard('ya{Enter}')

    expect(onChange).toHaveBeenCalledWith('yaba')
  })

  it('stops at the ends of the list rather than wrapping', async () => {
    const user = userEvent.setup()
    const { trigger, onChange } = setup('lekki')

    await user.click(trigger)
    await user.keyboard('{ArrowUp}{ArrowUp}{Enter}')

    expect(onChange).toHaveBeenCalledWith('lekki')
  })

  it('jumps to the first and last options with Home and End', async () => {
    const user = userEvent.setup()
    const { trigger, onChange } = setup('lekki')

    await user.click(trigger)
    await user.keyboard('{End}{Enter}')

    expect(onChange).toHaveBeenCalledWith('yaba')
  })

  it('closes when a click lands outside it', async () => {
    const user = userEvent.setup()
    const { trigger } = setup()

    await user.click(trigger)
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.click(document.body)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('carries the invalid state through to assistive technology', () => {
    render(
      <Select
        id="zone"
        label="Delivery area"
        value="lekki"
        options={options}
        onChange={vi.fn()}
        invalid
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Delivery area' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })
})
