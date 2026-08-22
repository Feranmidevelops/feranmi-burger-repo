/**
 * Re-exports photographs from the original Figma archive at a size the dish
 * pages can actually use.
 *
 * The first pass sized every photo for the 323px menu card. A dish page renders
 * the same image at up to 640px — 1280 device pixels on a retina screen — so
 * several were being upscaled and looked soft. The originals are still in
 * `restaurant.fig`, so this goes back to them rather than enlarging a thumbnail.
 *
 * The archive names files by content hash and records nothing about which dish
 * they were placed against, so the mapping is recovered by perceptual signature
 * — a 16x16 grayscale fingerprint.
 *
 * **The matching runs original -> shipped file, never the reverse.** Only ten
 * distinct food photographs exist in the archive; several shipped images are
 * *crops* of those. Asking "what is the best source for this crop?" answers
 * with the crop's parent, which silently gives two different dishes the same
 * photograph. Asking "which single shipped file is this original?" cannot,
 * because each original claims one target and each target is written once.
 * A crop simply finds no original of its own and is left alone.
 *
 * One-off, like make-icons.mjs; the output is committed and `sharp` is not a
 * project dependency:
 *
 *   npx --yes --package sharp node scripts/resample-dish-photos.mjs [path/to/restaurant.fig]
 */

import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { openAsBlob } from 'node:fs'

const require = createRequire(import.meta.url)

let sharp
try {
  sharp = require('sharp')
} catch {
  console.error('sharp is not installed. Run:\n  npx --yes --package sharp node ' + process.argv[1])
  process.exit(1)
}

const ARCHIVE = process.argv[2] ?? 'C:/Users/FeranmiOYETUNDE/Downloads/restaurant.fig'

/** Long edge, in pixels. 2x the 640px dish-page slot. */
const MAX_EDGE = 1280
const QUALITY = 80

/** Beyond this the two images are not the same photograph. */
const MATCH_LIMIT = 8

/** Photographs shown large enough to be worth the extra bytes. */
const CANDIDATES = [
  'juicy-feranmi.jpg',
  'double-trouble.jpg',
  'dark-burger.jpg',
  'crispy-chi.jpg',
  'chicken-sandwich.jpg',
  'burger-fries.jpg',
  'buns-yellow.jpg',
  'chapman.jpg',
  'burger-box.jpg',
  'plated-burger.jpg',
  'burger-hero.jpg',
]

// ---- Zip reading -----------------------------------------------------------

function readZipEntries(buffer) {
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)

  let eocd = -1
  for (let index = bytes.length - 22; index >= 0; index -= 1) {
    if (view.getUint32(index, true) === 0x06054b50) {
      eocd = index
      break
    }
  }
  if (eocd < 0) throw new Error('not a zip archive')

  const count = view.getUint16(eocd + 10, true)
  let pointer = view.getUint32(eocd + 16, true)
  const entries = []

  for (let index = 0; index < count; index += 1) {
    if (view.getUint32(pointer, true) !== 0x02014b50) break
    const method = view.getUint16(pointer + 10, true)
    const compressedSize = view.getUint32(pointer + 20, true)
    const nameLength = view.getUint16(pointer + 28, true)
    const extraLength = view.getUint16(pointer + 30, true)
    const commentLength = view.getUint16(pointer + 32, true)
    const localOffset = view.getUint32(pointer + 42, true)
    const name = new TextDecoder().decode(bytes.subarray(pointer + 46, pointer + 46 + nameLength))

    // The local header repeats the name and extra fields at its own lengths.
    const localNameLength = view.getUint16(localOffset + 26, true)
    const localExtraLength = view.getUint16(localOffset + 28, true)
    const dataStart = localOffset + 30 + localNameLength + localExtraLength

    entries.push({ name, method, data: bytes.subarray(dataStart, dataStart + compressedSize) })
    pointer += 46 + nameLength + extraLength + commentLength
  }

  return entries
}

async function inflate(entry) {
  if (entry.method === 0) return Buffer.from(entry.data)
  const stream = new Blob([entry.data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return Buffer.from(await new Response(stream).arrayBuffer())
}

// ---- Perceptual signature --------------------------------------------------

/** 16x16 grayscale pixels. Enough to tell these photographs apart. */
const signature = (input) =>
  sharp(input).greyscale().resize(16, 16, { fit: 'fill' }).raw().toBuffer()

/** Mean absolute difference. Lower is closer; identical images score 0. */
function distance(a, b) {
  let total = 0
  for (let index = 0; index < a.length; index += 1) total += Math.abs(a[index] - b[index])
  return total / a.length
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} kB`
const longEdge = (meta) => Math.max(meta.width ?? 0, meta.height ?? 0)

// ---- Load both sides -------------------------------------------------------

const buffer = await new Response(await openAsBlob(ARCHIVE)).arrayBuffer()
const entries = readZipEntries(buffer).filter((entry) => entry.name.startsWith('images/'))

const originals = []
for (const entry of entries) {
  const data = await inflate(entry)
  try {
    const meta = await sharp(data).metadata()
    if (!meta.width || !meta.height) continue
    originals.push({
      id: entry.name.replace('images/', '').slice(0, 10),
      data,
      width: meta.width,
      height: meta.height,
      signature: await signature(data),
    })
  } catch {
    // The archive also holds blobs that are not images.
  }
}

const shipped = []
for (const file of CANDIDATES) {
  const data = await readFile(`public/img/${file}`)
  const meta = await sharp(data).metadata()
  shipped.push({ file, bytes: data.length, meta, signature: await signature(data) })
}

console.log(`Archive: ${originals.length} images · shipped: ${shipped.length} candidates\n`)

// ---- Assign: each original claims the one shipped file it *is* -------------

/** @type {Map<string, {original: typeof originals[number], score: number}>} */
const claims = new Map()

for (const original of originals) {
  const best = shipped
    .map((target) => ({ target, score: distance(original.signature, target.signature) }))
    .sort((a, b) => a.score - b.score)[0]

  if (!best || best.score > MATCH_LIMIT) continue

  // Two archive entries (the original and Figma's thumbnail of it) can claim
  // the same file. Keep the larger.
  const held = claims.get(best.target.file)
  if (!held || Math.max(original.width, original.height) > Math.max(held.original.width, held.original.height)) {
    claims.set(best.target.file, { original, score: best.score })
  }
}

// ---- Re-export -------------------------------------------------------------

let before = 0
let after = 0

for (const target of shipped) {
  const claim = claims.get(target.file)

  if (!claim) {
    console.log(
      `${target.file.padEnd(22)} ${String(longEdge(target.meta)).padStart(4)}px  ` +
        `no original of its own (a crop) — left alone`,
    )
    continue
  }

  const source = claim.original
  if (Math.max(source.width, source.height) <= longEdge(target.meta)) {
    console.log(
      `${target.file.padEnd(22)} ${String(longEdge(target.meta)).padStart(4)}px  ` +
        `already at source resolution — left alone`,
    )
    continue
  }

  const output = await sharp(source.data)
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
    .toBuffer()
  const outMeta = await sharp(output).metadata()

  await writeFile(`public/img/${target.file}`, output)
  before += target.bytes
  after += output.length

  console.log(
    `${target.file.padEnd(22)} ${target.meta.width}x${target.meta.height} ${kb(target.bytes).padStart(7)}` +
      `  ->  ${outMeta.width}x${outMeta.height} ${kb(output.length).padStart(7)}` +
      `   (from ${source.id}, match ${claim.score.toFixed(1)})`,
  )
}

console.log(`\nRewritten: ${kb(before)} -> ${kb(after)}`)

// ---- Guard -----------------------------------------------------------------

/*
 * The failure this script is most likely to cause is two dishes ending up with
 * the same photograph. Catch it here rather than in the browser.
 */
const digests = new Map()
for (const file of CANDIDATES) {
  const digest = createHash('md5').update(await readFile(`public/img/${file}`)).digest('hex')
  digests.set(file, digest)
}

const duplicates = [...digests.entries()].reduce((groups, [file, digest]) => {
  groups.set(digest, [...(groups.get(digest) ?? []), file])
  return groups
}, new Map())

const collisions = [...duplicates.values()].filter((group) => group.length > 1)
if (collisions.length > 0) {
  console.error('\nFAILED: these files are now the same image —')
  for (const group of collisions) console.error(`  ${group.join('  ==  ')}`)
  console.error('\nRun `git checkout -- public/img/` and fix the matching.')
  process.exit(1)
}

console.log('All candidate photographs are still distinct.')
