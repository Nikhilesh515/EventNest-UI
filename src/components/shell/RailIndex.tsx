import { useAuth } from '@/features/auth/AuthContext'
import { EventNestPermissions } from '@/lib/permissions'
import { activeAlbumPage, currentEventId } from '@/lib/routes'
import { IndexTab } from './IndexTab'
import type { IconName } from '@/types'

interface Destination {
  page: string
  icon: IconName
  label: string
  href: string
  show: boolean
}

interface RailIndexProps {
  activePath: string
  onNavigate?: () => void
}

export function RailIndex({ activePath, onNavigate }: RailIndexProps) {
  const { status, user, hasPermission } = useAuth()
  const authed = status === 'authenticated'
  const role = user?.role
  const eventId = currentEventId(activePath)
  const active = activeAlbumPage(activePath)

  const destinations: Destination[] = [
    { page: '01', icon: 'calendar', label: 'Events', href: '/events', show: true },
    {
      page: '02',
      icon: 'users',
      label: 'My events',
      href: '/my-events',
      show: authed && role !== 'User',
    },
    { page: '03', icon: 'ticket', label: 'My RSVPs', href: '/my-rsvps', show: authed },
    {
      page: '04',
      icon: 'plus',
      label: 'Create event',
      href: '/events/create',
      show: hasPermission(EventNestPermissions.Events.Create),
    },
    {
      page: '05',
      icon: 'users',
      label: 'Attendees',
      href: eventId ? `/events/${eventId}/attendees` : '/events',
      show: hasPermission(EventNestPermissions.RSVPs.Manage) && Boolean(eventId),
    },
    {
      page: '06',
      icon: 'star',
      label: 'Permissions',
      href: '/admin/users',
      show: hasPermission(EventNestPermissions.Users.Manage),
    },
    {
      page: '07',
      icon: 'tag',
      label: 'Tags',
      href: '/admin/tags',
      show: hasPermission(EventNestPermissions.Tags.View),
    },
    { page: '08', icon: 'moon-lantern', label: 'Styleguide', href: '/styleguide', show: true },
    { page: '09', icon: 'user', label: 'Log in', href: '/login', show: !authed },
    { page: '10', icon: 'user', label: 'Register', href: '/register', show: !authed },
  ]

  return (
    <nav className="album-index" aria-label="Album index">
      <p className="album-index__label" aria-hidden="true">
        INDEX
      </p>
      <ul className="album-index__list">
        {destinations
          .filter((destination) => destination.show)
          .map((destination) => (
            <IndexTab
              key={destination.page}
              page={destination.page}
              icon={destination.icon}
              label={destination.label}
              href={destination.href}
              active={active === destination.page}
              onNavigate={onNavigate}
            />
          ))}
      </ul>
    </nav>
  )
}
