# Changelog

All notable changes to this project are documented here, organized by
build phase (see `README.md` for the full roadmap).

## [Unreleased]

### Phase 5 — Dashboard

- Project cards, create/edit/delete modals, debounced search
- `StatsBar` (total project count — intentionally scoped, see code comment)
- `RecentActivityList` backed by new `GET /api/activity/recent`
- Root `npm run dev` now uses `concurrently` instead of shell `&` (cross-platform fix)

### Phase 4 — Frontend Foundation

- `AppLayout`, responsive `Sidebar`, `Navbar` with live connection status
- Real route tree (`/`, `/projects/:id`, `/settings`)
- `NameGate` first-launch flow, `Button`/`Input`/`Modal` primitives

### Phase 3 — Backend Foundation

- `resolveCurrentUser` middleware (atomic user upsert, fixes a race condition)
- Generic Zod `validate` middleware
- Full Projects module (schema/repository/service/controller/routes) with soft-delete + pagination
- 18 unit tests for `ProjectService` and pagination utilities

### Phase 2 — Database

- Full Prisma schema: `User`, `Project`, `Task`, `Todo`, `Comment`, `FileAsset`, `Activity`
- Hand-authored initial migration (see README's sandbox-limitation notes)
- Seed script, pagination utilities

### Phase 1 — Project Initialization

- npm workspaces monorepo scaffold (`apps/client`, `apps/server`, `packages/shared-types`)
- Vite + React 19 + Tailwind v4 with custom design tokens (not default purple)
- Express + TypeScript backend skeleton, centralized error handling, `StorageProvider` abstraction
- **Bug fixed:** `config/env.ts` now loads dotenv itself (path-resolved via `import.meta.url`, not `process.cwd()`) before Zod validation runs — previously `DATABASE_URL` validation failed because nothing loaded `.env` before the server started.

### Phase 0 — Planning

- Full architecture decisions recorded in `PHASE_0_PLANNING.md`
