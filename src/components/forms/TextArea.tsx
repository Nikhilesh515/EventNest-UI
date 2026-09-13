import { Field } from './Field'

interface TextAreaProps {
  id: string
  label: string
  value: string
  error?: string
  hint?: string
  maxLength?: number
  showCounter?: boolean
  rows?: number
  required?: boolean
  onChange(value: string): void
}

export function TextArea({
  id,
  label,
  value,
  error,
  hint,
  maxLength,
  showCounter,
  rows = 4,
  required,
  onChange,
}: TextAreaProps) {
  return (
    <Field
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      counter={showCounter && maxLength ? { current: value.length, max: maxLength } : undefined}
    >
      <textarea
        id={id}
        className="input textarea"
        rows={rows}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  )
}
