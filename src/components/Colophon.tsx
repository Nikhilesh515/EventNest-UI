import { useLocation } from 'react-router';

const PAGE_NAMES: Record<string, string> = {
  '/events': 'Events',
  '/my-events': 'My events',
  '/my-rsvps': 'My RSVPs',
  '/events/new': 'Create event',
  '/admin/permissions': 'Permissions',
  '/admin/tags': 'Tags',
  '/styleguide': 'Styleguide',
};

function getPageNumber(pathname: string): string {
  if (pathname === '/events/new' || /\/events\/[^/]+\/edit/.test(pathname)) return '04';
  if (/\/events\/[^/]+\/attendees/.test(pathname)) return '05';
  if (pathname.startsWith('/events')) return '01';
  if (pathname === '/my-events') return '02';
  if (pathname === '/my-rsvps') return '03';
  if (pathname === '/admin/permissions') return '06';
  if (pathname === '/admin/tags') return '07';
  if (pathname === '/styleguide') return '08';
  return '01';
}

function getPageName(pathname: string): string {
  for (const [path, name] of Object.entries(PAGE_NAMES)) {
    if (pathname === path || pathname.startsWith(path + '/')) return name;
  }
  return 'Events';
}

export function Colophon() {
  const location = useLocation();
  const isCover = location.pathname === '/login' || location.pathname === '/register';

  if (isCover) return null;

  const pageNum = getPageNumber(location.pathname);
  const pageName = getPageName(location.pathname);

  return (
    <footer className="colophon" data-colophon>
      <div className="colophon__inner">
        <p className="colophon__stamp">
          · page {pageNum} · {pageName}
        </p>
        <p className="colophon__links">
          Events · My RSVPs · My Events · Permissions · Tags
        </p>
        <p className="colophon__tagline">
          A paper-craft festival, built by hand.
        </p>
      </div>
    </footer>
  );
}
