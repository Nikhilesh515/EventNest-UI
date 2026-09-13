interface FieldMessageProps {
  id: string
  error?: string
  hint?: string
}

export function FieldMessage({ id, error, hint }: FieldMessageProps) {
  if (error)
    return (
      <p className="field__error" id={`${id}-error`} role="alert">
        {error}
      </p>
    )
  if (hint)
    return (
      <p className="field__hint" id={`${id}-hint`}>
        {hint}
      </p>
    )
  return null
}
