interface ErrorSummaryProps {
  title?: string
  errors: { fieldId: string; message: string }[]
}

export function ErrorSummary({ title = 'Please fix the following:', errors }: ErrorSummaryProps) {
  if (errors.length === 0) return null
  return (
    <div className="error-summary" role="alert" tabIndex={-1}>
      <p className="error-summary__title">{title}</p>
      <ul>
        {errors.map((entry) => (
          <li key={entry.fieldId}>
            <a
              href={`#${entry.fieldId}`}
              onClick={(event) => {
                event.preventDefault()
                document.getElementById(entry.fieldId)?.focus()
              }}
            >
              {entry.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
