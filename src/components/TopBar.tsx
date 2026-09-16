import { Link, useLocation, useNavigate } from 'react-router';
import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '../lib/auth-store';

interface TopBarProps {
  indexOpen: boolean;
  onOpenIndex: () => void;
}

export function TopBar({ indexOpen, onOpenIndex }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const isCover = location.pathname === '/login' || location.pathname === '/register';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="topbar" data-topbar role="banner">
      <Link className="topbar__brand" to="/events" aria-label="EventNest home">
        <span className="topbar__wordmark">EventNest</span>
        <span className="topbar__hanko" aria-hidden="true">祭</span>
      </Link>
      <span className="topbar__spacer" />
      {!isCover && (
        <button
          type="button"
          className="btn btn--secondary btn--sm topbar__index"
          aria-haspopup="dialog"
          aria-expanded={indexOpen}
          aria-controls="index-drawer"
          onClick={onOpenIndex}
        >
          Index ▾
        </button>
      )}
      {isAuthenticated && user && (
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={handleLogout}
          aria-label="Log out"
        >
          Log out
        </button>
      )}
      <ThemeToggle variant="icon" />
    </header>
  );
}
