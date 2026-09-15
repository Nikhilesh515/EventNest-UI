import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '../lib/auth-store';

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function NekoMascot() {
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="105" rx="28" ry="6" fill="#e8e0d4" opacity=".5"/>
      <path d="M36 72c0-16 10-28 24-28s24 12 24 28v20c0 8-4 14-10 16l-4 2c-4 2-10 2-14 0l-4-2c-6-2-10-8-10-16V72z" fill="#fff9f0"/>
      <path d="M36 72c0-16 10-28 24-28s24 12 24 28" stroke="#33312e" stroke-width="2" fill="none"/>
      <path d="M38 52l8-20c2-6 6-8 10-8h8c4 0 8 2 10 8l8 20" fill="#fff9f0" stroke="#33312e" stroke-width="2"/>
      <circle cx="50" cy="68" r="3" fill="#33312e"/>
      <circle cx="70" cy="68" r="3" fill="#33312e"/>
      <path d="M55 76c2 2 8 2 10 0" stroke="#33312e" stroke-width="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="60" cy="73" rx="2" ry="1.5" fill="#ffb4a2"/>
      <path d="M30 64c-4-2-6-6-4-10" stroke="#33312e" stroke-width="2" fill="none" strokeLinecap="round"/>
      <path d="M90 64c4-2 6-6 4-10" stroke="#33312e" stroke-width="2" fill="none" strokeLinecap="round"/>
      <path d="M32 68l-8 2" stroke="#33312e" stroke-width="1.5" fill="none" strokeLinecap="round"/>
      <path d="M32 72l-10 1" stroke="#33312e" stroke-width="1.5" fill="none" strokeLinecap="round"/>
      <path d="M88 68l8 2" stroke="#33312e" stroke-width="1.5" fill="none" strokeLinecap="round"/>
      <path d="M88 72l10 1" stroke="#33312e" stroke-width="1.5" fill="none" strokeLinecap="round"/>
      <rect x="42" y="86" width="36" height="14" rx="7" fill="#ff6b6b"/>
      <circle cx="60" cy="93" r="4" fill="#ffd93d" stroke="#33312e" strokeWidth="1"/>
      <text x="60" y="96" textAnchor="middle" fill="#33312e" fontSize="6" fontWeight="bold">招</text>
      <path d="M44 60c-2-4-1-8 2-10" stroke="#33312e" stroke-width="1.5" fill="none" strokeLinecap="round"/>
      <path d="M76 60c2-4 1-8-2-10" stroke="#33312e" stroke-width="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/events');
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
              <div className="field">
                <label className="field__label" htmlFor="a-email">Email</label>
                <input
                  id="a-email"
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder="ava@eventnest.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="a-password">Password</label>
                <div className="input-wrap">
                  <input
                    id="a-password"
                    className="input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-wrap__action"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-pressed={showPassword}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon />
                  </button>
                </div>
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
