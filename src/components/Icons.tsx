/**
 * Icons are Phosphor, with one rule: **an icon's stroke weight matches the
 * weight of the text it sits beside.**
 *
 *   Oswald 400 body copy      -> weight="regular"  (ICON.body)
 *   Oswald 600 labels/buttons -> weight="bold"     (ICON.strong)
 *   Standalone, no adjacent text -> regular
 *
 * Two deliberate exceptions, because they are marks rather than UI glyphs:
 * brand logos (WhatsApp) and the marquee sparkle use `fill`, matching how the
 * Figma file drew them; the 404 illustration uses `duotone`.
 *
 * Sizes default to `1em` (see the IconContext in main.tsx) so an icon tracks
 * the font-size of its line automatically instead of needing its own scale.
 */

import type { IconWeight } from '@phosphor-icons/react'
import {
  FacebookLogo,
  InstagramLogo,
  TiktokLogo,
  WhatsappLogo,
  XLogo,
  YoutubeLogo,
} from '@phosphor-icons/react'
import type { SocialName } from '../data/content'

export const ICON = {
  /** Beside Oswald 400. */
  body: 'regular',
  /** Beside Oswald 600 — nav, buttons, field labels, chips. */
  strong: 'bold',
} as const satisfies Record<string, IconWeight>

const socialIcons = {
  instagram: InstagramLogo,
  facebook: FacebookLogo,
  tiktok: TiktokLogo,
  youtube: YoutubeLogo,
  x: XLogo,
} as const

export function SocialIcon({
  name,
  className,
  weight = ICON.body,
}: {
  name: SocialName
  className?: string
  weight?: IconWeight
}) {
  const Glyph = socialIcons[name]
  return <Glyph className={className} weight={weight} aria-hidden />
}

export { WhatsappLogo as WhatsApp }

/**
 * The scalloped sticker behind the hero seal and the menu badges. Kept
 * hand-drawn — it is a brand shape from the Figma file, not an icon, and
 * Phosphor has no equivalent.
 */
export function Burst({ className, points = 12 }: { className?: string; points?: number }) {
  const outer = 50
  const inner = 41
  const step = Math.PI / points
  const d =
    Array.from({ length: points * 2 }, (_, i) => {
      const r = i % 2 === 0 ? outer : inner
      const angle = i * step - Math.PI / 2
      const x = 50 + r * Math.cos(angle)
      const y = 50 + r * Math.sin(angle)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
    }).join(' ') + ' Z'

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <path d={d} />
    </svg>
  )
}
