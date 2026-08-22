/**
 * Generates the favicon set and the Open Graph card into `public/`.
 *
 * Run this only when the brand changes — the output is committed, so a normal
 * build and CI never need it. `sharp` is therefore not a dependency of the
 * project; install it on demand:
 *
 *   npx --yes --package sharp node scripts/make-icons.mjs
 *
 * The single source of truth for the mark is FMARK below, shared by every size
 * so the icons cannot drift from `public/favicon.svg`.
 */

import { writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const require = createRequire(import.meta.url)

let sharp
try {
  sharp = require('sharp')
} catch {
  console.error(
    'sharp is not installed. Run:\n  npx --yes --package sharp node scripts/make-icons.mjs',
  )
  process.exit(1)
}

const OUT = 'public'
const ORANGE = '#ee4a1e'
const INK = '#000000'

/** The blocky "F", drawn in a 64-unit box. Matches public/favicon.svg exactly. */
const FMARK = 'M20 14 H46 V23 H29 V28 H41 V37 H29 V50 H20 Z'

/**
 * @param {object} options
 * @param {number} options.size    output edge, in pixels
 * @param {number} options.radius  corner radius in 64-unit space (0 = square)
 * @param {number} options.scale   mark scale about the tile centre
 */
function tile({ size, radius, scale = 1 }) {
  // The mark's own bounding box is x 20..46, y 14..50 — centre (33, 32).
  const transform =
    scale === 1 ? '' : ` transform="translate(32 32) scale(${scale}) translate(-33 -32)"`
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">` +
      `<rect width="64" height="64" rx="${radius}" fill="${ORANGE}"/>` +
      `<path d="${FMARK}" fill="${INK}"${transform}/>` +
      `</svg>`,
  )
}

const png = (svg) => sharp(svg, { density: 384 }).png({ compressionLevel: 9 }).toBuffer()

/**
 * Packs PNGs into an .ico. The container is a 6-byte header, one 16-byte
 * directory entry per image, then the PNG payloads verbatim — every browser in
 * use accepts PNG-compressed entries.
 */
function ico(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)

  const directory = Buffer.alloc(16 * images.length)
  let offset = header.length + directory.length

  images.forEach(({ size, data }, index) => {
    const at = index * 16
    directory.writeUInt8(size >= 256 ? 0 : size, at) // width  (0 means 256)
    directory.writeUInt8(size >= 256 ? 0 : size, at + 1) // height
    directory.writeUInt8(0, at + 2) // palette size
    directory.writeUInt8(0, at + 3) // reserved
    directory.writeUInt16LE(1, at + 4) // colour planes
    directory.writeUInt16LE(32, at + 6) // bits per pixel
    directory.writeUInt32LE(data.length, at + 8)
    directory.writeUInt32LE(offset, at + 12)
    offset += data.length
  })

  return Buffer.concat([header, directory, ...images.map((image) => image.data)])
}

/** 1200x630 link-preview card: brand panel on the left, the hero shot on the right. */
async function ogCard() {
  const W = 1200
  const H = 630
  const PANEL = 700

  // `attention` crops around the most salient region, which keeps the burger in
  // frame — a centre crop of this wide shot lands mostly on the plate.
  const photo = await sharp('public/img/burger-hero.jpg')
    .resize(W - PANEL, H, { fit: 'cover', position: sharp.strategy.attention })
    .toBuffer()

  const overlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <style>
          .display { font-family: 'Arial Black', 'Arial Bold', Impact, sans-serif; }
          .body { font-family: Oswald, 'Arial Narrow', Arial, sans-serif; }
        </style>
      </defs>
      <rect width="${PANEL}" height="${H}" fill="${ORANGE}"/>
      <!-- A hard edge, matching the poster feel of the site rather than a fade. -->
      <rect x="${PANEL - 6}" width="6" height="${H}" fill="${INK}"/>

      <text class="body" x="64" y="112" font-size="26" letter-spacing="4"
            font-weight="600" fill="${INK}">LEKKI PHASE 1 &#183; LAGOS</text>

      <text class="display" x="60" y="248" font-size="108" fill="${INK}">FERANMI</text>
      <text class="display" x="60" y="344" font-size="70" letter-spacing="2"
            fill="${INK}">RESTAURANT</text>

      <text class="body" x="64" y="424" font-size="34" fill="${INK}">Burgers, suya-spiced fries</text>
      <text class="body" x="64" y="466" font-size="34" fill="${INK}">and Chapman, cooked to order.</text>

      <rect x="64" y="518" width="404" height="56" fill="${INK}"/>
      <text class="body" x="88" y="556" font-size="26" letter-spacing="1"
            font-weight="600" fill="#ffffff">ORDER ON WHATSAPP</text>
    </svg>`,
  )

  return sharp({ create: { width: W, height: H, channels: 3, background: ORANGE } })
    .composite([
      { input: photo, left: PANEL, top: 0 },
      { input: overlay, left: 0, top: 0 },
    ])
    .jpeg({ quality: 86, progressive: true, chromaSubsampling: '4:4:4' })
    .toBuffer()
}

const write = async (name, data) => {
  await writeFile(join(OUT, name), data)
  console.log(`  ${name.padEnd(24)} ${(data.length / 1024).toFixed(1)} kB`)
}

console.log('Writing brand assets to public/')

// Rounded plate on transparency — the manifest's "any" purpose and the browser tab.
await write('icon-512.png', await png(tile({ size: 512, radius: 12 })))
await write('icon-192.png', await png(tile({ size: 192, radius: 12 })))

// Maskable: full bleed, mark pulled inside the 80% safe zone Android crops to.
await write('icon-512-maskable.png', await png(tile({ size: 512, radius: 0, scale: 0.68 })))

// iOS applies its own mask, so this one is a plain square.
await write('apple-touch-icon.png', await png(tile({ size: 180, radius: 0 })))

await write(
  'favicon.ico',
  ico(
    await Promise.all(
      [16, 32, 48].map(async (size) => ({
        size,
        data: await png(tile({ size, radius: size <= 16 ? 2 : 4 })),
      })),
    ),
  ),
)

await write('og-card.jpg', await ogCard())
console.log('Done.')
