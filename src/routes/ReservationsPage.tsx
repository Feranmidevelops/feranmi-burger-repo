import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { addressLine, PARTY_SIZES, RESERVATION_SLOTS, site } from '../data/site'
import { reference } from '../lib/id'
import {
  reservationMessage,
  whatsappLink,
  type ReservationDetails,
} from '../lib/whatsapp'
import { futureDate, isClean, minLength, nigerianPhone, type Errors } from '../lib/validation'
import { Field, PageHeader } from '../components/ui'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Check, Pin, WhatsApp } from '../components/Icons'
import { asset } from '../lib/asset'
import styles from './ReservationsPage.module.css'

interface Form {
  name: string
  phone: string
  date: string
  time: string
  partySize: string
  occasion: string
  notes: string
}

function today(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

const initial: Form = {
  name: '',
  phone: '',
  date: today(),
  time: RESERVATION_SLOTS[5] ?? '18:00',
  partySize: '2',
  occasion: '',
  notes: '',
}

function validate(form: Form): Errors<Form> {
  const errors: Errors<Form> = {}
  const name = minLength(form.name, 2, 'Name')
  if (name) errors.name = name
  const phone = nigerianPhone(form.phone)
  if (phone) errors.phone = phone
  const date = futureDate(form.date, 'Date')
  if (date) errors.date = date
  if (!RESERVATION_SLOTS.includes(form.time as (typeof RESERVATION_SLOTS)[number])) {
    errors.time = 'Choose one of our seating times'
  }
  return errors
}

/** Formats an ISO date as "Friday, 21 August 2026" for the WhatsApp message. */
function readableDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function ReservationsPage() {
  useDocumentTitle('Book a table')
  const [form, setForm] = useState<Form>(initial)
  const [errors, setErrors] = useState<Errors<Form>>({})
  const [submitted, setSubmitted] = useState(false)
  const [booking, setBooking] = useState<ReservationDetails | null>(null)

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (submitted) setErrors(validate(next))
      return next
    })
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    const found = validate(form)
    setErrors(found)
    if (!isClean(found)) {
      document.querySelector<HTMLElement>('[data-invalid="true"] :is(input, select)')?.focus()
      return
    }

    setBooking({
      reference: reference('FR-T'),
      name: form.name.trim(),
      phone: form.phone.trim(),
      date: readableDate(form.date),
      time: form.time,
      partySize: Number(form.partySize),
      ...(form.occasion.trim() ? { occasion: form.occasion.trim() } : {}),
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
    })
  }

  return (
    <>
      <PageHeader eyebrow="Lekki Phase 1 · Lagos" title="Book a table">
        <p>
          Forty covers, one room, and a grill you can hear from the door. Tell us when you're
          coming and we'll hold a table — we confirm every booking on WhatsApp.
        </p>
      </PageHeader>

      <section className={styles.page}>
        <div className={`container ${styles.layout}`}>
          {booking ? (
            <div className={styles.confirm}>
              <span className={styles.tick} aria-hidden="true">
                <Check className={styles.tickIcon} />
              </span>
              <h2 className={styles.confirmTitle}>Table held — {booking.reference}</h2>
              <p>
                {booking.partySize} {booking.partySize === 1 ? 'guest' : 'guests'} on{' '}
                <strong>{booking.date}</strong> at <strong>{booking.time}</strong>.
              </p>
              <p className={styles.small}>
                Send it over on WhatsApp so we can lock it in. Tables are held for 15 minutes past
                the booking time.
              </p>
              <a
                className={styles.whatsapp}
                href={whatsappLink(reservationMessage(booking))}
                target="_blank"
                rel="noreferrer noopener"
              >
                <WhatsApp className={styles.whatsappIcon} />
                Confirm on WhatsApp
              </a>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => {
                  setBooking(null)
                  setSubmitted(false)
                  setForm(initial)
                }}
              >
                Book another table
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <div className={styles.grid2}>
                <Field id="res-name" label="Full name" error={errors.name}>
                  {(describedBy) => (
                    <input
                      id="res-name"
                      autoComplete="name"
                      value={form.name}
                      aria-describedby={describedBy}
                      aria-invalid={Boolean(errors.name)}
                      onChange={(event) => set('name', event.target.value)}
                    />
                  )}
                </Field>

                <Field id="res-phone" label="Phone number" error={errors.phone}>
                  {(describedBy) => (
                    <input
                      id="res-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="0801 234 5678"
                      value={form.phone}
                      aria-describedby={describedBy}
                      aria-invalid={Boolean(errors.phone)}
                      onChange={(event) => set('phone', event.target.value)}
                    />
                  )}
                </Field>
              </div>

              <div className={styles.grid3}>
                <Field id="res-date" label="Date" error={errors.date}>
                  {(describedBy) => (
                    <input
                      id="res-date"
                      type="date"
                      min={today()}
                      value={form.date}
                      aria-describedby={describedBy}
                      aria-invalid={Boolean(errors.date)}
                      onChange={(event) => set('date', event.target.value)}
                    />
                  )}
                </Field>

                <Field id="res-time" label="Time" error={errors.time}>
                  {(describedBy) => (
                    <select
                      id="res-time"
                      value={form.time}
                      aria-describedby={describedBy}
                      onChange={(event) => set('time', event.target.value)}
                    >
                      {RESERVATION_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>

                <Field id="res-party" label="Guests">
                  {(describedBy) => (
                    <select
                      id="res-party"
                      value={form.partySize}
                      aria-describedby={describedBy}
                      onChange={(event) => set('partySize', event.target.value)}
                    >
                      {PARTY_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>

              <Field
                id="res-occasion"
                label="Occasion"
                hint="Optional — birthdays get a puff-puff on us."
              >
                {(describedBy) => (
                  <input
                    id="res-occasion"
                    value={form.occasion}
                    aria-describedby={describedBy}
                    onChange={(event) => set('occasion', event.target.value)}
                  />
                )}
              </Field>

              <Field id="res-notes" label="Anything we should know?" hint="Optional.">
                {(describedBy) => (
                  <textarea
                    id="res-notes"
                    value={form.notes}
                    aria-describedby={describedBy}
                    onChange={(event) => set('notes', event.target.value)}
                  />
                )}
              </Field>

              <button type="submit" className={styles.primary}>
                Request table
              </button>
            </form>
          )}

          <aside className={styles.aside}>
            <img
              className={styles.image}
              src={asset('/img/kitchen-staff.jpg')}
              alt="The kitchen team plating orders on the pass"
              width={342}
              height={512}
              loading="lazy"
            />
            <div className={styles.asideBody}>
              <h2 className={styles.asideTitle}>
                <Pin className={styles.pin} />
                Find us
              </h2>
              <address className={styles.address}>{addressLine}</address>
              <p className={styles.small}>
                <a href={`tel:+${site.whatsapp}`}>{site.phoneDisplay}</a>
              </p>

              <h3 className={styles.hoursTitle}>Opening hours</h3>
              <dl className={styles.hours}>
                {site.hours.map((entry) => (
                  <div key={entry.days}>
                    <dt>{entry.days}</dt>
                    <dd>
                      {entry.open} – {entry.close}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className={styles.small}>All times West Africa Time (WAT).</p>

              <Link className={styles.secondary} to="/menu">
                See the menu first
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
