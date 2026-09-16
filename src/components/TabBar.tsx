import { Link, useLocation } from 'react-router';
import { useAuthStore } from '../lib/auth-store';
import { useMediaQuery } from '../lib/use-media-query';
import { Icon } from './Icon';

function TabIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    calendar: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    users: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    ticket: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 0 1 0 6v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a3 3 0 0 1 0-6V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v2" />
        <path d="M13 17v2" />
        <path d="M13 11v2" />
      </svg>
    ),
    plus: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  };
  return <>{icons[name] || null}</>;
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/events') return pathname.startsWith('/events') && !pathname.includes('/new') && !pathname.includes('/edit') && !pathname.includes('/attendees');
  if (href === '/my-events') return pathname === '/my-events';
  if (href === '/my-rsvps') return pathname === '/my-rsvps';
  if (href === '/events/new') return pathname === '/events/new' || /\/events\/[^/]+\/edit/.test(pathname);
  return pathname === href;
}

interface TabBarProps {
  indexOpen: boolean;
  onOpenIndex: () => void;
}

export function TabBar({ indexOpen, onOpenIndex }: TabBarProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const showCreate = useMediaQuery('(min-width: 361px)');
  const isCover = location.pathname === '/login' || location.pathname === '/register';

  if (isCover) return null;

  const isModOrAbove = user?.role === 'Moderator' || user?.role === 'Admin' || user?.role === 'SuperAdmin';
  const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';

  const tabs = [
    { icon: 'calendar', label: 'Events', href: '/events', show: true },
    { icon: 'user', label: 'Log in', href: '/login', show: !isAuthenticated },
    { icon: 'users', label: 'My events', href: '/my-events', show: isAuthenticated && isModOrAbove },
    { icon: 'ticket', label: 'My RSVPs', href: '/my-rsvps', show: isAuthenticated },
    { icon: 'plus', label: 'Create', href: '/events/new', show: isAuthenticated && isAdmin && showCreate },
  ].filter((t) => t.show);

  return (
    <nav className="tabbar" data-tabbar aria-label="Primary">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          className={`tab-item${isActive(location.pathname, tab.href) ? ' is-active' : ''}`}
          to={tab.href}
          aria-current={isActive(location.pathname, tab.href) ? 'page' : undefined}
        >
          <TabIcon name={tab.icon} />
          <span className="tab-item__label">{tab.label}</span>
        </Link>
      ))}
      <button
        type="button"
        className="tab-item"
        aria-haspopup="dialog"
        aria-expanded={indexOpen}
        aria-controls="index-drawer"
        onClick={onOpenIndex}
      >
        <Icon name={isAuthenticated ? 'moon-lantern' : 'user'} size={22} />
        <span className="tab-item__label">Index</span>
      </button>
    </nav>
  );
}
