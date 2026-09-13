import { Field } from './Field'

interface DateTimeFieldProps {
  id: string
  label: string
  value: string
  error?: string
  hint?: string
  required?: boolean
  onChange(value: string): void
}

export function DateTimeField({
  id,
  label,
  value,
  error,
  hint,
  required,
  onChange,
}: DateTimeFieldProps) {
  return (
    <Field id={id} label={label} required={required} hint={hint} error={error}>
      <input
        id={id}
        type="datetime-local"
        className="input"
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  )
}
