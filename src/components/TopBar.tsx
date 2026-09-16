import { Link, useLocation } from 'react-router';
import { ThemeToggle } from './ThemeToggle';

interface TopBarProps {
  indexOpen: boolean;
  onOpenIndex: () => void;
}

export function TopBar({ indexOpen, onOpenIndex }: TopBarProps) {
  const location = useLocation();
  const isCover = location.pathname === '/login' || location.pathname === '/register';

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
      <ThemeToggle variant="icon" />
    </header>
  );
}
