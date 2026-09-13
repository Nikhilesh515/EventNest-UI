interface RadioOption {
  value: string
  label: string
}

interface RadioGroupProps {
  name: string
  legend: string
  value: string
  options: RadioOption[]
  hint?: string
  onChange(value: string): void
}

export function RadioGroup({ name, legend, value, options, hint, onChange }: RadioGroupProps) {
  const hintId = hint ? `${name}-hint` : undefined
  return (
    <fieldset className="field" aria-describedby={hintId}>
      <legend className="field__label">{legend}</legend>
      {options.map((option) => (
        <label className="check check--radio" key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          <span className="check__box" aria-hidden="true" />
          <span className="check__label">{option.label}</span>
        </label>
      ))}
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </fieldset>
  )
}
