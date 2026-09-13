interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  id?: string
  label?: string
  value: string
  options: SelectOption[]
  inline?: boolean
  ariaLabel?: string
  onChange(value: string): void
}

export function Select({ id, label, value, options, inline, ariaLabel, onChange }: SelectProps) {
  return (
    <>
      {label ? (
        <label className={inline ? 'sr-only' : 'field__label'} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className={inline ? 'select select--inline' : 'select'}
        aria-label={ariaLabel ?? label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  )
}
