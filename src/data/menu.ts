/**
 * The menu. Prices are in kobo (₦1 = 100 kobo) so every total is integer maths —
 * no floating-point drift on a bill.
 */

export type Category = 'burgers' | 'chicken' | 'sides' | 'drinks'

export type DietaryTag = 'vegetarian' | 'spicy' | 'contains-nuts' | 'seafood'

export type Badge = 'signature' | 'popular' | 'new'

export interface MenuItem {
  id: string
  name: string
  /** One-line description, used on cards. */
  description: string
  /** Longer copy for the item detail panel. */
  detail: string
  price: number
  category: Category
  image: string
  alt: string
  badge?: Badge
  dietary?: DietaryTag[]
  /** Typical kitchen time, shown on the card. */
  prepMinutes: number
}

export const categories: readonly { id: Category; label: string }[] = [
  { id: 'burgers', label: 'Burgers' },
  { id: 'chicken', label: 'Chicken' },
  { id: 'sides', label: 'Sides' },
  { id: 'drinks', label: 'Drinks' },
]

export const menu: readonly MenuItem[] = [
  {
    id: 'juicy-feranmi',
    name: 'Juicy Feranmi',
    description: 'Beef burger with fried onion topped with ragu sauce in a rye bun.',
    detail:
      'The one the whole place is named after. A 180g beef patty, slow-fried onions and a ragu that has been simmering since the morning shift, all in a toasted rye bun.',
    price: 650_000,
    category: 'burgers',
    image: '/img/juicy-feranmi.jpg',
    alt: 'Juicy Feranmi beef burger in a rye bun',
    badge: 'signature',
    prepMinutes: 12,
  },
  {
    id: 'double-trouble',
    name: 'Double Trouble',
    description: 'Angus beef burger with Gouda cheese and bacon in a sesame bun.',
    detail:
      'Two Angus patties, two slices of aged Gouda, and bacon cooked until it snaps. Order it if you are skipping the next meal.',
    price: 950_000,
    category: 'burgers',
    image: '/img/double-trouble.jpg',
    alt: 'Double beef burger with melted Gouda and bacon',
    prepMinutes: 14,
  },
  {
    id: 'suya-smash',
    name: 'Suya Smash',
    description: 'Smashed beef patty, yaji spice, crispy onion strings and suya mayo.',
    detail:
      'Smashed thin on the flat top so the edges go lacy and crisp, then dusted with yaji straight off the mai suya grill. Crispy onion strings and a suya mayo that earns its name.',
    price: 750_000,
    category: 'burgers',
    image: '/img/dark-burger.jpg',
    alt: 'Smashed beef burger topped with crispy onion strings',
    badge: 'popular',
    dietary: ['spicy', 'contains-nuts'],
    prepMinutes: 11,
  },
  {
    id: 'shrimp-yo',
    name: 'Shrimp Yo!',
    description: 'Grilled shrimp burger with coleslaw in a homemade fluffy bun.',
    detail:
      'Lagos shrimp, grilled hard and fast, piled into a milk bun we bake in-house every morning. The coleslaw is sharp on purpose.',
    price: 850_000,
    category: 'burgers',
    image: '/img/burger-hero.jpg',
    alt: 'Grilled shrimp burger with coleslaw',
    badge: 'new',
    dietary: ['seafood'],
    prepMinutes: 13,
  },
  {
    id: 'dodo-stack',
    name: 'Dodo Stack',
    description: 'Beef patty layered with sweet fried plantain and pepper relish.',
    detail:
      'Dodo and beef, the way you already eat them, just stacked. Ripe plantain fried till the edges caramelise, a pepper relish with real heat, and a patty to hold it together.',
    price: 800_000,
    category: 'burgers',
    image: '/img/burger-box.jpg',
    alt: 'Beef and plantain burger in a takeaway box',
    dietary: ['spicy'],
    prepMinutes: 12,
  },
  {
    id: 'crispy-chi',
    name: 'Crispy Chi',
    description: 'Buttermilk chicken thigh, pickles and garlic mayo in a brioche bun.',
    detail:
      'Thigh, never breast. Brined in buttermilk overnight, dredged twice, and fried to order so the crust is still loud when it reaches you.',
    price: 700_000,
    category: 'chicken',
    image: '/img/crispy-chi.jpg',
    alt: 'Crispy buttermilk chicken sandwich',
    prepMinutes: 14,
  },
  {
    id: 'obe-ata-chicken',
    name: 'Obe Ata Chicken',
    description: 'Fried chicken glazed in obe ata, with cooling avocado and slaw.',
    detail:
      'The same fried thigh, dragged through an obe ata glaze built on roasted tatashe and rodo. Avocado and slaw are there to put the fire out. They only mostly succeed.',
    price: 720_000,
    category: 'chicken',
    image: '/img/chicken-sandwich.jpg',
    alt: 'Fried chicken sandwich glazed in pepper sauce',
    dietary: ['spicy'],
    prepMinutes: 15,
  },
  {
    id: 'yaji-fries',
    name: 'Yaji Fries',
    description: 'Thick-cut fries tossed in yaji spice with garlic aioli on the side.',
    detail:
      'Twice-fried, thick cut, tossed in yaji while still too hot to touch. The garlic aioli is not optional, whatever you tell yourself.',
    price: 250_000,
    category: 'sides',
    image: '/img/burger-fries.jpg',
    alt: 'Thick-cut fries dusted with suya spice',
    dietary: ['vegetarian', 'spicy', 'contains-nuts'],
    prepMinutes: 8,
  },
  {
    id: 'puff-puff-sliders',
    name: 'Puff-Puff Sliders',
    description: 'Three sweet puff-puff buns with whipped honey butter.',
    detail:
      'Somewhere between a side and a dessert, and nobody at this restaurant is interested in settling the argument. Three warm puff-puff, split and filled with whipped honey butter.',
    price: 350_000,
    category: 'sides',
    image: '/img/buns-yellow.jpg',
    alt: 'Sweet puff-puff buns on a yellow background',
    dietary: ['vegetarian'],
    prepMinutes: 9,
  },
  {
    id: 'chapman',
    name: 'Chapman',
    description: 'The Lagos classic — bitters, citrus, cucumber, plenty of ice.',
    detail:
      'Made the proper way: Fanta and Sprite, a serious pour of bitters, blackcurrant, and a cucumber ribbon. Served in a glass that fogs on contact.',
    price: 200_000,
    category: 'drinks',
    image: '/img/chapman.jpg',
    alt: 'A cold Chapman served with a burger',
    dietary: ['vegetarian'],
    prepMinutes: 4,
  },
]

export const menuById = new Map(menu.map((item) => [item.id, item]))

export const dietaryLabels: Record<DietaryTag, string> = {
  vegetarian: 'Vegetarian',
  spicy: 'Spicy',
  'contains-nuts': 'Contains nuts',
  seafood: 'Seafood',
}

export const badgeLabels: Record<Badge, string> = {
  signature: 'Signature',
  popular: 'Popular',
  new: 'New',
}
