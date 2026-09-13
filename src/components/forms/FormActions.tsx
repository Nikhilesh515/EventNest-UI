import type { ReactNode } from 'react'

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="form-footer">{children}</div>
}
