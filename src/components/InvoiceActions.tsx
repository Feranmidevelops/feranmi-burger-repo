import { useEffect, useState } from 'react'
import { buildInvoice, invoiceFilename } from '../lib/invoice'
import { orderMessage, whatsappLink, type OrderDetails } from '../lib/whatsapp'
import { site } from '../data/site'
import { Download, Share, WhatsApp } from './Icons'
import styles from './InvoiceActions.module.css'

type Status = 'idle' | 'building' | 'shared' | 'error'

/** Web Share level 2 — file sharing is mobile-only in practice. */
function canShareFiles(): boolean {
  if (typeof navigator === 'undefined' || !navigator.canShare || !navigator.share) return false
  try {
    const probe = new File([new Blob(['x'], { type: 'application/pdf' })], 'probe.pdf', {
      type: 'application/pdf',
    })
    return navigator.canShare({ files: [probe] })
  } catch {
    return false
  }
}

export function InvoiceActions({ order }: { order: OrderDetails }) {
  const [status, setStatus] = useState<Status>('idle')
  const [shareable, setShareable] = useState(false)

  // Feature-detect after mount so the button set matches the real device.
  useEffect(() => setShareable(canShareFiles()), [])

  async function withInvoice(run: (blob: Blob) => Promise<void> | void) {
    setStatus('building')
    try {
      const blob = await buildInvoice(order, new Date())
      await run(blob)
    } catch (error) {
      console.error('Invoice failed', error)
      setStatus('error')
    }
  }

  const download = () =>
    withInvoice((blob) => {
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = invoiceFilename(order)
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
      // Give the browser a beat to start the download before dropping the blob.
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
      setStatus('idle')
    })

  const share = () =>
    withInvoice(async (blob) => {
      const file = new File([blob], invoiceFilename(order), { type: 'application/pdf' })
      try {
        await navigator.share({
          files: [file],
          title: `${site.name} — order ${order.reference}`,
          text: `My order from ${site.name}, reference ${order.reference}.`,
        })
        setStatus('shared')
      } catch (error) {
        // A cancelled share sheet is not a failure.
        if (error instanceof DOMException && error.name === 'AbortError') setStatus('idle')
        else throw error
      }
    })

  return (
    <div className={styles.wrap}>
      <a
        className={styles.whatsapp}
        href={whatsappLink(orderMessage(order))}
        target="_blank"
        rel="noreferrer noopener"
      >
        <WhatsApp className={styles.icon} />
        Send order on WhatsApp
      </a>

      <div className={styles.row}>
        <button
          type="button"
          className={styles.secondary}
          onClick={download}
          disabled={status === 'building'}
        >
          <Download className={styles.icon} />
          {status === 'building' ? 'Preparing…' : 'Download invoice'}
        </button>

        {shareable && (
          <button
            type="button"
            className={styles.secondary}
            onClick={share}
            disabled={status === 'building'}
          >
            <Share className={styles.icon} />
            Share invoice
          </button>
        )}
      </div>

      <p className={styles.help} role="status">
        {status === 'error'
          ? 'Sorry — the invoice could not be generated. The WhatsApp message above still has your full order.'
          : status === 'shared'
            ? 'Invoice shared.'
            : shareable
              ? 'The WhatsApp message carries your full order. The PDF is your copy — “Share invoice” can send it into the chat too.'
              : 'The WhatsApp message carries your full order. Download the PDF if you want a copy to keep or attach.'}
      </p>
    </div>
  )
}
