import { Link } from 'react-router-dom'

import { useAuth } from '@/features/auth/AuthContext'
import { env } from '@/lib/env'
import { EventNestPermissions, isAdminRole } from '@/lib/permissions'

interface ColophonProps {
  stamp: string
}

export function Colophon({ stamp }: ColophonProps) {
  const { status, user, hasPermission } = useAuth()
  const authed = status === 'authenticated'
  const isAdmin = isAdminRole(user?.role)

  return (
    <footer className="colophon">
      <div className="colophon__row">
        <span className="colophon__mark" aria-hidden="true">
          EventNest ·
        </span>
        <span className="colophon__stamp tnum">{stamp || 'page · EventNest'}</span>
      </div>
      <div className="colophon__row">
        <nav className="colophon__links" aria-label="Footer">
          <Link to="/events">Events</Link>
          {authed ? <Link to="/my-rsvps">My RSVPs</Link> : null}
          {authed && user?.role !== 'User' ? <Link to="/my-events">My Events</Link> : null}
          {isAdmin ? (
            <>
              <Link to="/admin/users">Users</Link>
              <Link to="/admin/roles">Roles</Link>
            </>
          ) : null}
          {hasPermission(EventNestPermissions.Tags.View) ? (
            <Link to="/admin/tags">Tags</Link>
          ) : null}
          {env.enableStyleguide ? <Link to="/styleguide">Styleguide</Link> : null}
        </nav>
        <span>A paper-craft festival, built by hand.</span>
      </div>
    </footer>
  )
}
