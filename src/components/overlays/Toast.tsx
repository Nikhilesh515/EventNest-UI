import { useEffect } from 'react'

import type { Toast as ToastModel } from '@/app/providers/ToastProvider'
import { cn } from '@/lib/cn'

interface ToastProps {
  toast: ToastModel
  onDismiss: (id: string) => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const kind = toast.kind ?? 'info'
  const duration = toast.durationMs ?? (kind === 'error' ? 8000 : kind === 'info' ? 4500 : 5000)

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), duration)
    return () => window.clearTimeout(timer)
  }, [toast.id, duration, onDismiss])

  return (
    <div className={cn('toast', `toast--${kind}`)} role={kind === 'error' ? 'alert' : 'status'}>
      <div className="toast__body">
        <p className="toast__title">{toast.title}</p>
        {toast.body ? <p className="toast__text">{toast.body}</p> : null}
      </div>
      <button
        type="button"
        className="icon-btn"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  )
}
