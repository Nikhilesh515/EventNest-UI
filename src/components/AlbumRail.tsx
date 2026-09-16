import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '../lib/auth-store';
import { ThemeToggle } from './ThemeToggle';
import { Icon, type IconName } from './Icon';

interface IndexTab {
  page: string;
  icon: IconName;
  label: string;
  href: string;
}

function getActivePage(pathname: string): string {
  if (pathname === '/events/new' || /^\/events\/[^/]+\/edit$/.test(pathname)) return '04';
  if (/^\/events\/[^/]+\/attendees$/.test(pathname)) return '05';
  if (pathname.startsWith('/events')) return '01';
  if (pathname === '/my-events') return '02';
  if (pathname === '/my-rsvps') return '03';
  if (pathname.startsWith('/admin')) return '07';
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

export function AlbumIndexContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const activePage = getActivePage(location.pathname);
  const [systemExpanded, setSystemExpanded] = useState(location.pathname.startsWith('/admin'));

  const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';
  const isModOrAbove = user?.role === 'Moderator' || isAdmin;

  const tabs: IndexTab[] = [
    { page: '01', icon: 'calendar', label: 'Events', href: '/events' },
    { page: '02', icon: 'users', label: 'My events', href: '/my-events' },
    { page: '03', icon: 'ticket', label: 'My RSVPs', href: '/my-rsvps' },
    { page: '04', icon: 'plus', label: 'Create event', href: '/events/new' },
    { page: '08', icon: 'moon-lantern', label: 'Styleguide', href: '/styleguide' },
    { page: '09', icon: 'user', label: 'Log in', href: '/login' },
    { page: '10', icon: 'user', label: 'Register', href: '/register' },
  ];

  const visibleTabs = tabs.filter((tab) => {
    if (tab.page === '09' || tab.page === '10') return !isAuthenticated;
    if (tab.page === '02') return isAuthenticated && isModOrAbove;
    if (tab.page === '04') return isAuthenticated && isAdmin;
    return true;
  });

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function handleSystemToggle() {
    setSystemExpanded(!systemExpanded);
  }

  return (
    <>
      <div className="album-rail__cover">
        <div className="album-rail__cover-tile pattern pattern--chiyogami-hana" aria-hidden="true" />
        <Link className="album-rail__brand" to="/events" aria-label="EventNest home">
          <span className="wordmark">EventNest</span>
          <span className="hanko hanko--sm" aria-hidden="true">祭</span>
          <span className="album-rail__edition" aria-hidden="true">Vol. 01 · Scrapbook</span>
        </Link>
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
                onClick={onNavigate}
              >
                <span className="index-tab__num tnum" aria-hidden="true">{tab.page}</span>
                <Icon name={tab.icon} size={20} />
                <span className="index-tab__label">{tab.label}</span>
              </Link>
            </li>
          ))}
          {isAuthenticated && isAdmin && (
            <li>
              <button
                type="button"
                className={`index-tab${activePage === '07' ? ' is-active' : ''}`}
                data-page="07"
                aria-expanded={systemExpanded}
                onClick={handleSystemToggle}
                style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <span className="index-tab__num tnum" aria-hidden="true">07</span>
                <Icon name="star" size={20} />
                <span className="index-tab__label">System</span>
              </button>
              {systemExpanded && (
                <ul style={{ paddingLeft: 'var(--space-4)', marginTop: 'var(--space-1)' }}>
                  <li>
                    <Link
                      className={`index-tab${location.pathname === '/admin/users' ? ' is-active' : ''}`}
                      to="/admin/users"
                      onClick={onNavigate}
                      style={{ paddingLeft: 'var(--space-2)' }}
                    >
                      <Icon name="users" size={16} />
                      <span className="index-tab__label">Users</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`index-tab${location.pathname === '/admin/roles' ? ' is-active' : ''}`}
                      to="/admin/roles"
                      onClick={onNavigate}
                      style={{ paddingLeft: 'var(--space-2)' }}
                    >
                      <Icon name="users" size={16} />
                      <span className="index-tab__label">Roles</span>
                    </Link>
                  </li>
                  {isModOrAbove && (
                    <li>
                      <Link
                        className={`index-tab${location.pathname === '/admin/tags' ? ' is-active' : ''}`}
                        to="/admin/tags"
                        onClick={onNavigate}
                        style={{ paddingLeft: 'var(--space-2)' }}
                      >
                        <Icon name="tag" size={16} />
                        <span className="index-tab__label">Tags</span>
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>

      <div className="album-rail__foot">
        {isAuthenticated && user ? (
          <>
            <button type="button" className="rail-user" aria-haspopup="menu" aria-expanded="false" aria-label={`Account menu for ${user.name}`}>
              <span className="rail-user__avatar" aria-hidden="true">{getInitials(user.name)}</span>
              <span className="rail-user__text">
                <span className="rail-user__name">{user.name}</span>
                <span className="rail-user__role">{user.role}{isModOrAbove ? ' · 手帳' : ''}</span>
              </span>
            </button>
            <button type="button" className="btn btn--secondary btn--sm" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <div className="rail-anon">
            <Link className="btn btn--primary" to="/login">Log in</Link>
            <Link className="btn btn--secondary" to="/register">Sign up</Link>
          </div>
        )}
        <ThemeToggle />
      </div>
    </>
  );
}

export function AlbumRail() {
  const location = useLocation();
  const isCover = location.pathname === '/login' || location.pathname === '/register';

  if (isCover) return null;

  return (
    <aside className="album-rail" data-rail aria-label="Album">
      <AlbumIndexContent />
    </aside>
  );
}
