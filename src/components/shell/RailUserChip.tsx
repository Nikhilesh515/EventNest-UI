import { Link } from 'react-router-dom'

import { initialsOf } from '@/lib/format'
import type { UserDto } from '@/types'

interface RailUserChipProps {
  user: UserDto | null
  expanded: boolean
  onOpen: (trigger: HTMLButtonElement) => void
}

export function RailUserChip({ user, expanded, onOpen }: RailUserChipProps) {
  if (!user) {
    return (
      <div className="rail-anon">
        <Link className="btn btn--primary" to="/login">
          Log in
        </Link>
        <Link className="btn btn--secondary" to="/register">
          Sign up
        </Link>
      </div>
    )
  }

  return (
    <button
      type="button"
      className="rail-user"
      aria-haspopup="menu"
      aria-expanded={expanded}
      aria-label={`Account menu for ${user.displayName}`}
      onClick={(event) => onOpen(event.currentTarget)}
    >
      <span className="rail-user__avatar" aria-hidden="true">
        {initialsOf(user.displayName)}
      </span>
      <span className="rail-user__text">
        <span className="rail-user__name">{user.displayName}</span>
        <span className="rail-user__role">
          {user.role}
          {user.role !== 'User' ? ' · 手帳' : ''}
        </span>
      </span>
    </button>
  )
}
