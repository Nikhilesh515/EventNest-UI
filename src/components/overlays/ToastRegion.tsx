import { useToast } from '@/app/providers/ToastProvider'
import { Toast } from './Toast'

export function ToastRegion() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="toast-region" id="toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  )
}
