/** Business details for the Lagos operation. Single source of truth. */

export interface DeliveryZone {
  id: string
  name: string
  /** Delivery fee in kobo. */
  fee: number
  /** Rough delivery window, shown at checkout. */
  eta: string
}

export const site = {
  name: 'Feranmi Restaurant',
  tagline: "Lagos' favourite burger",
  /** E.164, no spaces — used to build wa.me links. */
  whatsapp: '2348000000000',
  phoneDisplay: '+234 800 000 0000',
  email: 'hello@feranmirestaurant.ng',
  address: {
    street: '12 Admiralty Way',
    area: 'Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
  },
  hours: [
    { days: 'Monday – Thursday', open: '11:00', close: '22:00' },
    { days: 'Friday – Saturday', open: '11:00', close: '23:30' },
    { days: 'Sunday', open: '12:00', close: '21:00' },
  ],
  /** West Africa Time — the restaurant's local timezone. */
  timeZone: 'Africa/Lagos',
  instagram: 'https://instagram.com',
} as const

export const addressLine = `${site.address.street}, ${site.address.area}, ${site.address.city}`

/** Fees in kobo (₦1 = 100 kobo) so all money maths stays in integers. */
export const deliveryZones: readonly DeliveryZone[] = [
  { id: 'lekki', name: 'Lekki Phase 1', fee: 100_000, eta: '20 – 35 min' },
  { id: 'vi', name: 'Victoria Island', fee: 150_000, eta: '25 – 40 min' },
  { id: 'ikoyi', name: 'Ikoyi', fee: 150_000, eta: '25 – 45 min' },
  { id: 'ajah', name: 'Ajah', fee: 200_000, eta: '35 – 55 min' },
  { id: 'yaba', name: 'Yaba', fee: 250_000, eta: '40 – 60 min' },
  { id: 'surulere', name: 'Surulere', fee: 250_000, eta: '45 – 70 min' },
  { id: 'ikeja', name: 'Ikeja', fee: 300_000, eta: '50 – 80 min' },
  { id: 'maryland', name: 'Maryland', fee: 300_000, eta: '50 – 80 min' },
]

/** Minimum order for delivery, in kobo. */
export const DELIVERY_MINIMUM = 500_000

export const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

/** Reservation slots, on the half hour. */
export const RESERVATION_SLOTS = [
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
] as const
