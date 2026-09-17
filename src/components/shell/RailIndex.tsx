import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { EventNestPermissions, isAdminRole } from '@/lib/permissions'
import { activeAlbumPage, currentEventId } from '@/lib/routes'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/icons/Icon'
import { IndexTab } from './IndexTab'
import type { IconName } from '@/types'

interface Destination {
  page: string
  icon: IconName
  label: string
  href: string
  show: boolean
}

interface SystemChild {
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
  const isAdmin = isAdminRole(role)

  const allSystemChildren: SystemChild[] = [
    { icon: 'users', label: 'Users', href: '/admin/users', show: authed && isAdmin },
    { icon: 'gear', label: 'Roles', href: '/admin/roles', show: authed && isAdmin },
    {
      icon: 'tag',
      label: 'Tags',
      href: '/admin/tags',
      show: hasPermission(EventNestPermissions.Tags.View),
    },
  ]

  const systemChildren = allSystemChildren.filter((child) => child.show)

  const [expanded, setExpanded] = useState(() => activePath.startsWith('/admin'))

  useEffect(() => {
    if (activePath.startsWith('/admin')) setExpanded(true)
  }, [activePath])

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
    { page: '08', icon: 'user', label: 'Log in', href: '/login', show: !authed },
    { page: '09', icon: 'user', label: 'Register', href: '/register', show: !authed },
  ]

  const renderTab = (destination: Destination) => (
    <IndexTab
      key={destination.page}
      page={destination.page}
      icon={destination.icon}
      label={destination.label}
      href={destination.href}
      active={active === destination.page}
      onNavigate={onNavigate}
    />
  )

  return (
    <nav className="album-index" aria-label="Album index">
      <p className="album-index__label" aria-hidden="true">
        INDEX
      </p>
      <ul className="album-index__list">
        {destinations.filter((d) => d.show && Number(d.page) < 6).map(renderTab)}
        {systemChildren.length > 0 ? (
          <li className="index-group">
            <button
              type="button"
              className={cn(
                'index-tab',
                'index-tab--group',
                active === '06' && 'index-tab--group-active',
              )}
              aria-expanded={expanded}
              aria-controls="index-system-list"
              title="Page 06, System"
              aria-label="Page 06, System"
              onClick={() => setExpanded((value) => !value)}
            >
              <span className="index-tab__num tnum" aria-hidden="true">
                06
              </span>
              <Icon name="gear" size={20} />
              <span className="index-tab__label">System</span>
              <Icon
                name={expanded ? 'chevron-down' : 'chevron-right'}
                size={16}
                className="index-tab__chev"
              />
            </button>
            {expanded ? (
              <ul className="index-group__list" id="index-system-list">
                {systemChildren.map((child) => {
                  const childActive =
                    activePath === child.href || activePath.startsWith(`${child.href}/`)
                  return (
                    <li key={child.href}>
                      <Link
                        className="index-tab index-tab--child"
                        to={child.href}
                        aria-current={childActive ? 'page' : undefined}
                        onClick={onNavigate}
                      >
                        <Icon name={child.icon} size={18} />
                        <span className="index-tab__label">{child.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </li>
        ) : null}
        {destinations.filter((d) => d.show && Number(d.page) >= 7).map(renderTab)}
      </ul>
    </nav>
  )
}
