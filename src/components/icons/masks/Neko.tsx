import { cn } from '@/lib/cn'

export function Neko({ className }: { className?: string } = {}) {
  return (
    <svg
      className={cn('mascot mascot--neko', className)}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <ellipse cx="60" cy="108" rx="32" ry="5" fill="rgba(51,49,46,.10)" />
      <ellipse
        cx="60"
        cy="72"
        rx="34"
        ry="34"
        fill="var(--mascot-body,#FFFDF8)"
        stroke="var(--mascot-ink,#33312E)"
        strokeWidth="3"
      />
      <circle
        cx="60"
        cy="40"
        r="26"
        fill="var(--mascot-body,#FFFDF8)"
        stroke="var(--mascot-ink,#33312E)"
        strokeWidth="3"
      />
      <path
        d="M40 22l-6-14 16 8M80 22l6-14-16 8"
        fill="var(--mascot-body,#FFFDF8)"
        stroke="var(--mascot-ink,#33312E)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M50 38c3-4 7-4 10 0M60 38c3-4 7-4 10 0"
        fill="none"
        stroke="var(--mascot-ink,#33312E)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M56 48c2 3 6 3 8 0"
        fill="none"
        stroke="var(--mascot-ink,#33312E)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect
        x="38"
        y="58"
        width="44"
        height="8"
        rx="4"
        fill="var(--mascot-accent,#FF6B6B)"
        stroke="var(--mascot-ink,#33312E)"
        strokeWidth="2.5"
      />
      <circle
        cx="60"
        cy="62"
        r="4"
        fill="var(--mascot-sun,#FFE066)"
        stroke="var(--mascot-ink,#33312E)"
        strokeWidth="2"
      />
      <ellipse
        cx="60"
        cy="86"
        rx="12"
        ry="14"
        fill="var(--mascot-sun,#FFE066)"
        stroke="var(--mascot-ink,#33312E)"
        strokeWidth="2.5"
      />
      <text
        x="60"
        y="91"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="var(--mascot-ink,#33312E)"
      >
        招
      </text>
      <g className="neko-paw">
        <path
          d="M88 54c8-4 12-12 10-20"
          fill="none"
          stroke="var(--mascot-ink,#33312E)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle
          cx="98"
          cy="32"
          r="7"
          fill="var(--mascot-body,#FFFDF8)"
          stroke="var(--mascot-ink,#33312E)"
          strokeWidth="3"
        />
      </g>
    </svg>
  )
}
