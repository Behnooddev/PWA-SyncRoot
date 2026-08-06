# Architecture

## Tech stack

| Layer    | Choice |
| -------- | ------ |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS v4, React Router 7, Framer Motion, TanStack Query, Axios |
| Backend  | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Tooling  | npm workspaces monorepo, ESLint 9 (flat config), Prettier, Vitest |

## Core V1 scope decisions

These are deliberate trade-offs made explicitly for a V1, not oversights.
See [FAQ](FAQ) for the reasoning behind each.

- **No authentication.** First launch asks "What is your name?", stored
  in `localStorage`, sent as `X-User-Name` on every API request. Every
  comment/task/todo/activity shows that name as author.
- **No real-time sync (no WebSocket).** TanStack Query polling instead,
  configured per-feature — not one blanket global interval.
- **File storage:** local disk in V1, behind a `StorageProvider`
  interface so S3/MinIO can replace it later without touching business
  logic anywhere else.

## Backend layering

```
Controller (HTTP only)
    ↓
Service (business rules + Activity logging, constructor-injected deps)
    ↓
Repository (only layer touching Prisma)
```

Every module follows `apps/server/src/modules/projects/` as the reference
pattern:

```
*.schema.ts       — Zod validation + inferred TS types
*.repository.ts   — Prisma calls only, nothing else
*.service.ts      — business rules, orchestration, Activity logging
*.controller.ts   — parse validated input, call one service method, shape response
*.routes.ts       — Express Router wiring
*.module.ts       — composition root: instantiate + wire everything
```

Services take their dependencies through the constructor rather than
importing singletons — this is what makes `*.service.test.ts` files
possible without a real database (every service test in this repo mocks
its repositories and runs with zero DB access).

## Centralized error handling

Every thrown error is an `AppError` subclass (`NotFoundError`,
`ValidationError`, `BadRequestError`, `ConflictError` — see
`lib/errors.ts`), caught by one `errorHandler` middleware. Controllers
never call `res.status().json()` for an error case — they let the error
propagate and the middleware shapes the response consistently.

## User resolution (the no-auth flow)

```
X-User-Name header
    → resolveCurrentUser middleware
    → UserService.findOrCreateByName (atomic upsert)
    → req.currentUser
```

`findOrCreateByName` uses an atomic Prisma `upsert`, not a find-then-create
— a real race condition was caught during Phase 3 development where two
concurrent first-time requests from the same name could both try to
create a user row.

## Database conventions

- **Soft-delete** (`deletedAt` column) on `Project` and `Task` only.
- **Hard-delete** on `Todo` and `Comment`. This has a real consequence for
  Activity logging — see the note below and [Data Model](Data-Model).
- **`Activity`** is append-only with nullable foreign keys
  (`onDelete: SetNull`), not a polymorphic `entityType`/`entityId` column
  — chosen for typed Prisma relations over raw flexibility.
- **`Comment`** targets exactly one of Project/Task/Todo, enforced by a
  hand-added Postgres CHECK constraint (Prisma can't express this
  natively in the schema itself).

### Hard-delete + Activity logging ordering

Because `Activity` rows reference entities by foreign key, and `Todo`/
`Comment` are hard-deleted (the row is actually gone, not just flagged),
**the activity record must be written *before* the delete, not after** —
otherwise the insert would try to reference a row that no longer exists
and the foreign key would reject it. `TaskService.softDelete()` doesn't
have this constraint (the row survives, just flagged), but
`TodoService.delete()` does. See `handoffs/PHASE_8_HANDOFF.md` §5.4 for
the full reasoning — this pattern will repeat for `Comment` in Phase 9.

## Shared types

`packages/shared-types` has hand-written DTOs mirroring Prisma models. The
client never imports `@prisma/client` directly — this keeps the Prisma
runtime out of the browser bundle entirely.

## Design tokens

Not default Tailwind purple. Accent `#6E5AF0` (indigo-violet), backgrounds
`#09090F` / `#121218` / `#17171F`. Fonts: Bricolage Grotesque (display,
used sparingly), Inter (body/UI), JetBrains Mono (data/timestamps).
Tailwind **v4**, CSS-first config (`@theme` block in
`apps/client/src/styles/index.css`) — no `tailwind.config.js`.

## Env loading

`apps/server/src/config/env.ts` loads dotenv itself (path-resolved via
`import.meta.url`, never `process.cwd()`) before Zod validation runs.
This is the single source of truth for env loading — no other file should
call `dotenv.config()`. (A real bug during Phase 1/2 development: env
validation was failing because it ran before dotenv had loaded anything —
fixed by making `env.ts` self-sufficient.)

## Dev script

Root `npm run dev` uses `concurrently`, not shell `&` — `&` silently
breaks on Windows. Another real bug caught during early development.
