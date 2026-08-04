# SyncRoot

**A Modern Collaborative Workspace** — projects, tasks, todos, comments, files, and activity tracking for small teams.

> **Status:** Phase 1 (Project Initialization) complete. No business logic yet — see [Roadmap](#roadmap) below.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS v4, React Router 7, Framer Motion, TanStack Query, Axios |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Tooling | npm workspaces monorepo, ESLint 9 (flat config), Prettier, Vitest |

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
├── docker-compose.yml # Local Postgres
└── PHASE_0_PLANNING.md # Full architecture record
```

See `PHASE_0_PLANNING.md` for the complete architecture write-up (why layered
Controller/Service/Repository, why the StorageProvider abstraction, database
relation strategy, etc.) — this README covers *how to run it*, that document
covers *why it's built this way*.

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
- Prisma schema currently defines only the datasource/generator — no
  models yet. That's Phase 2.
- No routes beyond `/api/health` exist yet — Phase 3 builds the module
  structure (controller/service/repository) that later feature phases fill in.

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| 0 | Planning & architecture | ✅ Done |
| 1 | Project initialization & tooling | ✅ Done |
| 2 | Database schema, migrations, seed | ⏳ Next |
| 3 | Backend foundation (modules, middleware) | Not started |
| 4 | Frontend foundation (layout, routing, theme) | Not started |
| 5–13 | Dashboard, Projects, Tasks, Todos, Comments, Files, Activity, Search, Settings | Not started |
| 14 | PWA (offline, install prompt, full icon set) | Not started |
| 15 | Optimization, security review, deployment prep | Not started |

## Scripts (root)

| Command | Does |
|---|---|
| `npm run dev` | Runs client + server concurrently |
| `npm run build` | Builds shared-types → server → client, in order |
| `npm run lint` | Lints every workspace |
| `npm run format` | Formats the whole repo with Prettier |
| `npm run test` | Runs tests in every workspace |
| `npm run db:migrate` / `db:seed` / `db:studio` | Prisma commands, proxied to `apps/server` |
