import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { FormEvent } from 'react'
import { TextField } from '@/components/forms/TextField'
import { ErrorSummary } from '@/components/forms/ErrorSummary'
import { PasswordField } from './PasswordField'
import { validateRegister } from '@/lib/validation'
import type { FieldErrors } from '@/lib/validation'
import { AppApiError } from '@/api/errors'

interface RegisterCardProps {
  onSubmit(displayName: string, email: string, password: string): Promise<void>
}

export function RegisterCard({ onSubmit }: RegisterCardProps) {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [banner, setBanner] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateRegister({ displayName, email, password, confirmPassword })
    setErrors(nextErrors)
    setBanner(null)
    if (Object.keys(nextErrors).length > 0) return
    setSubmitting(true)
    try {
      await onSubmit(displayName, email, password)
    } catch (error) {
      if (error instanceof AppApiError && error.status === 409) {
        setErrors({ email: error.fieldErrors.email ?? error.message })
      } else {
        setBanner(
          error instanceof AppApiError ? error.message : 'We could not create your account.',
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit} noValidate>
      <h1 className="auth-card__title">Your stall is ready.</h1>
      <p className="auth-card__sub">Create an account to start collecting events.</p>
      {banner ? (
        <p className="banner banner--error" role="alert">
          {banner}
        </p>
      ) : null}
      <ErrorSummary
        errors={Object.entries(errors).map(([fieldId, message]) => ({ fieldId, message }))}
      />
      <TextField
        id="displayName"
        label="Display name"
        value={displayName}
        error={errors.displayName}
        maxLength={100}
        showCounter
        onChange={(event) => setDisplayName(event.target.value)}
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        error={errors.email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <PasswordField
        id="password"
        label="Password"
        value={password}
        error={errors.password}
        autoComplete="new-password"
        onChange={setPassword}
      />
      <PasswordField
        id="confirmPassword"
        label="Confirm password"
        value={confirmPassword}
        error={errors.confirmPassword}
        autoComplete="new-password"
        onChange={setConfirmPassword}
      />
      <button
        type="submit"
        className="btn btn--primary w-full justify-center"
        disabled={submitting}
      >
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
      <p className="auth-card__alt">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </form>
  )
}
