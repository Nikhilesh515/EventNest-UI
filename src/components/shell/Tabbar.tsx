import { Link, useLocation } from 'react-router-dom'

import { Icon } from '@/components/icons/Icon'
import { useAuth } from '@/features/auth/AuthContext'
import { EventNestPermissions, isAdminRole } from '@/lib/permissions'
import type { IconName } from '@/types'

interface TabbarProps {
  onOpenIndex: () => void
}

interface Tab {
  icon: IconName
  label: string
  href: string
  match: (pathname: string) => boolean
}

export function Tabbar({ onOpenIndex }: TabbarProps) {
  const { pathname } = useLocation()
  const { status, user, hasPermission } = useAuth()
  const authed = status === 'authenticated'

  const tabs: Tab[] = [
    {
      icon: 'calendar',
      label: 'Events',
      href: '/events',
      match: (p) => p === '/events' || /^\/events\/[^/]+(\/attendees)?$/.test(p),
    },
  ]

  if (!authed) {
    tabs.push({ icon: 'user', label: 'Log in', href: '/login', match: (p) => p === '/login' })
  } else {
    if (user?.role !== 'User') {
      tabs.push({
        icon: 'users',
        label: 'My events',
        href: '/my-events',
        match: (p) => p === '/my-events',
      })
    }
    tabs.push({
      icon: 'ticket',
      label: 'My RSVPs',
      href: '/my-rsvps',
      match: (p) => p === '/my-rsvps',
    })
    if (hasPermission(EventNestPermissions.Events.Create)) {
      tabs.push({
        icon: 'plus',
        label: 'Create',
        href: '/events/create',
        match: (p) => /^\/events\/(create|[^/]+\/edit)/.test(p),
      })
    }
    if (isAdminRole(user?.role) || hasPermission(EventNestPermissions.Tags.View)) {
      tabs.push({
        icon: 'gear',
        label: 'System',
        href: isAdminRole(user?.role) ? '/admin/users' : '/admin/tags',
        match: (p) => p.startsWith('/admin'),
      })
    }
  }

  return (
    <nav className="tabbar" aria-label="Primary">
      {tabs.map((tab) => {
        const active = tab.match(pathname)
        return (
          <Link
            key={tab.href}
            className="tab-item"
            to={tab.href}
            aria-current={active ? 'page' : undefined}
          >
            <Icon name={tab.icon} size={22} />
            <span className="tab-item__label">{tab.label}</span>
          </Link>
        )
      })}
      <button
        type="button"
        className="tab-item"
        aria-haspopup="dialog"
        aria-controls="index-drawer"
        onClick={onOpenIndex}
      >
        <Icon name={authed ? 'moon-lantern' : 'user'} size={22} />
        <span className="tab-item__label">Index</span>
      </button>
    </nav>
  )
}
