import { Link, useLocation } from 'react-router';
import { ThemeToggle } from './ThemeToggle';

export function TopBar() {
  const location = useLocation();
  const isCover = location.pathname === '/login' || location.pathname === '/register';

  if (!isCover) {
    return (
      <header className="topbar" data-topbar role="banner" hidden>
        <span />
      </header>
    );
  }

  return (
    <header className="topbar" data-topbar role="banner">
      <Link className="topbar__brand" to="/events" aria-label="EventNest home">
        <span className="topbar__wordmark">EventNest</span>
        <span className="topbar__hanko" aria-hidden="true">祭</span>
      </Link>
      <span className="topbar__spacer" />
      <ThemeToggle variant="icon" />
    </header>
  );
}
