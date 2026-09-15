import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '../lib/auth-store';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
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
    <div className="cover-page">
      <div className="cover-page__left">
        <div className="cover-page__brand">
          <span className="wordmark wordmark--lg">EventNest</span>
          <span className="hanko hanko--lg" aria-hidden="true">祭</span>
          <p className="cover-page__tagline">Join the festival.</p>
        </div>
      </div>
      <div className="cover-page__right">
        <div className="cover-page__form-card">
          <h1 className="cover-page__title">Register</h1>
          {error && <div className="alert alert--error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field__label" htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                className="field__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
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
                autoComplete="new-password"
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                className="field__input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="cover-page__alt">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
