import { useLocation } from 'react-router-dom'

import { useAuth } from '@/features/auth/AuthContext'
import { RailCover } from '@/components/shell/RailCover'
import { RailIndex } from '@/components/shell/RailIndex'
import { RailUserChip } from '@/components/shell/RailUserChip'
import { ThemeToggle } from '@/components/shell/ThemeToggle'
import { Drawer } from './Drawer'
import type { RefObject } from 'react'

interface IndexDrawerProps {
  open: boolean
  onClose: () => void
  triggerRef: RefObject<HTMLElement | null>
}

export function IndexDrawer({ open, onClose, triggerRef }: IndexDrawerProps) {
  const { pathname } = useLocation()
  const { user } = useAuth()

  return (
    <Drawer open={open} label="Album index" title="Album index" onClose={onClose} initialFocusRef={triggerRef}>
      <RailCover />
      <RailIndex activePath={pathname} onNavigate={onClose} />
      <div className="album-rail__foot">
        <RailUserChip user={user} expanded={false} onOpen={() => undefined} />
        <ThemeToggle variant="rail" />
      </div>
    </Drawer>
  )
}
