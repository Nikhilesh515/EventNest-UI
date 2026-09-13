import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { FieldMessage } from './FieldMessage'

interface FieldProps {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  counter?: { current: number; max: number }
  children: ReactNode
  className?: string
}

export function Field({
  id,
  label,
  required,
  hint,
  error,
  counter,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn('field', error && 'field--error', className)}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {counter ? (
        <span className="field__counter tnum">
          {counter.current}/{counter.max}
        </span>
      ) : null}
      {children}
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  )
}
