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
  { label: 'About', href: '#about' },
  { label: 'Menu', href: '#menu' },
  { label: 'reviews', href: '#reviews' },
  { label: 'Social', href: '#social' },
]

export const hero = {
  headingLines: ['New York’s', 'Favorite', 'Burger'],
  body: 'In a world so painfully serious, yet so ridiculous, you knew it was only a matter of time before plant-based steak became a thing.',
  cta: 'Browse menu',
  image: '/img/burger-hero.jpg',
  imageAlt: 'A stacked burger with melted cheese on a pink background',
} as const

export const about = {
  heading:
    'Hi, We’re Feranmi Restaurant, a collective of creators who Love burger and good mood.',
  portrait: '/img/founder-portrait.jpg',
  portraitAlt: 'Feranmi, the founder, standing behind the counter of the original shop',
  caption: 'This is Feranmi. It all started 40 years ago.',
  featureImage: '/img/food-for-everyone.jpg',
  featureImageAlt: 'A burger being held in both hands',
  featureHeadingLines: ['Food is for', 'everyone.'],
  featureBody:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
} as const

export const different = {
  heading: 'we’re different',
  image: '/img/were-different.jpg',
  imageAlt: 'Close-up of a burger being assembled',
  href: '#menu',
} as const

export const menuSection = {
  heading: 'our burgers',
  body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
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
      id: 'uideli-1',
      author: 'UIDELI.COM',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      avatar: '/img/avatar-uideli.jpg',
    },
    {
      id: 'jessica-1',
      author: 'Jessica from Eater.com',
      body: 'Accusantium doloremque laudantium, totam rem aperiam.',
      avatar: '/img/avatar-jessica.jpg',
    },
    {
      id: 'welovefood-1',
      author: 'we love food',
      body: 'Just in love with these burgers!',
      avatar: '/img/avatar-welovefood.jpg',
    },
  ],
  [
    {
      id: 'andreea',
      author: 'Andreea @eattwice',
      body: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      avatar: '/img/avatar-andreea.jpg',
    },
    {
      id: 'maria',
      author: 'just maria',
      body: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      avatar: '/img/avatar-maria.jpg',
    },
    {
      id: 'jessica-2',
      author: 'Jessica from Eater.com',
      body: 'Accusantium doloremque laudantium, totam rem aperiam.',
      avatar: '/img/avatar-jessica.jpg',
    },
  ],
  [
    {
      id: 'mathew',
      author: 'Mathew eats all',
      body: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.\n\nJust the best in town. Try it!',
      avatar: '/img/avatar-mathew.jpg',
    },
    {
      id: 'welovefood-2',
      author: 'we love food',
      body: 'Just in love with these burgers!',
      avatar: '/img/avatar-welovefood.jpg',
    },
    {
      id: 'uideli-2',
      author: 'UIDELI.COM',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      avatar: '/img/avatar-uideli.jpg',
    },
  ],
]

export const reviewsSection = {
  heading: 'some reviews',
  body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
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
