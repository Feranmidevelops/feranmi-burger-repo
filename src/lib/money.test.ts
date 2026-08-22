import { describe, expect, it } from 'vitest'
import { formatNaira, formatNairaPlain } from './money'

/**
 * The reason money is stored in kobo at all: a bill built from floats drifts.
 * These tests pin the boundary where integers become text.
 */
describe('formatNaira', () => {
  it('renders kobo as whole naira with the currency sign', () => {
    expect(formatNaira(650_000)).toBe('₦6,500')
  })

  it('groups thousands', () => {
    expect(formatNaira(1_250_000)).toBe('₦12,500')
    expect(formatNaira(100_000_000)).toBe('₦1,000,000')
  })

  it('shows no decimals — nobody prices a burger in kobo', () => {
    expect(formatNaira(650_050)).not.toContain('.')
  })

  it('handles zero, which is what a pickup delivery fee is', () => {
    expect(formatNaira(0)).toBe('₦0')
  })

  it('sums exactly across a realistic basket', () => {
    const basket = [650_000, 950_000, 250_000, 180_000]
    const total = basket.reduce((sum, price) => sum + price, 0)
    expect(total).toBe(2_030_000)
    expect(formatNaira(total)).toBe('₦20,300')
  })
})

describe('formatNairaPlain', () => {
  /*
   * The PDF and the WhatsApp message both go through this. jsPDF's built-in
   * fonts are WinAnsi-encoded and have no ₦ glyph, so a naira sign there comes
   * out as a broken box.
   */
  it('uses the NGN code rather than the naira sign', () => {
    expect(formatNairaPlain(650_000)).toBe('NGN 6,500')
    expect(formatNairaPlain(650_000)).not.toContain('₦')
  })

  it('groups thousands the same way as the on-screen format', () => {
    expect(formatNairaPlain(1_250_000)).toBe('NGN 12,500')
  })

  it('handles zero', () => {
    expect(formatNairaPlain(0)).toBe('NGN 0')
  })
})
