import type { SocialName } from '../data/content'

interface IconProps {
  className?: string
}

const paths: Record<SocialName, string> = {
  instagram:
    'M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.4A6.4 6.4 0 1 0 18.4 12 6.4 6.4 0 0 0 12 5.6Zm0 10.55A4.15 4.15 0 1 1 16.15 12 4.15 4.15 0 0 1 12 16.15ZM20.15 5.35a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5Z',
  facebook:
    'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z',
  tiktok:
    'M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-1.84-2.48V9.77a5.68 5.68 0 1 0 4.93 5.63V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.29 4.29 0 0 1-3.24-1.48Z',
  youtube:
    'M21.58 7.19a2.5 2.5 0 0 0-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42a2.5 2.5 0 0 0-1.77 1.77A26.1 26.1 0 0 0 2 12a26.1 26.1 0 0 0 .42 4.81 2.5 2.5 0 0 0 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42a2.5 2.5 0 0 0 1.77-1.77A26.1 26.1 0 0 0 22 12a26.1 26.1 0 0 0-.42-4.81ZM10 15.02V8.98L15.2 12Z',
  x: 'M17.53 3h3.05l-6.66 7.62L21.75 21h-6.13l-4.8-6.28L5.32 21H2.27l7.12-8.14L2 3h6.28l4.34 5.74ZM16.46 19.18h1.69L7.4 4.72H5.59Z',
}

export function SocialIcon({ name, className }: { name: SocialName } & IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <path d={paths[name]} />
    </svg>
  )
}

export function ArrowDown({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 21"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
    >
      <path d="M8 0v19M1 12.5 8 20l7-7.5" />
    </svg>
  )
}

/**
 * The scalloped sticker shape used for the hero seal and the "new" flag.
 * `points` controls how many spikes ring the badge.
 */
export function Burst({ className, points = 12 }: IconProps & { points?: number }) {
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

export function Smiley({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 43"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <rect x="9" y="0" width="11" height="22" rx="5.5" />
      <rect x="39" y="0" width="11" height="22" rx="5.5" />
      <path d="M0 26h60a30 30 0 0 1-60 0Z" />
    </svg>
  )
}

export function Sparkle({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <path d="M16 0c1.2 8.4 7.4 14.6 15.8 15.8v.4C23.4 17.4 17.2 23.6 16 32h-.4C14.4 23.6 8.2 17.4-.2 16.2v-.4C8.2 14.6 14.4 8.4 15.6 0Z" />
    </svg>
  )
}
