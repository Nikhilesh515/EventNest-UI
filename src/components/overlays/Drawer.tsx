import type { ReactNode, RefObject } from 'react'

import { Icon } from '@/components/icons/Icon'
import { useFocusTrap } from './useFocusTrap'

interface DrawerProps {
  open: boolean
  label: string
  title: string
  onClose: () => void
  children: ReactNode
  initialFocusRef?: RefObject<HTMLElement | null>
}

export function Drawer({ open, label, title, onClose, children, initialFocusRef }: DrawerProps) {
  const ref = useFocusTrap<HTMLDivElement>({
    active: open,
    onEscape: onClose,
    initialFocus: initialFocusRef?.current,
  })

  if (!open) return null

  return (
    <>
      <div className="rail-scrim" onClick={onClose} aria-hidden="true" />
      <div className="drawer is-open" role="dialog" aria-modal="true" aria-label={label} ref={ref}>
        <div className="drawer__head">
          <span className="drawer__title">{title}</span>
          <button
            type="button"
            className="icon-btn"
            aria-label={`Close ${label.toLowerCase()}`}
            onClick={onClose}
          >
            <Icon name="x" size={20} />
          </button>
        </div>
        {children}
      </div>
    </>
  )
}
