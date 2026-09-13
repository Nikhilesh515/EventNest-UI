import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

import { cn } from '@/lib/cn'
import type { Density, TemplateName } from '@/types'

interface ContentCanvasProps {
  template: TemplateName
  density: Density
  width: string
  children: ReactNode
  footer?: ReactNode
}

export function ContentCanvas({ template, density, width, children, footer }: ContentCanvasProps) {
  const navigationType = useNavigationType()
  const location = useLocation()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (navigationType === 'PUSH') window.scrollTo(0, 0)
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const cls = density === 'festival' ? 'page-turn-in' : 'work-fade'
    node.classList.remove('page-turn-in', 'work-fade')
    void node.offsetWidth
    node.classList.add(cls)
  }, [navigationType, location.pathname, density])

  return (
    <main
      id="main-view"
      className="content-canvas"
      data-density={density}
      tabIndex={-1}
      style={{ '--template-w': width } as CSSProperties}
    >
      <div ref={ref} className={cn('template', `template--${template}`)}>
        {children}
      </div>
      {footer}
    </main>
  )
}
