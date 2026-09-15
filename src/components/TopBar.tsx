import { Link, useLocation } from 'react-router';
import { ThemeToggle } from './ThemeToggle';

export function TopBar() {
  const location = useLocation();
  const isCover = location.pathname === '/login' || location.pathname === '/register';

  if (!isCover && typeof window !== 'undefined' && window.innerWidth >= 1024) {
    return null;
  }

  return (
    <header className="topbar" data-topbar role="banner">
      <Link className="topbar__brand" to="/events" aria-label="EventNest home">
        <span className="topbar__wordmark">EventNest</span>
        <span className="topbar__hanko" aria-hidden="true">祭</span>
      </Link>
      <span className="topbar__spacer" />
      {!isCover && (
        <button type="button" className="btn btn--secondary btn--sm topbar__index" aria-haspopup="dialog" aria-expanded="false" aria-controls="index-drawer">
          Index ▾
        </button>
      )}
      <ThemeToggle variant="icon" />
    </header>
  );
}
