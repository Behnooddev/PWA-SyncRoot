# SyncRoot

**A Modern Collaborative Workspace** — projects, tasks, todos, comments, files, and activity tracking for small teams.

> **Status:** Phases 0–8 complete (Dashboard + Project Workspace + Task Board + Todo List). Comment/File/Activity feature logic lands in Phases 9–11 — see [Roadmap](#roadmap) below.

---

## Tech Stack

| Layer    | Choice                                                                                              |
| -------- | --------------------------------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS v4, React Router 7, Framer Motion, TanStack Query, Axios |
| Backend  | Node.js, Express, TypeScript                                                                        |
| Database | PostgreSQL + Prisma ORM                                                                             |
| Tooling  | npm workspaces monorepo, ESLint 9 (flat config), Prettier, Vitest                                   |

## Prerequisites

- Node.js ≥ 20 (see `.nvmrc`)
- Docker (for local Postgres) — or your own Postgres instance

## Getting Started

```bash
# 1. Install dependencies for all workspaces
npm install

# 2. Start Postgres locally
docker compose up -d

# 3. Copy env files
cp apps/server/.env.example apps/server/.env
cp apps/client/.env.example apps/client/.env

# 4. Once Phase 2 lands (Prisma models), run:
npm run db:migrate
npm run db:seed

# 5. Run client + server together
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:4000/api/health

## Project Structure

```
syncroot/
├── apps/
│   ├── client/     # React app (Vite)
│   └── server/     # Express API
├── packages/
│   └── shared-types/  # Types shared between client & server
├── handoffs/       # One file per phase — read the highest-numbered one first
├── docker-compose.yml # Local Postgres
└── PHASE_0_PLANNING.md # Full architecture record
```

See `PHASE_0_PLANNING.md` for the complete architecture write-up (why layered
Controller/Service/Repository, why the StorageProvider abstraction, database
relation strategy, etc.) — this README covers _how to run it_, that document
covers _why it's built this way_.

## Architecture at a Glance

- **Layered backend:** `Controller → Service → Repository`. Controllers only
  validate input (Zod) and shape HTTP responses. Services hold business
  rules. Repositories are the only layer touching Prisma directly.
- **Centralized error handling:** every thrown error is an `AppError`
  subclass, caught by one middleware (`middleware/errorHandler.ts`) —
  no controller calls `res.status().json()` for an error case.
- **No authentication in V1:** every request carries an `X-User-Name`
  header, resolved client-side from a name captured on first launch and
  stored in `localStorage`. This is an explicit, documented MVP trade-off,
  not an oversight — see PHASE_0_PLANNING.md §1.
- **No real-time sync in V1:** by decision, not by omission. Data freshness
  comes from React Query's background refetch/polling, configured per
  feature. A WebSocket layer is a candidate for a post-V1 phase.
- **File storage:** local disk in V1, behind a `StorageProvider` interface
  (`lib/storage/`) so a future move to S3/MinIO is a new implementation
  class, not a rewrite of every service that touches files.

## Known Gaps (honest, not hidden)

- PWA manifest currently ships one SVG icon. Browser-standard 192×192 /
  512×512 PNG (and maskable variant) icons are Phase 14 work, per the
  original roadmap.
- The Project Workspace page (`/projects/:id`) has a real header/tab shell
  (Phase 6), a real Task Board (Phase 7), and a real Todo list (Phase 8).
  Comments/Files/Activity tabs still show a labeled placeholder — Phases
  9–11 replace each one with real, data-backed content.
- Task Board's "move status" is a dropdown on each card, not drag-and-drop
  — a deliberate scope call for Phase 7 (no drag-and-drop library was in
  `package.json` at the time). Todo reordering (Phase 8) made the same
  call for consistency, using up/down buttons instead. See
  `handoffs/PHASE_7_HANDOFF.md` and `handoffs/PHASE_8_HANDOFF.md` for the
  reasoning; revisit if/when drag interactions matter enough to justify
  the dependency — the sandbox now has npm registry access (see below), so
  adding one is actually possible starting from Phase 9.
- Task Board fetches up to 100 tasks per project in one page (no real
  pagination yet) — fine at V1 scale, would need revisiting for a project
  with a very large backlog. Todos made the identical call (100/page).
- Todos are project-level only in the UI. The backend (schema, repository,
  service, API) already supports task-scoped todos end-to-end — `taskId`
  on create/list — but no UI surfaces it yet. See
  `handoffs/PHASE_8_HANDOFF.md`.
- No auth, no real-time sync — both explicit V1 decisions, not gaps. See
  Architecture section above.
- **Sandbox network access, updated as of Phase 8:** unlike Phases 1–7,
  this session has real network access to the npm registry — `npm install`,
  `npm run build`, `lint`, `test`, and `format:check` have now actually
  been run (and two real bugs from Phase 7 were caught and fixed as a
  result — see `handoffs/PHASE_8_HANDOFF.md` §1). `binaries.prisma.sh` is
  still blocked, so `prisma generate`/`migrate dev` still can't run and no
  live-database integration testing is possible — that part of the
  original limitation is unchanged. If a future session has network access
  too, don't skip re-running the root verification commands just because
  this note says they've been run before — always verify fresh.

## Roadmap

| Phase | Scope                                                                                 | Status      |
| ----- | ------------------------------------------------------------------------------------- | ----------- |
| 0     | Planning & architecture                                                               | ✅ Done     |
| 1     | Project initialization & tooling                                                      | ✅ Done     |
| 2     | Database schema, migrations, seed                                                     | ✅ Done     |
| 3     | Backend foundation (modules, middleware, Project module)                              | ✅ Done     |
| 4     | Frontend foundation (layout, routing, theme, reusable components)                     | ✅ Done     |
| 5     | Dashboard (project cards, search, stats, recent activity, CRUD)                       | ✅ Done     |
| 6     | Project Workspace (header, tab shell — tab *content* deferred, see Known Gaps)        | ✅ Done     |
| 7     | Task System (board, priority, due date, status)                                       | ✅ Done     |
| 8     | Todo System (project-level checklist, completion tracking, reordering)               | ✅ Done     |
| 9–13  | Comment System, File Manager, Activity System, Search, Settings                       | ⏳ Next     |
| 14    | PWA (offline, install prompt, full icon set)                                          | Not started |
| 15    | Optimization, security review, deployment prep                                        | Not started |

## Scripts (root)

| Command                                        | Does                                            |
| ---------------------------------------------- | ----------------------------------------------- |
| `npm run dev`                                  | Runs client + server concurrently               |
| `npm run build`                                | Builds shared-types → server → client, in order |
| `npm run lint`                                 | Lints every workspace                           |
| `npm run format`                               | Formats the whole repo with Prettier            |
| `npm run test`                                 | Runs tests in every workspace                   |
| `npm run db:migrate` / `db:seed` / `db:studio` | Prisma commands, proxied to `apps/server`       |
