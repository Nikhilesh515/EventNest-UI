import { cn } from '@/lib/cn'

export function Koi({ className }: { className?: string } = {}) {
  return (
    <svg
      className={cn('mascot mascot--koi', className)}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <circle
        className="koi-ring"
        cx="60"
        cy="60"
        r="46"
        fill="none"
        stroke="var(--border-dashed,#A9A29A)"
        strokeWidth="2"
        strokeDasharray="6 8"
      />
      <g className="koi-a">
        <path
          d="M60 26c10 0 16 8 16 18 0 14-8 22-16 22s-16-8-16-22c0-10 6-18 16-18Z"
          fill="var(--mascot-accent,#FF6B6B)"
          stroke="var(--mascot-ink,#33312E)"
          strokeWidth="2.5"
        />
        <path
          d="M60 66l-8 14 8-4 8 4-8-14Z"
          fill="var(--mascot-accent,#FF6B6B)"
          stroke="var(--mascot-ink,#33312E)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="54" cy="40" r="2.5" fill="var(--mascot-ink,#33312E)" />
        <path
          d="M48 48c4 2 8 2 12 0"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          opacity=".8"
        />
      </g>
      <g className="koi-b">
        <path
          d="M60 94c10 0 16-8 16-18 0-14-8-22-16-22s-16 8-16 22c0 10 6 18 16 18Z"
          fill="var(--mascot-sky,#A8D8EA)"
          stroke="var(--mascot-ink,#33312E)"
          strokeWidth="2.5"
        />
        <path
          d="M60 54l-8-14 8 4 8-4-8 14Z"
          fill="var(--mascot-sky,#A8D8EA)"
          stroke="var(--mascot-ink,#33312E)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="66" cy="80" r="2.5" fill="var(--mascot-ink,#33312E)" />
      </g>
    </svg>
  )
}
