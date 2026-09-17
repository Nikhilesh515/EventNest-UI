# EventNest Frontend

React single-page app for EventNest: browse and filter events, RSVP, manage your
own events, and administer users, roles, tags, and permissions.

## About the Project

- **Discovery** — search, tag/visibility/status filters, timeframe tabs,
  sorting, and paging.
- **Event management** — create and edit drafts, publish, cancel, complete, and
  review attendee rosters.
- **RSVPs** — Going / Maybe / Not Going / Cancelled with capacity feedback.
- **Account** — register, log in, edit display name, view effective permissions.
- **Administration** — user directory, role editor, tag management, permission
  grants.
- **Theming** — light/dark "night stalls" theme.

The visual design is a paper-craft festival scrapbook ("Kawaii Matsuri"),
implemented with a token-driven CSS system rather than a component library.

**Stack:** React 19 · Vite 8 · TypeScript 6 · React Router 6 · TanStack Query 5 ·
Axios · react-hot-toast · Tailwind CSS 3 (bridged tokens).

## Engineering Decisions

### React 19 + Vite 8, no SSR
SPA only, no meta-framework. Pages are lazily loaded per route.

### Token-driven CSS design system, Tailwind as a utility layer
`src/styles/tokens.css` is the source of truth; `tailwind.config.ts` bridges the
tokens and disables Tailwind's preflight. Dark mode is `data-theme="dark"` on
`<html>`, applied by an inline script before first paint to avoid a flash.

### TanStack Query owns server state
Query defaults keep data fresh for 30 seconds, with per-feature query keys and
explicit invalidation after mutations. No global client store beyond theme and
auth context.

### Axios client with envelope unwrapping and single-flight refresh
`src/api/client.ts` unwraps the API envelope and normalizes errors into an
`AppApiError`. A 401 outside `/api/auth/**` triggers one shared refresh and
replays the original request once.

### Access token in memory, refresh token in an HttpOnly cookie
The access token lives in a module variable (`src/lib/storage.ts`) and is never
persisted. The refresh token is an HttpOnly, SameSite=Lax cookie
(`eventnest.refresh_token`, scoped to `/api/auth`) that browser scripts cannot
read.

### Feature-folder architecture
Code is grouped by feature (`src/features/{auth,events,rsvps,tags,users,roles,permissions}`),
with shared UI in `src/components`, app shell and providers in `src/app`, and
pages in `src/pages`. The `@` alias points at `src`.

### Route guards
`RequireAuth`, `RequireAnonymous`, `RequirePermission`, `RequireRole`, and
`RequireOwner` handle redirects and access-denied states. Unauthorized actions
are hidden rather than disabled.

### MSW for unit tests, Playwright for journeys
Unit tests mock the API with Mock Service Worker; end-to-end specs stub network
routes and exercise real routing and guards.

## Routes

| Path | Page | Access |
|---|---|---|
| `/` | redirect | to `/events` |
| `/events` | Events | public |
| `/events/:id` | Event detail | public (published events) |
| `/login`, `/register` | Auth | anonymous only |
| `/events/create` | Create event | `Events.Create` |
| `/events/:id/edit` | Edit event | `Events.Edit` + owner |
| `/events/:id/attendees` | Attendees | `RSVPs.Manage` + owner |
| `/my-events` | My events | authenticated |
| `/my-rsvps` | My RSVPs | authenticated |
| `/profile` | Profile | authenticated |
| `/admin/tags` | Tag admin | `Tags.View` |
| `/admin/users` | User admin | `Users.View` + Admin/SuperAdmin |
| `/admin/users/:id/permissions` | Permission editor | `Users.Manage` + Admin/SuperAdmin |
| `/admin/roles` | Role admin | `Users.View` + Admin/SuperAdmin |
| `/styleguide` | Styleguide | dev only (`VITE_ENABLE_STYLEGUIDE`) |
| `*` | Not found | public |

## Auth and Session

- **Login/register** return an access token in the response body; the app keeps
  it in memory. The API sets the refresh token as an HttpOnly cookie.
- **Bootstrap** on load: if no access token is in memory, the app calls
  `POST /api/auth/refresh` (cookie), stores the new access token, then loads
  `GET /api/users/me` and the user's effective permissions.
- **Silent refresh** on 401: requests outside `/api/auth/**` get one
  refresh-and-replay.
- **Permissions** come from `GET /api/permissions/user/{id}`. Regular users
  receive 403 from that admin-facing endpoint, so the UI falls back to built-in
  role defaults.
- **Logout** revokes the refresh token server-side and clears memory and query
  caches.

## Setup

Prerequisites: Node.js 22+ and npm 10+, plus a running backend (the Docker
bundle exposes the gateway at `http://localhost:5000`).

```powershell
npm install
npm run dev        # http://localhost:5173
```

In development the app calls the gateway directly at `http://localhost:5000`
(the gateway's CORS allows `http://localhost:5173`). In production the app is
served by nginx in the Docker bundle and calls `/api` on the same origin, so no
CORS is involved.

## Environment Variables

| File | Variable | Value |
|---|---|---|
| `.env.development` | `VITE_API_URL` | `http://localhost:5000` |
| `.env.development` | `VITE_ENABLE_STYLEGUIDE` | `true` |
| `.env.production` | `VITE_API_URL` | empty — same-origin requests |
| `.env.production` | `VITE_ENABLE_STYLEGUIDE` | `false` |

An empty `VITE_API_URL` is intentional: axios then issues relative URLs and the
nginx reverse proxy handles `/api` on the same origin. If the variable is
absent entirely (not just empty), the app falls back to
`http://localhost:5000`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server (port 5173, strict) |
| `npm run build` | Typecheck (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | ESLint |
| `npm run format` / `format:check` | Prettier write / verify |
| `npm test` | Vitest single run |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Vitest with coverage (70/70/60/70 thresholds) |
| `npm run test:e2e` | Playwright end-to-end suite |
| `npm run test:e2e:headed` | Playwright with a visible browser |

## Testing

- **Unit/component** — Vitest and Testing Library with Mock Service Worker
  handling `/api/**`; unhandled requests fail the test.
- **End-to-end** — Playwright specs in `e2e/` start the dev server
  automatically. Authenticated specs stub `POST /api/auth/refresh` with a 204,
  so the app must tolerate an empty refresh response.

## Production Build and Docker

`npm run build` emits static assets in `dist/`. In the Docker bundle
(`EventNest-DotNetRec`), `docker/ui.Dockerfile` builds this project and serves
`dist/` with nginx, which also reverse-proxies `/api` to the gateway and falls
back to `index.html` for client-side routes.

## Business Assumptions

- Web-only single-tenant app; no native/PWA/offline support, English only.
- Visitors can browse published events anonymously; an account is required to
  create events or RSVP.
- Events are free — no payment or ticketing flows.
- One RSVP per user per event; capacity and RSVP statuses are enforced by the
  API.
- No file uploads, rich text, email, or realtime updates; action visibility is
  driven by the fixed 15-permission catalog.
