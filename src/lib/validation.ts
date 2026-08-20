/** Small, dependency-free validators. Each returns an error string, or null when valid. */

export type Errors<T> = Partial<Record<keyof T, string>>

export function required(value: string, label: string): string | null {
  return value.trim().length === 0 ? `${label} is required` : null
}

export function minLength(value: string, min: number, label: string): string | null {
  const trimmed = value.trim()
  if (trimmed.length === 0) return `${label} is required`
  return trimmed.length < min ? `${label} looks too short` : null
}

/**
 * Nigerian mobile numbers: 11 digits starting 070/080/081/090/091 etc., or the
 * same number in +234 form. Spaces, dashes and brackets are ignored.
 */
export function nigerianPhone(value: string): string | null {
  const digits = value.replace(/[\s()-]/g, '')
  if (digits.length === 0) return 'Phone number is required'
  const local = /^0[789][01]\d{8}$/
  const international = /^(\+?234)[789][01]\d{8}$/
  if (local.test(digits) || international.test(digits)) return null
  return 'Enter a valid Nigerian number, e.g. 0801 234 5678'
}

/** Normalises any accepted phone format to E.164 without the plus. */
export function toE164(value: string): string {
  const digits = value.replace(/[\s()+-]/g, '')
  if (digits.startsWith('234')) return digits
  if (digits.startsWith('0')) return `234${digits.slice(1)}`
  return digits
}

export function futureDate(value: string, label: string): string | null {
  if (!value) return `${label} is required`
  const chosen = new Date(`${value}T00:00:00`)
  if (Number.isNaN(chosen.getTime())) return 'Choose a valid date'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (chosen < today) return 'Choose a date from today onwards'
  const limit = new Date(today)
  limit.setDate(limit.getDate() + 60)
  if (chosen > limit) return 'We only take bookings 60 days ahead'
  return null
}

/** True when every field passed. */
export function isClean<T>(errors: Errors<T>): boolean {
  return Object.values(errors).every((value) => !value)
}
