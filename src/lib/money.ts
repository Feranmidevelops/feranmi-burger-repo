/**
 * All money is handled in kobo (integers) and only formatted at the edge, so
 * totals never accumulate floating-point error.
 */

const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

/** Formats an amount in kobo as Naira, e.g. 650_000 -> "₦6,500". */
export function formatNaira(kobo: number): string {
  return naira.format(Math.round(kobo) / 100)
}

/** Plain-text form for the WhatsApp message, where ₦ can render inconsistently. */
export function formatNairaPlain(kobo: number): string {
  return `NGN ${(Math.round(kobo) / 100).toLocaleString('en-NG')}`
}
