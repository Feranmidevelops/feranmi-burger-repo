import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { DELIVERY_MINIMUM, deliveryZones, site, addressLine } from '../data/site'
import { formatNaira } from '../lib/money'
import { reference } from '../lib/id'
import { recordOrder } from '../cart/orders'
import { type OrderDetails } from '../lib/whatsapp'
import {
  isClean,
  minLength,
  nigerianPhone,
  required,
  type Errors,
} from '../lib/validation'
import { EmptyState, Field, PageHeader, Summary } from '../components/ui'
import { Check, Storefront, Truck } from '@phosphor-icons/react'
import { ICON } from '../components/Icons'
import { InvoiceActions } from '../components/InvoiceActions'
import { ClosedNotice } from '../components/OpeningHours'
import { useOpenState } from '../hooks/useOpenState'
import { Select } from '../components/Select'
import styles from './CheckoutPage.module.css'

interface Form {
  name: string
  phone: string
  fulfilment: 'delivery' | 'pickup'
  zoneId: string
  address: string
  notes: string
}

const initial: Form = {
  name: '',
  phone: '',
  fulfilment: 'delivery',
  zoneId: deliveryZones[0]?.id ?? '',
  address: '',
  notes: '',
}

function validate(form: Form, subtotal: number): Errors<Form> {
  const errors: Errors<Form> = {}
  const name = minLength(form.name, 2, 'Name')
  if (name) errors.name = name
  const phone = nigerianPhone(form.phone)
  if (phone) errors.phone = phone

  if (form.fulfilment === 'delivery') {
    const address = minLength(form.address, 8, 'Delivery address')
    if (address) errors.address = address
    const zone = required(form.zoneId, 'Delivery area')
    if (zone) errors.zoneId = zone
    if (subtotal < DELIVERY_MINIMUM) {
      errors.fulfilment = `Delivery orders start at ${formatNaira(
        DELIVERY_MINIMUM,
      )}. Switch to pickup, or add a little more.`
    }
  }
  return errors
}

export function CheckoutPage() {
  const { lines, count, subtotal, clear } = useCart()
  const [form, setForm] = useState<Form>(initial)
  const [errors, setErrors] = useState<Errors<Form>>({})
  const [submitted, setSubmitted] = useState(false)
  const trading = useOpenState()
  const [placed, setPlaced] = useState<OrderDetails | null>(null)

  const zone = useMemo(
    () => deliveryZones.find((entry) => entry.id === form.zoneId),
    [form.zoneId],
  )

  const deliveryFee = form.fulfilment === 'delivery' ? (zone?.fee ?? 0) : 0
  const total = subtotal + deliveryFee

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((current) => {
      const next = { ...current, [key]: value }
      // Re-validate live, but only once the customer has tried to submit.
      if (submitted) setErrors(validate(next, subtotal))
      return next
    })
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    const found = validate(form, subtotal)
    setErrors(found)
    if (!isClean(found)) {
      document.querySelector<HTMLElement>('[data-invalid="true"] :is(input, select)')?.focus()
      return
    }

    const order: OrderDetails = {
      reference: reference('FR'),
      name: form.name.trim(),
      phone: form.phone.trim(),
      fulfilment: form.fulfilment,
      lines,
      subtotal,
      deliveryFee,
      total,
      ...(form.fulfilment === 'delivery' && zone ? { zone, address: form.address.trim() } : {}),
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
    }

    // Recorded before the cart is emptied, so "order again" survives even if
    // the customer never actually sends the WhatsApp message.
    recordOrder(order, new Date())

    setPlaced(order)
    clear()
  }

  if (placed) {
    return (
      <>
        <PageHeader eyebrow="Order placed" title="That's with the kitchen" />
        <section className={styles.checkout}>
          <div className="container">
            <div className={styles.confirm}>
              <span className={styles.tick} aria-hidden="true">
                <Check className={styles.tickIcon} weight={ICON.strong} />
              </span>
              <h2 className={styles.confirmTitle}>Reference {placed.reference}</h2>
              <p>
                Send it through on WhatsApp and we'll confirm your{' '}
                {placed.fulfilment === 'delivery' ? 'delivery time' : 'pickup time'} straight away.
                {placed.fulfilment === 'delivery' && placed.zone
                  ? ` ${placed.zone.name} usually runs ${placed.zone.eta}.`
                  : ` Pickup at ${addressLine}.`}
              </p>

              <Summary
                rows={[
                  ['Items', formatNaira(placed.subtotal)],
                  [
                    placed.fulfilment === 'delivery'
                      ? `Delivery — ${placed.zone?.name ?? ''}`
                      : 'Pickup',
                    formatNaira(placed.deliveryFee),
                  ],
                ]}
                total={['Total', formatNaira(placed.total)]}
              />

              <InvoiceActions order={placed} />

              <p className={styles.small}>
                Or call us on <a href={`tel:+${site.whatsapp}`}>{site.phoneDisplay}</a>.
              </p>
              <Link className={styles.secondary} to="/menu">
                Order something else
              </Link>
            </div>
          </div>
        </section>
      </>
    )
  }

  if (count === 0) {
    return (
      <>
        <PageHeader eyebrow="Step 2 of 2" title="Checkout" />
        <section className={styles.checkout}>
          <div className="container">
            <EmptyState
              title="Your cart is empty"
              body="Add a dish or two and we'll get this to you."
              action={
                <Link className={styles.primary} to="/menu">
                  Browse the menu
                </Link>
              }
            />
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHeader eyebrow="Step 2 of 2" title="Checkout">
        <p>
          We take orders over WhatsApp — fill this in and we'll build the message for you. Nothing
          is charged here; you pay on delivery or at the counter.
        </p>
      </PageHeader>

      <section className={styles.checkout}>
        <div className="container">
          <div className={styles.layout}>
            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <ClosedNotice className={styles.closedNotice} />

              <fieldset className={styles.group}>
                <legend className={styles.legend}>How do you want it?</legend>
                <div className={styles.choices}>
                  {(['delivery', 'pickup'] as const).map((option) => (
                    <label key={option} className={styles.choice} data-active={form.fulfilment === option}>
                      <input
                        type="radio"
                        name="fulfilment"
                        value={option}
                        checked={form.fulfilment === option}
                        onChange={() => set('fulfilment', option)}
                      />
                      <span className={styles.choiceTitle}>
                        {option === 'delivery' ? (
                          <Truck weight={ICON.strong} aria-hidden />
                        ) : (
                          <Storefront weight={ICON.strong} aria-hidden />
                        )}
                        {option === 'delivery' ? 'Delivery' : 'Pickup'}
                      </span>
                      <span className={styles.choiceBody}>
                        {option === 'delivery'
                          ? 'Across Lagos Island and the mainland'
                          : `Collect from ${site.address.street}, ${site.address.area}`}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.fulfilment && (
                  <p className={styles.groupError} role="alert">
                    {errors.fulfilment}
                  </p>
                )}
              </fieldset>

              <div className={styles.grid2}>
                <Field id="name" label="Full name" error={errors.name}>
                  {(describedBy) => (
                    <input
                      id="name"
                      name="name"
                      autoComplete="name"
                      value={form.name}
                      aria-describedby={describedBy}
                      aria-invalid={Boolean(errors.name)}
                      onChange={(event) => set('name', event.target.value)}
                    />
                  )}
                </Field>

                <Field
                  id="phone"
                  label="Phone number"
                  hint="We'll only use it for this order."
                  error={errors.phone}
                >
                  {(describedBy) => (
                    <input
                      id="phone"
                      name="phone"
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

              {form.fulfilment === 'delivery' && (
                <>
                  <Field id="zone" label="Delivery area" error={errors.zoneId}>
                    {(describedBy) => (
                      <Select
                        id="zone"
                        value={form.zoneId}
                        describedBy={describedBy}
                        invalid={Boolean(errors.zoneId)}
                        options={deliveryZones.map((entry) => ({
                          value: entry.id,
                          label: entry.name,
                          meta: `${formatNaira(entry.fee)} · ${entry.eta}`,
                        }))}
                        onChange={(next) => set('zoneId', next)}
                      />
                    )}
                  </Field>

                  <Field
                    id="address"
                    label="Delivery address"
                    hint="Street, building and any landmark that helps the rider."
                    error={errors.address}
                  >
                    {(describedBy) => (
                      <textarea
                        id="address"
                        name="address"
                        autoComplete="street-address"
                        value={form.address}
                        aria-describedby={describedBy}
                        aria-invalid={Boolean(errors.address)}
                        onChange={(event) => set('address', event.target.value)}
                      />
                    )}
                  </Field>
                </>
              )}

              <Field id="notes" label="Anything else?" hint="Optional.">
                {(describedBy) => (
                  <textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    aria-describedby={describedBy}
                    onChange={(event) => set('notes', event.target.value)}
                  />
                )}
              </Field>

              <button type="submit" className={styles.primary}>
                {trading.open ? 'Place order' : 'Send as a pre-order'}
              </button>
            </form>

            <aside className={styles.aside}>
              <h2 className={styles.asideTitle}>Your order</h2>
              <ul className={styles.mini}>
                {lines.map((line) => (
                  <li key={line.id}>
                    <span>
                      {line.quantity}× {line.item.name}
                    </span>
                    <span>{formatNaira(line.lineTotal)}</span>
                  </li>
                ))}
              </ul>

              <Summary
                rows={[
                  ['Subtotal', formatNaira(subtotal)],
                  [
                    form.fulfilment === 'delivery'
                      ? `Delivery — ${zone?.name ?? ''}`
                      : 'Pickup',
                    formatNaira(deliveryFee),
                  ],
                ]}
                total={['Total', formatNaira(total)]}
              />

              {form.fulfilment === 'delivery' && zone && (
                <p className={styles.asideNote}>Riders usually take {zone.eta} to {zone.name}.</p>
              )}

              <Link className={styles.secondary} to="/cart">
                Back to cart
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
