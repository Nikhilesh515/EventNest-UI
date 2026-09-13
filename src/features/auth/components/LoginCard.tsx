import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { FormEvent } from 'react'
import { TextField } from '@/components/forms/TextField'
import { ErrorSummary } from '@/components/forms/ErrorSummary'
import { PasswordField } from './PasswordField'
import { validateLogin } from '@/lib/validation'
import type { FieldErrors } from '@/lib/validation'
import { AppApiError } from '@/api/errors'

interface LoginCardProps {
  onSubmit(email: string, password: string): Promise<void>
}

export function LoginCard({ onSubmit }: LoginCardProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [banner, setBanner] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateLogin({ email, password })
    setErrors(nextErrors)
    setBanner(null)
    if (Object.keys(nextErrors).length > 0) return
    setSubmitting(true)
    try {
      await onSubmit(email, password)
    } catch (error) {
      setBanner(
        error instanceof AppApiError ? error.message : 'We could not log you in. Try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit} noValidate>
      <span className="page-doc__kanji kanji-watermark" aria-hidden="true" lang="ja">
        祭
      </span>
      <h1 className="auth-card__title">Welcome back.</h1>
      <p className="auth-card__sub">Pick up where you left off.</p>
      {banner ? (
        <p className="banner banner--error" role="alert">
          {banner}
        </p>
      ) : null}
      <ErrorSummary
        errors={Object.entries(errors).map(([fieldId, message]) => ({ fieldId, message }))}
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        leadingIcon="user"
        value={email}
        error={errors.email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <PasswordField
        id="password"
        label="Password"
        value={password}
        error={errors.password}
        autoComplete="current-password"
        onChange={setPassword}
      />
      <button
        type="submit"
        className="btn btn--primary w-full justify-center"
        disabled={submitting}
      >
        {submitting ? 'Logging in…' : 'Log in'}
      </button>
      <p className="auth-card__alt">
        No account? <Link to="/register">Sign up</Link>
      </p>
    </form>
  )
}
