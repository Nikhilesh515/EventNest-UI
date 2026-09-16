import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { AppShell } from '@/app/AppShell'
import { RouteErrorBoundary } from '@/app/layout/RouteErrorBoundary'
import { RequireAuth } from '@/app/guards/RequireAuth'
import { RequireAnonymous } from '@/app/guards/RequireAnonymous'
import { RequirePermission } from '@/app/guards/RequirePermission'
import { RequireRole } from '@/app/guards/RequireRole'
import { KoiLoader } from '@/components/states/KoiLoader'
import { ADMIN_ROLES, EventNestPermissions } from '@/lib/permissions'
import { env } from '@/lib/env'

const EventsPage = lazy(() => import('@/pages/EventsPage'))
const EventDetailPage = lazy(() => import('@/pages/EventDetailPage'))
const EventCreatePage = lazy(() => import('@/pages/EventCreatePage'))
const EventEditPage = lazy(() => import('@/pages/EventEditPage'))
const AttendeesPage = lazy(() => import('@/pages/AttendeesPage'))
const MyEventsPage = lazy(() => import('@/pages/MyEventsPage'))
const MyRsvpsPage = lazy(() => import('@/pages/MyRsvpsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const TagAdminPage = lazy(() => import('@/pages/TagAdminPage'))
const UserAdminPage = lazy(() => import('@/pages/UserAdminPage'))
const UserPermissionsPage = lazy(() => import('@/pages/UserPermissionsPage'))
const RoleAdminPage = lazy(() => import('@/pages/RoleAdminPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const StyleguidePage = lazy(() => import('@/pages/StyleguidePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const suspense = (node: ReactNode) => (
  <Suspense fallback={<KoiLoader label="Turning the page…" size="lg" />}>{node}</Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/events" replace /> },
      { path: 'login', element: <RequireAnonymous>{suspense(<LoginPage />)}</RequireAnonymous> },
      {
        path: 'register',
        element: <RequireAnonymous>{suspense(<RegisterPage />)}</RequireAnonymous>,
      },
      { path: 'events', element: suspense(<EventsPage />) },
      {
        path: 'events/create',
        element: (
          <RequirePermission permission={EventNestPermissions.Events.Create}>
            {suspense(<EventCreatePage />)}
          </RequirePermission>
        ),
      },
      { path: 'events/:id', element: suspense(<EventDetailPage />) },
      {
        path: 'events/:id/edit',
        element: (
          <RequirePermission permission={EventNestPermissions.Events.Edit}>
            {suspense(<EventEditPage />)}
          </RequirePermission>
        ),
      },
      {
        path: 'events/:id/attendees',
        element: (
          <RequirePermission permission={EventNestPermissions.RSVPs.Manage}>
            {suspense(<AttendeesPage />)}
          </RequirePermission>
        ),
      },
      { path: 'my-events', element: <RequireAuth>{suspense(<MyEventsPage />)}</RequireAuth> },
      { path: 'my-rsvps', element: <RequireAuth>{suspense(<MyRsvpsPage />)}</RequireAuth> },
      { path: 'profile', element: <RequireAuth>{suspense(<ProfilePage />)}</RequireAuth> },
      {
        path: 'admin/tags',
        element: (
          <RequirePermission permission={EventNestPermissions.Tags.View}>
            {suspense(<TagAdminPage />)}
          </RequirePermission>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <RequirePermission permission={EventNestPermissions.Users.View}>
            <RequireRole roles={ADMIN_ROLES}>{suspense(<UserAdminPage />)}</RequireRole>
          </RequirePermission>
        ),
      },
      {
        path: 'admin/users/:id/permissions',
        element: (
          <RequirePermission permission={EventNestPermissions.Users.Manage}>
            <RequireRole roles={ADMIN_ROLES}>{suspense(<UserPermissionsPage />)}</RequireRole>
          </RequirePermission>
        ),
      },
      {
        path: 'admin/roles',
        element: (
          <RequirePermission permission={EventNestPermissions.Users.View}>
            <RequireRole roles={ADMIN_ROLES}>{suspense(<RoleAdminPage />)}</RequireRole>
          </RequirePermission>
        ),
      },
      ...(env.enableStyleguide
        ? [{ path: 'styleguide', element: suspense(<StyleguidePage />) }]
        : []),
      { path: '*', element: suspense(<NotFoundPage />) },
    ],
  },
])
