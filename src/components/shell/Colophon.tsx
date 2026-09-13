import { Link } from 'react-router-dom'

import { useAuth } from '@/features/auth/AuthContext'
import { EventNestPermissions } from '@/lib/permissions'

interface ColophonProps {
  stamp: string
}

export function Colophon({ stamp }: ColophonProps) {
  const { status, user, hasPermission } = useAuth()
  const authed = status === 'authenticated'

  return (
    <footer className="colophon">
      <div className="colophon__row">
        <span className="colophon__mark" aria-hidden="true">
          EventNest 祭
        </span>
        <span className="colophon__stamp tnum">{stamp || 'page · EventNest'}</span>
      </div>
      <div className="colophon__row">
        <nav className="colophon__links" aria-label="Footer">
          <Link to="/events">Events</Link>
          {authed ? <Link to="/my-rsvps">My RSVPs</Link> : null}
          {authed && user?.role !== 'User' ? <Link to="/my-events">My Events</Link> : null}
          {hasPermission(EventNestPermissions.Users.Manage) ? (
            <Link to="/admin/users">Permissions</Link>
          ) : null}
          <Link to="/styleguide">Styleguide</Link>
        </nav>
        <span>A paper-craft festival, built by hand.</span>
      </div>
    </footer>
  )
}
