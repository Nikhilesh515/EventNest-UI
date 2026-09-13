import type { InputHTMLAttributes } from 'react'
import type { IconName } from '@/types'
import { cn } from '@/lib/cn'
import { Field } from './Field'
import { Icon } from '@/components/icons/Icon'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  id: string
  label?: string
  hint?: string
  error?: string
  leadingIcon?: IconName
  trailingAction?: { label: string; icon: IconName; onClick: () => void; pressed?: boolean }
  maxLength?: number
  showCounter?: boolean
  required?: boolean
}

export function TextField({
  id,
  label,
  hint,
  error,
  leadingIcon,
  trailingAction,
  maxLength,
  showCounter,
  required,
  className,
  value,
  ...inputProps
}: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  const current = typeof value === 'string' ? value.length : 0
  const control = (
    <>
      {leadingIcon ? <Icon name={leadingIcon} size={18} className="field__leading" /> : null}
      <input
        id={id}
        className={cn('input', leadingIcon && 'input--leading', className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required ? true : undefined}
        maxLength={maxLength}
        value={value}
        {...inputProps}
      />
      {trailingAction ? (
        <button
          type="button"
          className="field__trailing icon-btn"
          aria-label={trailingAction.label}
          aria-pressed={trailingAction.pressed}
          onClick={trailingAction.onClick}
        >
          <Icon name={trailingAction.icon} size={18} />
        </button>
      ) : null}
    </>
  )

  if (!label) return <span className="field__bare">{control}</span>
  return (
    <Field
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      counter={showCounter && maxLength ? { current, max: maxLength } : undefined}
    >
      {control}
    </Field>
  )
}
