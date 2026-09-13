import { cn } from '@/lib/cn'

export function Daruma({ className }: { className?: string } = {}) {
  return (
    <svg
      className={cn('mascot mascot--daruma', className)}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <ellipse cx="60" cy="106" rx="30" ry="5" fill="rgba(51,49,46,.10)" />
      <path
        d="M60 12c26 0 42 20 42 46 0 30-18 46-42 46S18 88 18 58C18 32 34 12 60 12Z"
        fill="var(--mascot-body,#FFFDF8)"
        stroke="var(--mascot-ink,#33312E)"
        strokeWidth="3"
      />
      <path
        d="M26 66c0 18 15 30 34 30s34-12 34-30"
        fill="none"
        stroke="var(--mascot-ink,#33312E)"
        strokeWidth="2.5"
        opacity=".35"
      />
      <circle cx="46" cy="52" r="9" fill="var(--mascot-ink,#33312E)" />
      <circle
        className="daruma-empty-eye"
        cx="74"
        cy="52"
        r="9"
        fill="none"
        stroke="var(--mascot-ink,#33312E)"
        strokeWidth="3"
      />
      <path
        d="M52 72c5 5 11 5 16 0"
        fill="none"
        stroke="var(--mascot-ink,#33312E)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="36" cy="64" r="5" fill="var(--mascot-blush,#FFD1DC)" opacity=".8" />
      <circle cx="84" cy="64" r="5" fill="var(--mascot-blush,#FFD1DC)" opacity=".8" />
      <path
        d="M57 12c1-5 5-5 6 0"
        fill="none"
        stroke="var(--mascot-ink,#33312E)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
