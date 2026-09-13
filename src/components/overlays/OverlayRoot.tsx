import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function OverlayRoot({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setHost(document.getElementById('overlay-root'))
  }, [])

  if (!host) return null
  return createPortal(children, host)
}
