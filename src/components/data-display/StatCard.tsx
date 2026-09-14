import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type StatTone = 'going' | 'maybe' | 'notgoing' | 'cancelled' | 'guests' | 'capacity'

interface StatCardProps {
  label: string
  value: ReactNode
  sub?: string
  tone?: StatTone
}

export function StatCard({ label, value, sub, tone }: StatCardProps) {
  return (
    <div className={cn('stat', tone && `stat--${tone}`)}>
      <span className="stat__label">{label}</span>
      <span className="stat__value tnum">{value}</span>
      {sub ? <span className="stat__sub">{sub}</span> : null}
    </div>
  )
}
