import { Toaster } from 'react-hot-toast'

export function ToastRegion() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerClassName="toast-region"
      toastOptions={{
        className: 'toast',
        duration: 5000,
      }}
    />
  )
}
