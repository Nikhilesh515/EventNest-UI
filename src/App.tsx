import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router';
import { useState } from 'react';
import { SkipLink } from './components/SkipLink';
import { AlbumRail } from './components/AlbumRail';
import { IndexDrawer } from './components/IndexDrawer';
import { TopBar } from './components/TopBar';
import { TabBar } from './components/TabBar';
import { Colophon } from './components/Colophon';
import { ShellClassManager } from './components/ShellClassManager';
import { RequireAuth } from './components/RequireAuth';
import { RequireAnonymous } from './components/RequireAnonymous';
import { RequireRole } from './components/RequireRole';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { MyEventsPage } from './pages/MyEventsPage';
import { MyRsvpsPage } from './pages/MyRsvpsPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { EditEventPage } from './pages/EditEventPage';
import { AttendeesPage } from './pages/AttendeesPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminRolesPage } from './pages/AdminRolesPage';
import { AdminTagsPage } from './pages/AdminTagsPage';
import './styles/tokens.css';
import './styles/tailwind.css';
import './styles/app.css';
import './styles/views.css';

interface RouteMeta {
  template: string;
  density: 'festival' | 'work' | 'admin';
}

function routeMeta(pathname: string): RouteMeta {
  if (pathname === '/login' || pathname === '/register') {
    return { template: 'template--cover', density: 'festival' };
  }
  if (pathname === '/events/new' || /^\/events\/[^/]+\/edit$/.test(pathname)) {
    return { template: 'template--clipboard', density: 'work' };
  }
  if (/^\/events\/[^/]+\/attendees$/.test(pathname)) {
    return { template: 'template--guestbook', density: 'work' };
  }
  if (/^\/events\/[^/]+$/.test(pathname)) {
    return { template: 'template--spread', density: 'festival' };
  }
  if (pathname === '/my-events' || pathname === '/my-rsvps') {
    return { template: 'template--notebook', density: 'work' };
  }
  if (pathname === '/admin/users' || pathname === '/admin/tags' || pathname === '/admin/roles') {
    return { template: 'template--ledger', density: 'admin' };
  }
  if (pathname === '/styleguide') {
    return { template: 'template--guide', density: 'festival' };
  }
  return { template: 'template--collage', density: 'festival' };
}

function Shell() {
  const location = useLocation();
  const { template, density } = routeMeta(location.pathname);
  const [indexOpen, setIndexOpen] = useState(false);

  return (
    <>
      <ShellClassManager />
      <SkipLink />
      <TopBar indexOpen={indexOpen} onOpenIndex={() => setIndexOpen(true)} />
      <AlbumRail />
      <IndexDrawer open={indexOpen} onClose={() => setIndexOpen(false)} />
      <main id="main-view" className="content-canvas" data-view data-density={density} tabIndex={-1}>
        <div className={`template ${template}`} data-template>
          <Routes>
            <Route path="/login" element={<RequireAnonymous><LoginPage /></RequireAnonymous>} />
            <Route path="/register" element={<RequireAnonymous><RegisterPage /></RequireAnonymous>} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/new" element={<RequireAuth><CreateEventPage /></RequireAuth>} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/events/:id/edit" element={<RequireAuth><EditEventPage /></RequireAuth>} />
            <Route path="/events/:id/attendees" element={<RequireAuth><AttendeesPage /></RequireAuth>} />
            <Route path="/my-events" element={<RequireAuth><MyEventsPage /></RequireAuth>} />
            <Route path="/my-rsvps" element={<RequireAuth><MyRsvpsPage /></RequireAuth>} />
            <Route path="/admin/users" element={<RequireAuth><RequireRole roles={['Admin', 'SuperAdmin']}><AdminUsersPage /></RequireRole></RequireAuth>} />
            <Route path="/admin/permissions" element={<Navigate to="/admin/users" replace />} />
            <Route path="/admin/roles" element={<RequireAuth><RequireRole roles={['Admin', 'SuperAdmin']}><AdminRolesPage /></RequireRole></RequireAuth>} />
            <Route path="/admin/tags" element={<RequireAuth><RequireRole roles={['Admin', 'SuperAdmin', 'Moderator']}><AdminTagsPage /></RequireRole></RequireAuth>} />
            <Route path="/styleguide" element={<div className="page-doc"><div className="page-doc__content"><h1>Styleguide</h1></div></div>} />
            <Route path="*" element={<EventsPage />} />
          </Routes>
        </div>
        <Colophon />
      </main>
      <TabBar indexOpen={indexOpen} onOpenIndex={() => setIndexOpen(true)} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
