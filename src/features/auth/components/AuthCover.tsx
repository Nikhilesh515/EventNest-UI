import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { AppApiError } from '@/api/errors'
import { Icon } from '@/components/icons/Icon'
import { Mascot } from '@/components/brand/Mascot'
import { Field } from '@/components/forms/Field'
import { validateLogin, validateRegister } from '@/lib/validation'
import type { FieldErrors } from '@/lib/validation'

type AuthKind = 'login' | 'register'

interface AuthCoverProps {
  kind: AuthKind
  onSubmit(values: { displayName: string; email: string; password: string }): Promise<void>
}

interface BannerMessage {
  title: string
  body: string
}

function describeFailure(error: unknown): { banner: BannerMessage; field?: 'a-email' } {
  if (error instanceof AppApiError) {
    const detail = error.fieldErrors.email ?? error.message
    if (error.status === 409) {
      return { banner: { title: "Hmm, that didn't work.", body: detail }, field: 'a-email' }
    }
    if (error.status === 401) {
      return {
        banner: {
          title: "Hmm, that didn't work.",
          body: "We couldn't log you in. Check your email and password.",
        },
      }
    }
    if (error.status === 403) {
      return {
        banner: {
          title: 'Account deactivated',
          body: 'This account is deactivated. Contact an admin.',
        },
      }
    }
    if (error.status === 429) {
      return {
        banner: {
          title: 'Whoa, slow down.',
          body: 'Too many attempts. Try again in a few seconds.',
        },
      }
    }
    return { banner: { title: "Hmm, that didn't work.", body: detail } }
  }
  return { banner: { title: "Hmm, that didn't work.", body: 'Something went wrong.' } }
}

export function AuthCover({ kind, onSubmit }: AuthCoverProps) {
  const isRegister = kind === 'register'
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [banner, setBanner] = useState<BannerMessage | null>(null)
  const [visible, setVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  function validate(): boolean {
    const next = isRegister
      ? validateRegister({ displayName, email, password, confirmPassword })
      : validateLogin({ email, password })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validate()) return
    setBanner(null)
    setSubmitting(true)
    try {
      await onSubmit({ displayName: displayName.trim(), email: email.trim(), password })
    } catch (caught) {
      const failure = describeFailure(caught)
      if (failure.field) setErrors({ [failure.field]: failure.banner.body })
      setBanner(failure.banner)
      window.setTimeout(() => bannerRef.current?.focus(), 0)
    } finally {
      setSubmitting(false)
    }
  }

  const describedBy = (field: string) => (errors[field] ? `${field}-error` : undefined)
  const invalid = (field: string) => (errors[field] ? true : undefined)

  return (
    <div className="cover">
      <div className="cover__art">
        <div className="cover__art-pattern pattern pattern--chiyogami-hana" aria-hidden="true" />
        <div className="cover__art-inner">
          <div className="cover__mascot" aria-hidden="true">
            <Mascot kind="neko" />
          </div>
          <span className="cover__wordmark">EventNest</span>
          <span className="hanko hanko--lg cover__hanko" aria-hidden="true">
            祭
          </span>
          <p className="cover__caption">
            {isRegister ? 'Your stall is ready. 招' : 'A warm stall is a lucky stall. 招'}
          </p>
        </div>
      </div>
      <div className="cover__card-wrap">
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div
            className="cover__mobile-mascot"
            aria-hidden="true"
            style={{ width: 64, marginBottom: 'var(--space-4)' }}
          >
            <Mascot kind="neko" />
          </div>
          <div className="cover__card">
            <span className="washi cover__card-tape washi--sakura" aria-hidden="true" />
            <span className="cover__kanji kanji-watermark" aria-hidden="true" lang="ja">
              祭
            </span>
            <h1 className="cover__title">{isRegister ? 'Create your account' : 'Welcome back.'}</h1>
            <p className="cover__sub">
              {isRegister ? 'Set up your stall in a minute.' : 'Pick up where you left off.'}
            </p>
            <div id="auth-banner-slot">
              {banner ? (
                <div className="banner" role="alert" tabIndex={-1} ref={bannerRef}>
                  <span className="banner__title">{banner.title}</span>
                  {banner.body}
                </div>
              ) : null}
            </div>
            <form id="auth-form" noValidate onSubmit={handleSubmit}>
              {isRegister ? (
                <Field id="a-name" label="Display name" error={errors.displayName}>
                  <input
                    id="a-name"
                    className="input"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    value={displayName}
                    aria-invalid={invalid('displayName')}
                    aria-describedby={describedBy('displayName')}
                    onBlur={validate}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                </Field>
              ) : null}
              <Field id="a-email" label="Email" error={errors.email}>
                <input
                  id="a-email"
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder="ava@eventnest.dev"
                  value={email}
                  aria-invalid={invalid('email')}
                  aria-describedby={describedBy('email')}
                  onBlur={validate}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
              <Field id="a-password" label="Password" error={errors.password}>
                <span className="input-wrap">
                  <input
                    id="a-password"
                    className="input"
                    type={visible ? 'text' : 'password'}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    value={password}
                    aria-invalid={invalid('password')}
                    aria-describedby={describedBy('password')}
                    onBlur={validate}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="input-wrap__action"
                    aria-pressed={visible}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    onClick={() => setVisible((current) => !current)}
                  >
                    <Icon name={visible ? 'eye-off' : 'eye'} size={18} />
                  </button>
                </span>
              </Field>
              {isRegister ? (
                <Field id="a-confirm" label="Confirm password" error={errors.confirmPassword}>
                  <input
                    id="a-confirm"
                    className="input"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    aria-invalid={invalid('confirmPassword')}
                    aria-describedby={describedBy('confirmPassword')}
                    onBlur={validate}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </Field>
              ) : null}
              <button
                type="submit"
                className="btn btn--primary btn--block"
                data-loading={submitting ? 'true' : undefined}
                aria-busy={submitting}
              >
                <span className="btn__label">
                  {submitting
                    ? isRegister
                      ? 'Creating…'
                      : 'Logging in…'
                    : isRegister
                      ? 'Create account'
                      : 'Log in'}
                </span>
              </button>
            </form>
            <p className="cover__sub">
              {isRegister ? (
                <>
                  Already have an account? <Link to="/login">Log in</Link>
                </>
              ) : (
                <>
                  Don&apos;t have an account? <Link to="/register">Sign up</Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
