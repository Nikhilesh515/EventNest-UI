import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

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

let toastSeq = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback((options: ToastOptions) => {
    toastSeq += 1
    const id = `toast-${toastSeq}`
    setToasts((current) => [...current.slice(-2), { ...options, id }])
    return id
  }, [])

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, push, dismiss }),
    [toasts, push, dismiss],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
