import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '../lib/auth-store';
import { NekoMascot } from '../components/NekoMascot';
import { Icon } from '../components/Icon';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!EMAIL_PATTERN.test(email.trim())) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Enter your password.';
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
      await login(email, password);
      navigate(from && from !== '/login' && from !== '/register' ? from : '/events', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
          <p className="cover__caption">A warm stall is a lucky stall. 招</p>
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
            <h1 className="cover__title">Welcome back.</h1>
            <p className="cover__sub">Pick up where you left off.</p>
            {error && <div className="alert alert--error">{error}</div>}
            <form onSubmit={handleSubmit} noValidate>
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
                    autoComplete="current-password"
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
              <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
                <span className="btn__label">{loading ? 'Logging in...' : 'Log in'}</span>
              </button>
            </form>
            <p className="cover__sub">
              Don&apos;t have an account? <Link to="/register">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
