import type { ReactNode } from 'react'

export function CoverLayout({ children }: { children: ReactNode }) {
  return <div className="cover-shell">{children}</div>
}
