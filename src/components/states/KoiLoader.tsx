import { cn } from '@/lib/cn'

interface KoiLoaderProps {
  label?: string
  size?: 'md' | 'lg'
  className?: string
}

export function KoiLoader({ label = 'Loading…', size = 'md', className }: KoiLoaderProps) {
  return (
    <div
      className={cn('koi-loader', size === 'lg' && 'koi-loader--lg', className)}
      role="status"
      aria-live="polite"
    >
      <div className="koi-loader__svg" aria-hidden="true">
        <svg
          className="mascot mascot--koi"
          viewBox="0 0 120 120"
          aria-hidden="true"
          focusable="false"
        >
          <circle
            className="koi-ring"
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="var(--border-dashed)"
            strokeWidth="2"
            strokeDasharray="6 8"
          />
          <g className="koi-a">
            <path
              d="M60 26c10 0 16 8 16 18 0 14-8 22-16 22s-16-8-16-22c0-10 6-18 16-18Z"
              fill="var(--mascot-accent)"
              stroke="var(--mascot-ink)"
              strokeWidth="2.5"
            />
          </g>
          <g className="koi-b">
            <path
              d="M60 94c10 0 16-8 16-18 0-14-8-22-16-22s-16 8-16 22c0 10 6 18 16 18Z"
              fill="var(--mascot-sky)"
              stroke="var(--mascot-ink)"
              strokeWidth="2.5"
            />
          </g>
        </svg>
      </div>
      <span className="koi-loader__text">{label}</span>
    </div>
  )
}
