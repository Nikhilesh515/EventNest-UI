import { useLocation } from 'react-router-dom'

import { useAuth } from '@/features/auth/AuthContext'
import { RailCover } from './RailCover'
import { RailIndex } from './RailIndex'
import { RailUserChip } from './RailUserChip'
import { ThemeToggle } from './ThemeToggle'

interface AlbumRailProps {
  onOpenUserMenu: (trigger: HTMLButtonElement) => void
  userMenuOpen?: boolean
}

export function AlbumRail({ onOpenUserMenu, userMenuOpen }: AlbumRailProps) {
  const { pathname } = useLocation()
  const { user } = useAuth()

  return (
    <aside className="album-rail" aria-label="Album">
      <RailCover />
      <RailIndex activePath={pathname} />
      <div className="album-rail__foot">
        <RailUserChip
          user={user}
          expanded={Boolean(userMenuOpen)}
          onOpen={onOpenUserMenu}
        />
        <ThemeToggle variant="rail" />
      </div>
    </aside>
  )
}
