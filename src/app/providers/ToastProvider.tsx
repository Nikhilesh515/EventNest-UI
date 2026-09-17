import { createContext, useCallback, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import hotToast from 'react-hot-toast'

import { Toast } from '@/components/overlays/Toast'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastOptions {
  title: string
  body?: string
  kind?: ToastKind
  durationMs?: number
}

export interface Toast extends ToastOptions {
  id: string
}

interface ToastContextValue {
  toasts: Toast[]
  push: (options: ToastOptions) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const dismiss = useCallback((id: string) => {
    hotToast.dismiss(id)
  }, [])

  const push = useCallback((options: ToastOptions) => {
    const kind = options.kind ?? 'info'
    const duration = options.durationMs ?? (kind === 'error' ? 8000 : kind === 'info' ? 4500 : 5000)

    const id = hotToast.custom(
      (t) => (
        <Toast
          toast={{ id: t.id, ...options }}
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      { duration, id: options.title },
    )
    return id
  }, [])

  const value = useMemo<ToastContextValue>(
    () => ({ toasts: [], push, dismiss }),
    [push, dismiss],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
