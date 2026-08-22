import { describe, expect, it } from 'vitest'
import { futureDate, isClean, minLength, nigerianPhone, required, toE164 } from './validation'

describe('required / minLength', () => {
  it('rejects whitespace as if it were empty', () => {
    expect(required('   ', 'Name')).toBe('Name is required')
    expect(minLength('  ', 2, 'Name')).toBe('Name is required')
  })

  it('accepts real input', () => {
    expect(required('Feranmi', 'Name')).toBeNull()
    expect(minLength('Ade', 2, 'Name')).toBeNull()
  })

  it('measures length after trimming', () => {
    expect(minLength(' A ', 2, 'Name')).toBe('Name looks too short')
  })
})

describe('nigerianPhone', () => {
  /*
   * The order has to reach a real handset — the whole checkout hands off to
   * WhatsApp, so a malformed number means a lost sale with no way to chase it.
   */
  const valid = [
    '08012345678', // MTN
    '07031234567', // Airtel
    '09011234567', // 9mobile
    '08101234567',
    '0801 234 5678', // as people actually type it
    '0801-234-5678',
    '(0801) 234 5678',
    '+2348012345678',
    '2348012345678',
  ]

  it.each(valid)('accepts %s', (input) => {
    expect(nigerianPhone(input)).toBeNull()
  })

  const invalid = [
    ['', 'empty'],
    ['0801234567', 'one digit short'],
    ['080123456789', 'one digit long'],
    ['08512345678', 'not a mobile prefix'],
    ['+4479123456789', 'a UK number'],
    ['0801234567a', 'letters'],
  ] as const

  it.each(invalid)('rejects %s (%s)', (input) => {
    expect(nigerianPhone(input)).not.toBeNull()
  })
})

describe('toE164', () => {
  it('normalises every accepted shape to the same number', () => {
    const expected = '2348012345678'
    expect(toE164('08012345678')).toBe(expected)
    expect(toE164('0801 234 5678')).toBe(expected)
    expect(toE164('+234 801 234 5678')).toBe(expected)
    expect(toE164('2348012345678')).toBe(expected)
  })
})

describe('futureDate', () => {
  const iso = (offsetDays: number) => {
    const date = new Date()
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() + offsetDays)
    return date.toISOString().slice(0, 10)
  }

  it('requires a date', () => {
    expect(futureDate('', 'Date')).toBe('Date is required')
  })

  it('accepts today — a booking for tonight is normal', () => {
    expect(futureDate(iso(0), 'Date')).toBeNull()
  })

  it('accepts a date inside the booking window', () => {
    expect(futureDate(iso(30), 'Date')).toBeNull()
  })

  it('rejects yesterday', () => {
    expect(futureDate(iso(-1), 'Date')).toBe('Choose a date from today onwards')
  })

  it('rejects a date beyond the 60-day window', () => {
    expect(futureDate(iso(61), 'Date')).toBe('We only take bookings 60 days ahead')
  })

  it('rejects nonsense', () => {
    expect(futureDate('not-a-date', 'Date')).toBe('Choose a valid date')
  })
})

describe('isClean', () => {
  /*
   * `validate` only ever writes a key when that field failed, so a clean form
   * is the empty object rather than an object full of nulls. The type enforces
   * that under exactOptionalPropertyTypes; this pins the behaviour.
   */
  it('is true when no field recorded an error', () => {
    expect(isClean<{ name: string; phone: string }>({})).toBe(true)
  })

  it('is false as soon as one field has a message', () => {
    expect(isClean<{ name: string; phone: string }>({ name: 'Name is required' })).toBe(false)
  })

  it('is false when only a later field failed', () => {
    expect(isClean<{ name: string; phone: string }>({ phone: 'Enter a valid Nigerian number' }))
      .toBe(false)
  })
})
