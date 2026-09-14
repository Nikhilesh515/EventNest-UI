import type { CSSProperties } from 'react'

import { cn } from '@/lib/cn'

export function Kokeshi({ className, style }: { className?: string; style?: CSSProperties } = {}) {
  return (
    <svg
      className={cn('mascot mascot--kokeshi', className)}
      style={style}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <ellipse cx="60" cy="110" rx="26" ry="4" fill="rgba(51,49,46,.10)" />
      <g className="kokeshi-head">
        <circle
          cx="60"
          cy="36"
          r="24"
          fill="var(--mascot-body,#FFFDF8)"
          stroke="var(--mascot-ink,#33312E)"
          strokeWidth="3"
        />
        <path
          d="M36 30c6-14 42-14 48 0"
          fill="none"
          stroke="var(--mascot-ink,#33312E)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="51" cy="38" r="3" fill="var(--mascot-ink,#33312E)" />
        <circle cx="69" cy="38" r="3" fill="var(--mascot-ink,#33312E)" />
        <path
          d="M55 47c3 3 7 3 10 0"
          fill="none"
          stroke="var(--mascot-ink,#33312E)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
      <path
        d="M38 92c0-22 8-42 22-42s22 20 22 42c0 8-8 14-22 14s-22-6-22-14Z"
        fill="var(--mascot-accent,#FF6B6B)"
        stroke="var(--mascot-ink,#33312E)"
        strokeWidth="3"
      />
      <path d="M40 68h40" stroke="var(--mascot-ink,#33312E)" strokeWidth="2" opacity=".4" />
      <path d="M40 96h40" stroke="var(--mascot-ink,#33312E)" strokeWidth="2" opacity=".4" />
      <g fill="var(--mascot-sun,#FFE066)" stroke="var(--mascot-ink,#33312E)" strokeWidth="2">
        <circle cx="60" cy="82" r="5" />
        <circle cx="60" cy="71" r="4" />
        <circle cx="60" cy="93" r="4" />
        <circle cx="49" cy="82" r="4" />
        <circle cx="71" cy="82" r="4" />
      </g>
    </svg>
  )
}
