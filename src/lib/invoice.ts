import { addressLine, site } from '../data/site'
import { formatNairaPlain } from './money'
import type { OrderDetails } from './whatsapp'

/**
 * Currency is written as "NGN 6,500" rather than "₦6,500" throughout the PDF.
 * jsPDF's built-in fonts use WinAnsi encoding, which has no naira sign — using
 * ₦ would render as a broken glyph.
 */

const PAGE = { width: 210, height: 297 } // A4 in mm
const MARGIN = 16
const INK = [0, 0, 0] as const
const ORANGE = [238, 74, 30] as const
const MUTED = [110, 110, 110] as const

export function invoiceFilename(order: OrderDetails): string {
  return `feranmi-invoice-${order.reference}.pdf`
}

/**
 * Renders the order as a one-page A4 invoice.
 *
 * jsPDF is ~110 kB gzipped, so it is imported dynamically — it only reaches the
 * browser when someone actually asks for an invoice.
 */
export async function buildInvoice(order: OrderDetails, issuedAt: Date): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const right = PAGE.width - MARGIN
  const contentWidth = right - MARGIN
  let y = MARGIN

  const setColour = (colour: readonly [number, number, number]) =>
    doc.setTextColor(colour[0], colour[1], colour[2])

  // ---- Masthead -----------------------------------------------------------
  doc.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2])
  doc.rect(0, 0, PAGE.width, 34, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  setColour(INK)
  doc.text(site.name.toUpperCase(), MARGIN, 15)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(addressLine, MARGIN, 21)
  doc.text(`${site.phoneDisplay}  ·  ${site.email}`, MARGIN, 26)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('INVOICE', right, 15, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(order.reference, right, 21, { align: 'right' })
  doc.text(
    issuedAt.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }),
    right,
    26,
    { align: 'right' },
  )

  y = 48

  // ---- Parties ------------------------------------------------------------
  const label = (text: string, x: number, at: number) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    setColour(MUTED)
    doc.text(text.toUpperCase(), x, at)
  }

  label('Billed to', MARGIN, y)
  label(order.fulfilment === 'delivery' ? 'Deliver to' : 'Collection', PAGE.width / 2, y)
  y += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  setColour(INK)
  doc.text(order.name, MARGIN, y)
  doc.text(order.phone, MARGIN, y + 5)

  const destination =
    order.fulfilment === 'delivery'
      ? `${order.address ?? ''}\n${order.zone?.name ?? ''}, Lagos`
      : `${site.address.street}\n${site.address.area}, ${site.address.city}`
  doc.text(doc.splitTextToSize(destination, contentWidth / 2 - 4), PAGE.width / 2, y)

  y += 22

  // ---- Line items ---------------------------------------------------------
  const cols = { item: MARGIN, qty: 118, unit: 140, amount: right }

  doc.setDrawColor(INK[0], INK[1], INK[2])
  doc.setLineWidth(0.4)
  doc.line(MARGIN, y, right, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  setColour(MUTED)
  doc.text('ITEM', cols.item, y)
  doc.text('QTY', cols.qty, y, { align: 'right' })
  doc.text('UNIT', cols.unit, y, { align: 'right' })
  doc.text('AMOUNT', cols.amount, y, { align: 'right' })
  y += 3
  doc.setLineWidth(0.2)
  doc.line(MARGIN, y, right, y)
  y += 6

  doc.setFontSize(10)
  setColour(INK)

  for (const line of order.lines) {
    doc.setFont('helvetica', 'bold')
    doc.text(line.item.name, cols.item, y)
    doc.setFont('helvetica', 'normal')
    doc.text(String(line.quantity), cols.qty, y, { align: 'right' })
    doc.text(formatNairaPlain(line.item.price), cols.unit, y, { align: 'right' })
    doc.text(formatNairaPlain(line.lineTotal), cols.amount, y, { align: 'right' })
    y += 5

    if (line.note) {
      doc.setFontSize(8)
      setColour(MUTED)
      const note = doc.splitTextToSize(`Note: ${line.note}`, 95)
      doc.text(note, cols.item, y)
      y += note.length * 3.6
      doc.setFontSize(10)
      setColour(INK)
    }
    y += 2
  }

  y += 2
  doc.setLineWidth(0.2)
  doc.line(MARGIN, y, right, y)
  y += 7

  // ---- Totals -------------------------------------------------------------
  const totalRow = (name: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(bold ? 12 : 10)
    doc.text(name, cols.unit, y, { align: 'right' })
    doc.text(value, cols.amount, y, { align: 'right' })
    y += bold ? 8 : 6
  }

  totalRow('Subtotal', formatNairaPlain(order.subtotal))
  totalRow(
    order.fulfilment === 'delivery' ? `Delivery — ${order.zone?.name ?? ''}` : 'Pickup',
    formatNairaPlain(order.deliveryFee),
  )

  doc.setLineWidth(0.4)
  doc.line(cols.unit - 46, y - 3, right, y - 3)
  y += 2
  totalRow('Total due', formatNairaPlain(order.total), true)

  // ---- Order notes --------------------------------------------------------
  if (order.notes) {
    y += 4
    label('Order notes', MARGIN, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    setColour(INK)
    const notes = doc.splitTextToSize(order.notes, contentWidth)
    doc.text(notes, MARGIN, y)
    y += notes.length * 4
  }

  // ---- Footer -------------------------------------------------------------
  const footerY = PAGE.height - 26
  doc.setDrawColor(MUTED[0], MUTED[1], MUTED[2])
  doc.setLineWidth(0.2)
  doc.line(MARGIN, footerY, right, footerY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  setColour(INK)
  doc.text(
    order.fulfilment === 'delivery' ? 'Payment on delivery.' : 'Payment on collection.',
    MARGIN,
    footerY + 6,
  )

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setColour(MUTED)
  doc.text(
    `Send this invoice or the reference ${order.reference} to ${site.phoneDisplay} on WhatsApp to confirm your order.`,
    MARGIN,
    footerY + 11,
  )
  doc.text('This is an order confirmation, not a tax invoice.', MARGIN, footerY + 16)

  return doc.output('blob')
}
