import { useId, useState } from 'react'
import { TextField } from '@/components/forms/TextField'

interface PasswordFieldProps {
  id: string
  label: string
  value: string
  error?: string
  autoComplete?: string
  onChange(value: string): void
}

export function PasswordField({
  id,
  label,
  value,
  error,
  autoComplete,
  onChange,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const fallbackId = useId()
  const inputId = id || fallbackId
  return (
    <TextField
      id={inputId}
      label={label}
      type={visible ? 'text' : 'password'}
      value={value}
      error={error}
      autoComplete={autoComplete}
      trailingAction={{
        label: visible ? 'Hide password' : 'Show password',
        icon: visible ? 'eye-off' : 'eye',
        pressed: visible,
        onClick: () => setVisible((current) => !current),
      }}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
