import { Link, useLocation } from 'react-router';
import { useAuthStore } from '../lib/auth-store';
import { ThemeToggle } from './ThemeToggle';

interface IndexTab {
  page: string;
  icon: React.ReactNode;
  label: string;
  href: string;
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a3 3 0 0 1 0-6V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const ICON_MAP: Record<string, React.ReactNode> = {
  calendar: <CalendarIcon />,
  users: <UsersIcon />,
  ticket: <TicketIcon />,
  plus: <PlusIcon />,
  star: <StarIcon />,
  tag: <TagIcon />,
  'moon-lantern': <MoonIcon />,
  user: <UserIcon />,
};

function getActivePage(pathname: string): string {
  if (pathname === '/events/new' || /^\/events\/[^/]+\/edit$/.test(pathname)) return '04';
  if (/^\/events\/[^/]+\/attendees$/.test(pathname)) return '05';
  if (pathname.startsWith('/events')) return '01';
  if (pathname === '/my-events') return '02';
  if (pathname === '/my-rsvps') return '03';
  if (pathname === '/admin/permissions') return '06';
  if (pathname === '/admin/tags') return '07';
  if (pathname === '/styleguide') return '08';
  if (pathname === '/login') return '09';
  if (pathname === '/register') return '10';
  return '01';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AlbumRail() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const isCover = location.pathname === '/login' || location.pathname === '/register';
  const activePage = getActivePage(location.pathname);

  if (isCover) return null;

  const tabs: IndexTab[] = [
    { page: '01', icon: ICON_MAP.calendar, label: 'Events', href: '/events' },
    { page: '02', icon: ICON_MAP.users, label: 'My events', href: '/my-events' },
    { page: '03', icon: ICON_MAP.ticket, label: 'My RSVPs', href: '/my-rsvps' },
    { page: '04', icon: ICON_MAP.plus, label: 'Create event', href: '/events/new' },
    { page: '06', icon: ICON_MAP.star, label: 'Permissions', href: '/admin/permissions' },
    { page: '07', icon: ICON_MAP.tag, label: 'Tags', href: '/admin/tags' },
    { page: '08', icon: ICON_MAP['moon-lantern'], label: 'Styleguide', href: '/styleguide' },
    { page: '09', icon: ICON_MAP.user, label: 'Log in', href: '/login' },
    { page: '10', icon: ICON_MAP.user, label: 'Register', href: '/register' },
  ];

  const visibleTabs = tabs.filter((tab) => {
    if (tab.page === '09' || tab.page === '10') return !isAuthenticated;
    if (tab.page === '02') return isAuthenticated && user?.role !== 'User';
    if (tab.page === '04') return isAuthenticated && (user?.role === 'Admin' || user?.role === 'SuperAdmin');
    if (tab.page === '06') return isAuthenticated && (user?.role === 'Admin' || user?.role === 'SuperAdmin');
    if (tab.page === '07') return isAuthenticated && (user?.role === 'Admin' || user?.role === 'SuperAdmin');
    return true;
  });

  return (
    <aside className="album-rail" data-rail aria-label="Album">
      <div className="album-rail__cover">
        <div className="album-rail__cover-tile pattern pattern--chiyogami-hana" aria-hidden="true" />
        <Link className="album-rail__brand" to="/events" aria-label="EventNest home">
          <span className="wordmark">EventNest</span>
          <span className="hanko hanko--sm" aria-hidden="true">祭</span>
        </Link>
        <p className="album-rail__edition" aria-hidden="true">Vol. 01 · Scrapbook</p>
      </div>

      <nav className="album-index" aria-label="Album index">
        <p className="album-index__label" aria-hidden="true">INDEX</p>
        <ul className="album-index__list">
          {visibleTabs.map((tab) => (
            <li key={tab.page}>
              <Link
                className={`index-tab${activePage === tab.page ? ' is-active' : ''}`}
                to={tab.href}
                data-page={tab.page}
                aria-current={activePage === tab.page ? 'page' : undefined}
                title={`Page ${tab.page}, ${tab.label}`}
                aria-label={`Page ${tab.page}, ${tab.label}`}
              >
                <span className="index-tab__num tnum" aria-hidden="true">{tab.page}</span>
                {tab.icon}
                <span className="index-tab__label">{tab.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="album-rail__foot">
        {isAuthenticated && user ? (
          <button type="button" className="rail-user" aria-haspopup="menu" aria-expanded="false" aria-label={`Account menu for ${user.name}`}>
            <span className="rail-user__avatar" aria-hidden="true">{getInitials(user.name)}</span>
            <span className="rail-user__text">
              <span className="rail-user__name">{user.name}</span>
              <span className="rail-user__role">{user.role}{user.role !== 'User' ? ' · 手帳' : ''}</span>
            </span>
          </button>
        ) : (
          <div className="rail-anon">
            <Link className="btn btn--primary" to="/login">Log in</Link>
            <Link className="btn btn--secondary" to="/register">Sign up</Link>
          </div>
        )}
        <ThemeToggle />
      </div>
    </aside>
  );
}