import { useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  body: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
  returnFocusRef?: RefObject<HTMLElement>
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger,
  onConfirm,
  onCancel,
  returnFocusRef,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      size="sm"
      initialFocusRef={danger ? cancelRef : undefined}
      returnFocusRef={returnFocusRef}
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onCancel} ref={cancelRef}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? 'btn btn--danger' : 'btn btn--primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {body}
    </Modal>
  )
}
