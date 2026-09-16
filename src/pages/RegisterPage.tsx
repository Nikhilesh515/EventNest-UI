import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '../lib/auth-store';
import { NekoMascot } from '../components/NekoMascot';
import { Icon } from '../components/Icon';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Enter a display name.';
    else if (name.trim().length > 100) errs.name = 'That name is a bit long (100 max).';
    if (!EMAIL_PATTERN.test(email.trim())) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Enter your password.';
    else if (password.length < 8) errs.password = 'Use at least 8 characters.';
    if (confirmPassword !== password) errs.confirmPassword = "Passwords don't match.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cover">
      <div className="cover__art">
        <div className="cover__art-pattern pattern pattern--chiyogami-hana" aria-hidden="true" />
        <div className="cover__art-inner">
          <div className="cover__mascot" aria-hidden="true">
            <NekoMascot />
          </div>
          <span className="cover__wordmark">EventNest</span>
          <span className="hanko hanko--lg cover__hanko" aria-hidden="true">祭</span>
          <p className="cover__caption">Your stall is ready. 招</p>
        </div>
      </div>
      <div className="cover__card-wrap">
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div className="cover__mobile-mascot" aria-hidden="true" style={{ width: 64, marginBottom: 'var(--space-4)' }}>
            <NekoMascot />
          </div>
          <div className="cover__card">
            <span className="washi cover__card-tape washi--sakura" aria-hidden="true" />
            <span className="cover__kanji kanji-watermark" aria-hidden="true" lang="ja">祭</span>
            <h1 className="cover__title">Create your account</h1>
            <p className="cover__sub">Set up your stall in a minute.</p>
            {error && <div className="alert alert--error">{error}</div>}
            <form onSubmit={handleSubmit} noValidate>
              <div className={`field${errors.name ? ' field--error' : ''}`}>
                <label className="field__label" htmlFor="a-name">Display name</label>
                <input
                  id="a-name"
                  className="input"
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError('name'); }}
                  onBlur={validate}
                  aria-invalid={!!errors.name}
                  required
                />
                {errors.name && <p className="field__error" role="alert">{errors.name}</p>}
              </div>
              <div className={`field${errors.email ? ' field--error' : ''}`}>
                <label className="field__label" htmlFor="a-email">Email</label>
                <input
                  id="a-email"
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder="ava@eventnest.dev"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                  onBlur={validate}
                  aria-invalid={!!errors.email}
                  required
                />
                {errors.email && <p className="field__error" role="alert">{errors.email}</p>}
              </div>
              <div className={`field${errors.password ? ' field--error' : ''}`}>
                <label className="field__label" htmlFor="a-password">Password</label>
                <div className="input-wrap">
                  <input
                    id="a-password"
                    className="input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                    onBlur={validate}
                    aria-invalid={!!errors.password}
                    required
                  />
                  <button
                    type="button"
                    className="input-wrap__action"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-pressed={showPassword}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
                  </button>
                </div>
                {errors.password && <p className="field__error" role="alert">{errors.password}</p>}
              </div>
              <div className={`field${errors.confirmPassword ? ' field--error' : ''}`}>
                <label className="field__label" htmlFor="a-confirm">Confirm password</label>
                <input
                  id="a-confirm"
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
                  onBlur={validate}
                  aria-invalid={!!errors.confirmPassword}
                  required
                />
                {errors.confirmPassword && <p className="field__error" role="alert">{errors.confirmPassword}</p>}
              </div>
              <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
                <span className="btn__label">{loading ? 'Creating...' : 'Create account'}</span>
              </button>
            </form>
            <p className="cover__sub">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
