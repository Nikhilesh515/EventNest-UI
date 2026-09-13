import { useId } from 'react'
import type { ReactNode, RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from './useFocusTrap'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md'
  static?: boolean
  initialFocusRef?: RefObject<HTMLElement | null>
  returnFocusRef?: RefObject<HTMLElement | null>
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = 'md',
  static: isStatic,
  initialFocusRef,
  returnFocusRef,
}: ModalProps) {
  const titleId = useId()
  const bodyId = useId()
  const ref = useFocusTrap<HTMLDivElement>({
    active: open,
    onEscape: isStatic ? undefined : onClose,
    returnFocus: returnFocusRef?.current,
    initialFocus: initialFocusRef?.current,
  })

  if (!open) return null
  const host = document.getElementById('modal-root') ?? document.body
  return createPortal(
    <>
      <div className="scrim" onClick={isStatic ? undefined : onClose} aria-hidden="true" />
      <div
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        ref={ref}
      >
        <div className="modal__header">
          <h2 className="modal__title" id={titleId}>
            {title}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="modal__body" id={bodyId}>
          {children}
        </div>
        {footer ? <div className="modal__footer">{footer}</div> : null}
      </div>
    </>,
    host,
  )
}
