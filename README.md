# EventNest Frontend

React single-page application for the EventNest event management platform. Provides the user interface for browsing events, managing RSVPs, creating and editing events, and administrative operations.

## About the Project

EventNest is a full-stack event planning application. This repository contains the frontend SPA that consumes the EventNest backend API.

**Core capabilities:**

- Event browsing with search, tag filtering, status filtering, and pagination
- RSVP submission and management (Going, Maybe, Not Going)
- Event creation and editing with draft/publish workflow
- User registration and JWT authentication with automatic token refresh
- Admin panels for user management, role assignment, permission grants, and tag management
- Light/dark theme toggle with system preference detection

**Design:** "Kawaii Matsuri Scrapbook Album" aesthetic — a Japanese festival-inspired scrapbook theme with polaroid collages, washi tape decorations, binding creases, and mosaic grid layouts.

**Tech stack:** React 19, Vite 8, TypeScript 6, Tailwind CSS v4, Zustand, TanStack React Query

## Engineering Decisions

### React 19 + Vite 8

React 19 provides the latest concurrent features and hooks. Vite 8 delivers instant hot module replacement, ESM-native dev server, and optimized production builds. The combination gives fast iteration cycles without the overhead of a meta-framework (no SSR, no file-based routing).

### Custom CSS design system + Tailwind v4

The design system is built on CSS custom properties (design tokens) with three layers:

- **`tokens.css`** — 637 lines of design tokens: typography, spacing, radii, shadows, z-index, motion, color palettes (cream, sumi, sakura, sora, wakatake, yamabuki, shu, matcha, fuji, indigo), semantic tokens for surfaces/text/borders/accents/status, and layout tokens
- **`app.css`** — Component library in BEM-lite style: buttons, forms, tags, badges, pager, tabs, capacity meter, skeletons, album shell, decorations (washi tape, photo corners, torn edges, paper grain, hanko seals)
- **`views.css`** — Page template layouts: collage, spread/postcard, notebook, stamp-log, guestbook, clipboard, ledger, cover, guide

Tailwind CSS v4 is used as a secondary utility layer for layout (flex, grid), spacing, and responsive breakpoints. The custom design tokens are bridged into Tailwind via the `@theme` block.

### Zustand over Redux

Two small, focused stores replace what would typically be a large Redux setup:

- **`auth-store`** — User profile, authentication state, login/register/logout/bootstrap actions. Profile persisted to localStorage; access tokens kept in memory only.
- **`theme-store`** — Light/dark theme state. Applies `data-theme` attribute to `<html>` with smooth transition class.

No reducers, no action creators, no middleware. Zustand's hook-based API keeps state logic colocated with the components that use it.

### TanStack React Query for server state

React Query manages all API data fetching with:

- `staleTime: 30s` to avoid unnecessary refetches
- `retry: 1` for transient failure tolerance
- `refetchOnWindowFocus: false` to prevent surprise refetches
- Query keys follow `['resource', ...filters]` pattern for automatic cache invalidation

This separates server state (async, cacheable, stale) from client state (auth, theme), keeping each concern in the right tool.

### Custom fetch client over axios

A lightweight `api.ts` module wraps native `fetch()` with:

- Automatic token refresh on 401 responses — catches the first 401, calls `POST /api/auth/refresh`, retries the original request
- Singleton refresh deduplication — multiple concurrent 401s share a single refresh promise
- Custom `ApiRequestError` class with `statusCode`, `message`, and field-level `errors`
- In-memory token management via `tokenHolder` — access tokens never touch localStorage

### In-memory JWT storage

Access tokens are stored in a module-level variable (`tokenHolder`), not in localStorage or sessionStorage. This prevents XSS attacks from exfiltrating tokens via injected scripts. Refresh tokens are HttpOnly cookies managed entirely by the browser.

### React Router v7 with route guards

Declarative routing with three guard components:

- **`RequireAuth`** — Redirects unauthenticated users to `/login` with return URL in state. Shows a session-checking gate during bootstrap.
- **`RequireAnonymous`** — Redirects authenticated users to `/events` (used on login/register pages).
- **`RequireRole`** — Checks user role against allowed roles, shows toast and redirects if unauthorized.

Each page declares its auth requirements via nested `<Route>` wrappers.

### No third-party component library

All 42 components are custom-built to match the scrapbook album design system. No MUI, Ant Design, Radix, or shadcn/ui. This gives full control over the visual language but means every component (modals, buttons, forms, tables, pagination, badges) was hand-crafted.

Key component groups:

- **Shell/Layout** — AlbumRail (desktop sidebar), TabBar (mobile bottom nav), TopBar, IndexDrawer
- **Page-level** — MosaicGrid, PolaroidTile, EventForm, PostcardSpread, ReplyCard, StampEntry, AttendeeTable
- **UI primitives** — Modal, ConfirmModal, TagChip, Badges, CapacityMeter, SheetPager, EmptyState, Breadcrumbs, Icon
- **Decorative** — NekoMascot, washi tape, photo corners, confetti, hanko seals

### MSW for API mocking

Tests use Mock Service Worker (MSW) to intercept network requests at the service worker level. Mock handlers cover auth, events, RSVPs, and tags endpoints. This provides realistic test behavior without a running backend and enables testing of loading states, error states, and edge cases.

### Dark theme via CSS custom properties

The dark theme uses the same token system with a `[data-theme="dark"]` selector. An inline `<script>` in `index.html` reads localStorage and system preference before paint, preventing a flash of wrong theme on load. The "night stalls" aesthetic transforms the festival theme into a nighttime market scene.

## Setup

### Prerequisites

- Node.js >= 22
- npm >= 10
- EventNest backend API running on port 5000

### Local development

```bash
npm install
npm run dev                  # Vite dev server → http://localhost:5173
```

The Vite dev server proxies `/api`, `/health`, and `/api-docs` to `http://localhost:5000`, so the frontend and API appear as same-origin (no CORS issues).

### Running tests

```bash
npm test                     # Watch mode
npm run test:run             # Single run
npm run test:coverage        # With coverage report
```

Tests use MSW for API mocking and jsdom for browser environment simulation.

### Building for production

```bash
npm run build                # TypeScript compile + Vite build → dist/
npm run preview              # Preview production build locally
```

In the Docker Compose stack, the built assets are served by nginx with a reverse proxy to the API.

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | ESLint (flat config) |
| `npm test` | Vitest watch mode |
| `npm run test:run` | Vitest single run |
| `npm run test:coverage` | Vitest with coverage |

### Environment variables

The frontend uses no `.env` files. Configuration is handled through:

- **Vite proxy** — Dev server proxies API requests to `localhost:5000` (configured in `vite.config.ts`)
- **Relative URLs** — All API calls use `BASE_URL = ""`, working in both dev (Vite proxy) and production (nginx reverse proxy)
- **localStorage** — User profile (`eventnest.user`) and theme preference (`eventnest.kawaii.scrapbook.theme`)

## Assumptions

### Business and domain

- The application is a responsive web app only — there is no native mobile app, no PWA, and no offline support
- No file upload — events have no images, banners, or attachments; the UI has no upload components
- No rich text editing — event descriptions are plain text with no formatting
- No real-time updates — users must refresh or navigate to see changes made by others
- English only — no internationalization or localization support
- The design follows a "Kawaii Matsuri Scrapbook Album" aesthetic — this is a deliberate creative choice, not a generic or corporate design
- The scrapbook theme includes decorative elements (washi tape, photo corners, torn edges, paper grain, hanko seals) that are visual-only and do not carry functional meaning

### Technical

- Requires JavaScript enabled in the browser — the app has no server-side rendering or static generation
- The backend API must be running for any functionality — there is no mock data mode for production builds
- User session state is lost when localStorage is cleared — only the HttpOnly refresh cookie survives a localStorage wipe
- No analytics, error tracking, or monitoring integration
- Google Fonts are loaded externally (Dela Gothic One, Zen Maru Gothic, M PLUS Rounded 1c) — full design requires an internet connection on first load
- Accessibility features include skip links, ARIA labels, focus management, and reduced-motion support, but the decorative scrapbook aesthetic may present challenges for screen readers
- Desktop-first layout (album rail sidebar at 1024px+), with mobile adaptation via bottom tab bar and top bar
- The app targets modern browsers supporting ES2023 — no polyfills or fallbacks for older browsers
