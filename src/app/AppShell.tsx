import { useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { cn } from '@/lib/cn'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useAuth } from '@/features/auth/AuthContext'
import { useTheme } from './providers/ThemeContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useLiveAnnouncer } from '@/hooks/useLiveAnnouncer'
import { SkipLink } from '@/components/shell/SkipLink'
import { AlbumRail } from '@/components/shell/AlbumRail'
import { Topbar } from '@/components/shell/Topbar'
import { Tabbar } from '@/components/shell/Tabbar'
import { ContentCanvas } from '@/components/shell/ContentCanvas'
import { Colophon } from '@/components/shell/Colophon'
import { OverlayRoot } from '@/components/overlays/OverlayRoot'
import { IndexDrawer } from '@/components/overlays/IndexDrawer'
import { UserMenu } from '@/components/overlays/UserMenu'
import { ToastRegion } from '@/components/overlays/ToastRegion'
import { PaperGrain } from '@/components/decorations/PaperGrain'
import { resolveRouteMeta } from './routerMeta'

export function AppShell() {
  const { pathname } = useLocation()
  const meta = resolveRouteMeta(pathname)
  const cover = /^\/(login|register)$/.test(pathname)
  const indexDrawer = useDisclosure()
  const userMenu = useDisclosure()
  const userChipRef = useRef<HTMLButtonElement | null>(null)
  const { user, logout } = useAuth()
  const { theme } = useTheme()

  useDocumentTitle(meta.title)
  useLiveAnnouncer(meta.liveMessage)

  return (
    <div className={cn('app', cover && 'shell-cover')} data-theme-active={theme}>
      <SkipLink />
      {!cover ? (
        <AlbumRail
          userMenuOpen={userMenu.isOpen}
          onOpenUserMenu={(trigger) => {
            userChipRef.current = trigger
            userMenu.open()
          }}
        />
      ) : null}
      <Topbar cover={cover} onOpenIndex={indexDrawer.open} />
      <ContentCanvas
        template={meta.template}
        density={meta.density}
        width={meta.width}
        animate={meta.animate ?? true}
        footer={!cover ? <Colophon stamp={meta.stamp} /> : null}
      >
        <Outlet />
      </ContentCanvas>
      {!cover ? <Tabbar onOpenIndex={indexDrawer.open} /> : null}
      <OverlayRoot>
        <IndexDrawer
          open={indexDrawer.isOpen}
          onClose={indexDrawer.close}
          triggerRef={userChipRef}
        />
        {user ? (
          <UserMenu
            open={userMenu.isOpen}
            user={user}
            onClose={userMenu.close}
            onLogout={() => {
              void logout()
              userMenu.close()
            }}
            triggerRef={userChipRef}
          />
        ) : null}
      </OverlayRoot>
      <PaperGrain />
      <ToastRegion />
    </div>
  )
}
