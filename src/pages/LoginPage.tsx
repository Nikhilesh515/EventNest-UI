import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '../lib/auth-store';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="cover-page">
      <div className="cover-page__left">
        <div className="cover-page__brand">
          <span className="wordmark wordmark--lg">EventNest</span>
          <span className="hanko hanko--lg" aria-hidden="true">祭</span>
          <p className="cover-page__tagline">Find your next festival and paste yourself in.</p>
        </div>
      </div>
      <div className="cover-page__right">
        <div className="cover-page__form-card">
          <h1 className="cover-page__title">Log in</h1>
          {error && <div className="alert alert--error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field__label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="field__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="field__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          <p className="cover-page__alt">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
