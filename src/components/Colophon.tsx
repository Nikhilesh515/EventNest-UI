import { Link, useLocation } from 'react-router';
import { useAuthStore } from '../lib/auth-store';

const PAGE_NAMES: Record<string, string> = {
  '/events': 'Events',
  '/my-events': 'My events',
  '/my-rsvps': 'My RSVPs',
  '/events/new': 'Create event',
  '/admin/users': 'Users',
  '/admin/roles': 'Roles',
  '/admin/tags': 'Tags',
  '/styleguide': 'Styleguide',
};

function getPageNumber(pathname: string): string {
  if (pathname === '/events/new' || /\/events\/[^/]+\/edit/.test(pathname)) return '04';
  if (/\/events\/[^/]+\/attendees/.test(pathname)) return '05';
  if (pathname.startsWith('/events')) return '01';
  if (pathname === '/my-events') return '02';
  if (pathname === '/my-rsvps') return '03';
  if (pathname.startsWith('/admin')) return '07';
  if (pathname === '/styleguide') return '08';
  return '01';
}

function getPageName(pathname: string): string {
  if (/\/events\/[^/]+\/attendees/.test(pathname)) return 'Attendees';
  if (/\/events\/[^/]+\/edit/.test(pathname)) return 'Edit event';
  if (/^\/events\/[^/]+$/.test(pathname)) return 'Event';
  for (const [path, name] of Object.entries(PAGE_NAMES)) {
    if (pathname === path || pathname.startsWith(path + '/')) return name;
  }
  return 'Events';
}

export function Colophon() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const isCover = location.pathname === '/login' || location.pathname === '/register';

  if (isCover) return null;

  const pageNum = getPageNumber(location.pathname);
  const pageName = getPageName(location.pathname);
  const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';
  const isModOrAbove = user?.role === 'Moderator' || isAdmin;

  return (
    <footer className="colophon" data-colophon>
      <div className="colophon__row">
        <span className="colophon__mark" aria-hidden="true">EventNest 祭</span>
        <span className="colophon__stamp tnum">page {pageNum} · {pageName}</span>
      </div>
      <div className="colophon__row">
        <nav className="colophon__links" aria-label="Footer">
          <Link to="/events">Events</Link>
          {isAuthenticated && <Link to="/my-rsvps">My RSVPs</Link>}
          {isAuthenticated && isModOrAbove && <Link to="/my-events">My Events</Link>}
          {isAdmin && <Link to="/admin/users">Users</Link>}
          {isAdmin && <Link to="/admin/roles">Roles</Link>}
          {isModOrAbove && <Link to="/admin/tags">Tags</Link>}
          <Link to="/styleguide">Styleguide</Link>
        </nav>
        <span>A paper-craft festival, built by hand.</span>
      </div>
    </footer>
  );
}
