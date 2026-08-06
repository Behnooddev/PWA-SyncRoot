# Getting Started

## Prerequisites

- **Node.js ≥ 20** — check `.nvmrc` for the exact pinned version.
- **Docker**, for a local Postgres instance — or point at your own
  Postgres instance and skip the `docker compose` step.

## Setup

```bash
# 1. Install dependencies for every workspace (client, server, shared-types)
npm install

# 2. Start Postgres locally
docker compose up -d

# 3. Copy env files
cp apps/server/.env.example apps/server/.env
cp apps/client/.env.example apps/client/.env

# 4. Apply the database schema and seed sample data
npm run db:migrate
npm run db:seed

# 5. Run client + server together
npm run dev
```

- Client: http://localhost:5173
- Server health check: http://localhost:4000/api/health

On first launch, the app asks "What is your name?" — there's no login.
The name is stored in `localStorage` and sent as an `X-User-Name` header
on every request; see [Architecture](Architecture) and [FAQ](FAQ) for why.

## Verifying your setup works

```bash
npm run build          # full production build, all workspaces
npm run lint            # ESLint, all workspaces, zero warnings allowed
npm run test             # Vitest, all workspaces
npm run format:check     # Prettier check
```

All four should pass clean. This is exactly what CI
(`.github/workflows/ci.yml`) runs. **Always run these at the root**, not
per-workspace — see [Development Workflow](Development-Workflow) for why
that distinction matters (two real bugs hid behind per-workspace-only
checks during development).

## Project structure

```
syncroot/
├── apps/
│   ├── client/         # React 19 + Vite + Tailwind v4
│   │   └── src/features/   # one folder per domain (projects, tasks, todos, ...)
│   └── server/          # Express + TypeScript
│       └── src/modules/     # one folder per domain, Controller→Service→Repository
├── packages/
│   └── shared-types/     # DTOs shared between client & server
├── handoffs/             # one file per phase — read the highest-numbered one first
├── wiki/                 # this wiki, as source files (see wiki/README.md)
├── docker-compose.yml     # local Postgres
└── SYNCROOT_MASTER.md      # single source of truth: what/why/roadmap
```

## Where to go next

- Building a new feature? Read [Development Workflow](Development-Workflow)
  first — this project follows a strict one-phase-at-a-time process.
- Curious how a specific endpoint works? See [API Reference](API-Reference).
- Want the full "why" behind a decision? Check the relevant
  `handoffs/PHASE_N_HANDOFF.md` in the main repo — the wiki summarizes,
  the handoffs go deep.
