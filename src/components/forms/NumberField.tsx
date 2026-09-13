import { Field } from './Field'

interface NumberFieldProps {
  id: string
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  error?: string
  hint?: string
  required?: boolean
  onChange(value: number): void
}

export function NumberField({
  id,
  label,
  value,
  min,
  max,
  step,
  error,
  hint,
  required,
  onChange,
}: NumberFieldProps) {
  return (
    <Field id={id} label={label} required={required} hint={hint} error={error}>
      <input
        id={id}
        type="number"
        className="input"
        value={Number.isFinite(value) ? value : ''}
        min={min}
        max={max}
        step={step}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        onChange={(event) => {
          const next = event.target.valueAsNumber
          onChange(Number.isNaN(next) ? 0 : next)
        }}
      />
    </Field>
  )
}
