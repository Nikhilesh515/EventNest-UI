import { Field } from './Field'
import { parseHex } from '@/lib/color'

interface ColorFieldProps {
  id: string
  label: string
  value: string
  error?: string
  onChange(value: string): void
}

export function ColorField({ id, label, value, error, onChange }: ColorFieldProps) {
  const valid = parseHex(value) !== null
  return (
    <Field id={id} label={label} error={error} hint="Hex colour, e.g. #6366F1">
      <span className="color-field">
        <input
          id={id}
          className="input color-field__input"
          value={value}
          maxLength={7}
          aria-invalid={error ? true : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        <span
          className="color-field__swatch"
          aria-hidden="true"
          style={{ background: valid && parseHex(value) ? value : '#6366F1' }}
        />
      </span>
    </Field>
  )
}
