/**
 * All copy + asset references, transcribed verbatim from the Figma file
 * "Burger_Landing" (frames: `Burger Landing`, `Burger Landing Mobile`).
 * Typos in the source design ("Life is to short", "toped with ragu") are kept
 * intentionally so the build matches the approved design.
 */

export interface NavLink {
  label: string
  href: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  image: string
  alt: string
  isNew?: boolean
}

export interface Review {
  id: string
  author: string
  body: string
  avatar: string
}

export interface InstagramTile {
  id: string
  image: string
  alt: string
}

export const navLinks: readonly NavLink[] = [
  { label: 'Menu', href: '/menu' },
  { label: 'Reserve', href: '/reservations' },
  { label: 'About', href: '/#about' },
  { label: 'Social', href: '/#social' },
]

export const hero = {
  headingLines: ['Lagos’', 'Favourite', 'Burger'],
  body: 'Smashed patties, yaji on everything, and dodo where it belongs. Cooked on Admiralty Way since 1985, delivered across the island in under an hour.',
  cta: 'Browse menu',
  image: '/img/burger-hero.jpg',
  imageAlt: 'A stacked burger with melted cheese on a pink background',
} as const

export const about = {
  heading:
    'Hi, We’re Feranmi Restaurant, a Lagos kitchen that takes burgers far too seriously.',
  portrait: '/img/founder-portrait.jpg',
  portraitAlt: 'Feranmi, the founder, standing behind the counter of the original shop',
  caption: 'This is Feranmi. It all started on Admiralty Way, 40 years ago.',
  featureImage: '/img/food-for-everyone.jpg',
  featureImageAlt: 'A burger being held in both hands',
  featureHeadingLines: ['Food is for', 'everyone.'],
  featureBody:
    'We grind beef every morning, bake the buns on site, and roast the tatashe for our obe ata glaze in-house. Nothing arrives frozen and nothing sits under a heat lamp. If it is on the menu, someone cooked it after you ordered it.',
} as const

export const different = {
  heading: 'we’re different',
  image: '/img/were-different.jpg',
  imageAlt: 'Close-up of a burger being assembled',
  href: '#menu',
} as const

export const menuSection = {
  heading: 'our burgers',
  body: 'Ten things, done properly. Beef ground this morning, chicken brined overnight, and a Chapman built the way Lagos actually drinks it.',
  items: [
    {
      id: 'shrimp-yo',
      name: 'Shrimp Yo!',
      description: 'Grilled shrimp burger with coleslaw in a homemade fluffy bun',
      image: '/img/burger-hero.jpg',
      alt: 'Shrimp Yo! burger',
      isNew: true,
    },
    {
      id: 'double-trouble',
      name: 'Double Trouble',
      description: 'Angus Beef burger with Gouda cheese and bacon in a sesame bun.',
      image: '/img/double-trouble.jpg',
      alt: 'Double Trouble burger',
    },
    {
      id: 'juicy-feranmi',
      name: 'Juicy Feranmi',
      description: 'Beef Burger with fried onion toped with ragu sauce in a rye bun.',
      image: '/img/juicy-feranmi.jpg',
      alt: 'Juicy Feranmi burger',
    },
    {
      id: 'crispy-chi',
      name: 'Crispy Chi',
      description: 'Beef Burger with fried onion toped with ragu sauce in a rye bun.',
      image: '/img/crispy-chi.jpg',
      alt: 'Crispy Chi burger',
    },
  ] satisfies MenuItem[],
} as const

export const marqueeText = 'Life is to short to eat just salads'

/** Ordered as the three masonry columns of the 1440 desktop frame. */
const reviewColumns: Review[][] = [
  [
    {
      id: 'uideli',
      author: 'Tolu A.',
      body: 'Ordered on WhatsApp at 8pm on a Friday, food was at my door in Lekki Phase 1 in twenty-five minutes. Still hot. Still crispy.',
      avatar: '/img/avatar-uideli.jpg',
    },
    {
      id: 'jessica-1',
      author: 'Chidera from EatLagos',
      body: 'The Suya Smash is the best thing to happen to a burger in this city.',
      avatar: '/img/avatar-jessica.jpg',
    },
    {
      id: 'welovefood-1',
      author: 'we love food ng',
      body: 'Just in love with these burgers!',
      avatar: '/img/avatar-welovefood.jpg',
    },
  ],
  [
    {
      id: 'andreea',
      author: 'Amaka @eattwice',
      body: 'I came for the Dodo Stack and stayed for the Yaji Fries, which I did not order and somehow finished anyway. The plantain is properly ripe, not that half-green thing everywhere else does. Four visits in three weeks.',
      avatar: '/img/avatar-andreea.jpg',
    },
    {
      id: 'maria',
      author: 'just maria',
      body: 'Booked a table for six for my sister’s birthday. They had the Chapmans poured before we sat down.',
      avatar: '/img/avatar-maria.jpg',
    },
    {
      id: 'jessica-2',
      author: 'Ifeanyi O.',
      body: 'Obe Ata Chicken is genuinely spicy. Respect.',
      avatar: '/img/avatar-jessica.jpg',
    },
  ],
  [
    {
      id: 'mathew',
      author: 'Seyi eats all',
      body: 'I have eaten my way through most of the burger places between VI and Ikeja, and I keep coming back to this one. It is the bun. They bake it here and you can tell.\n\nJust the best in town. Try it!',
      avatar: '/img/avatar-mathew.jpg',
    },
    {
      id: 'welovefood-2',
      author: 'Bukky @lagosplates',
      body: 'Pickup order was ready exactly when they said. Rare.',
      avatar: '/img/avatar-welovefood.jpg',
    },
    {
      id: 'uideli-2',
      author: 'Emeka N.',
      body: 'Took a client here to close a deal. The Double Trouble closed it for me.',
      avatar: '/img/avatar-uideli.jpg',
    },
  ],
]

export const reviewsSection = {
  heading: 'some reviews',
  body: 'What people say after the first bite, and again after the third order.',
  columns: reviewColumns,
  loadMore: 'Load more',
} as const

export const instagram = {
  headingLines: ['Follow us', 'on', 'instagram'],
  href: 'https://instagram.com',
  tiles: [
    { id: 'ig-1', image: '/img/food-for-everyone.jpg', alt: 'A burger held in two hands' },
    { id: 'ig-2', image: '/img/insta-2.jpg', alt: 'Burger on a pink backdrop' },
    { id: 'ig-3', image: '/img/insta-3.jpg', alt: 'Burger with lettuce and tomato' },
    { id: 'ig-4', image: '/img/insta-4.jpg', alt: 'Burger and fries flat lay' },
  ] satisfies InstagramTile[],
} as const

export const footer = {
  heading: 'Subscribe to our newsletter',
  body: 'By subscribing to our newsletter, you will receive the latest tips, and promotions about our products and services straight to your inbox.',
  emailPlaceholder: 'Enter your email',
  submit: 'Subscribe',
  legal: [
    { label: 'PRIVACY', href: '#privacy' },
    { label: 'TERMS', href: '#terms' },
    { label: 'ACCESSIBILITY', href: '#accessibility' },
  ] satisfies NavLink[],
} as const

export const socialLinks = [
  { name: 'instagram', href: 'https://instagram.com' },
  { name: 'facebook', href: 'https://facebook.com' },
  { name: 'tiktok', href: 'https://tiktok.com' },
  { name: 'youtube', href: 'https://youtube.com' },
  { name: 'x', href: 'https://x.com' },
] as const

export type SocialName = (typeof socialLinks)[number]['name']
