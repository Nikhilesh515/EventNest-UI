import { BrowserRouter, Routes, Route } from 'react-router';
import { SkipLink } from './components/SkipLink';
import { AlbumRail } from './components/AlbumRail';
import { TopBar } from './components/TopBar';
import { TabBar } from './components/TabBar';
import { Colophon } from './components/Colophon';
import { ShellClassManager } from './components/ShellClassManager';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { MyEventsPage } from './pages/MyEventsPage';
import { MyRsvpsPage } from './pages/MyRsvpsPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { EditEventPage } from './pages/EditEventPage';
import { AttendeesPage } from './pages/AttendeesPage';
import { AdminPermissionsPage } from './pages/AdminPermissionsPage';
import { AdminTagsPage } from './pages/AdminTagsPage';
import './styles/tokens.css';
import './styles/tailwind.css';
import './styles/app.css';
import './styles/views.css';

export default function App() {
  return (
    <BrowserRouter>
      <ShellClassManager />
      <SkipLink />
      <TopBar />
      <AlbumRail />
      <main id="main-view" className="content-canvas" data-view tabIndex={-1}>
        <div className="template" data-template>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/new" element={<CreateEventPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/events/:id/edit" element={<EditEventPage />} />
            <Route path="/events/:id/attendees" element={<AttendeesPage />} />
            <Route path="/my-events" element={<MyEventsPage />} />
            <Route path="/my-rsvps" element={<MyRsvpsPage />} />
            <Route path="/admin/permissions" element={<AdminPermissionsPage />} />
            <Route path="/admin/tags" element={<AdminTagsPage />} />
            <Route path="/styleguide" element={<div className="page-doc"><div className="page-doc__content"><h1>Styleguide</h1></div></div>} />
            <Route path="*" element={<EventsPage />} />
          </Routes>
        </div>
        <Colophon />
      </main>
      <TabBar />
    </BrowserRouter>
  );
}
