# Changelog

All notable changes to this project are documented here, organized by
build phase (see `README.md` for the full roadmap).

## [Unreleased]

### Phase 8 — Todo System

- Backend `todos` module (schema/repository/service/controller/routes),
  mirroring `modules/tasks/` — `POST/GET/PATCH /api/todos`,
  `PATCH /api/todos/:id/reorder`, `DELETE /api/todos/:id` — plus 18 unit
  tests (`todo.service.test.ts`)
- `TodoList` + `TodoItem`: replaces the Phase 6 "Todos" placeholder tab.
  Inline add, checkbox completion, click-to-edit title, up/down reorder,
  delete, and a completion progress bar — same visual language as the
  Phase 7 Task Board
- **First use of a Prisma transaction in this codebase**
  (`TodoRepository.swapPositions`) — reordering swaps two rows' `position`
  values atomically
- **Bug fixed (found via this session's first-ever real `npm run build`,
  see below):** `TaskService.create` violated `exactOptionalPropertyTypes`
  by passing possibly-`undefined` optional fields straight through instead
  of conditionally spreading them the way `TaskService.update` already
  did. Fixed to match; also fixed 3 real ESLint findings (2 in
  `task.service.test.ts` around `expect.any()`'s `any` typing, 1
  pre-existing since Phase 6 in `WorkspaceTabs.tsx`). Full details in
  `handoffs/PHASE_8_HANDOFF.md` §1.
- **Sandbox update:** this session has real npm registry network access
  (unlike Phases 1–7) — `npm install`, `build`, `lint`, `test`, and
  `format:check` were run for real for the first time, at the root level,
  for the whole repo. `binaries.prisma.sh` is still blocked, so
  `prisma generate`/`migrate dev` remain unverified.
- **Decision:** todos are project-level only in the UI for this phase
  (`taskId` omitted in every frontend call), per the recommendation left
  in `PHASE_7_HANDOFF.md` §5. The backend fully supports task-scoped
  todos already — this is a UI scope call, not a schema or API gap.
- **Decision:** no `TODO_UPDATED` activity type exists (schema decision
  from Phase 2, unchanged) — a plain title edit or a reorder records no
  activity; only create, delete, and an actual `isDone` flip do.
- **Decision:** `TodoService.delete` records the `TODO_DELETED` activity
  *before* calling `todoRepository.delete()`, not after — Todo is a hard
  delete (unlike Task's soft delete), so deleting first would break the
  Activity row's foreign key. See `handoffs/PHASE_8_HANDOFF.md` §3.

### Phase 7 — Task System

- Backend `tasks` module (schema/repository/service/controller/routes),
  file-for-file mirroring `modules/projects/` — `POST/GET/PATCH/DELETE
  /api/tasks`, flat (not nested under `/api/projects/:id/tasks` — see
  `handoffs/PHASE_7_HANDOFF.md` for why), plus 12 unit tests
  (`task.service.test.ts`, mocked repositories — same style as
  `project.service.test.ts`)
- `TaskBoard`: 4-column board (To Do/In Progress/In Review/Done), replaces
  the Phase 6 "Board" placeholder tab. Create (per-column "+"), edit,
  delete, and a completion progress bar
- **Move status is a `<select>` dropdown on each card, not drag-and-drop**
  — deliberate scope call, no drag-and-drop library exists in
  `package.json` and this sandbox can't install one to try. Documented as
  a Known Gap; revisit later if it matters enough to add the dependency.
- New shared `Select` UI primitive (`components/ui/Select.tsx`) — first
  dropdown field needed anywhere in the app so far
- `lib/format.ts`: added `toDateInputValue()` / `fromDateInputValue()` for
  converting between the API's ISO date strings and a native
  `<input type="date">`'s `"YYYY-MM-DD"` value

### Phase 6 — Project Workspace

- `ProjectWorkspacePage` page shell: real project header (name, description,
  color, edit/delete) + a 5-tab strip (Board/Todos/Comments/Files/Activity),
  tab state persisted in the URL (`?tab=`)
- Each tab renders a shared `WorkspaceTabPlaceholder` naming which phase
  (7–11) builds its real content — no per-tab logic yet, by design (see
  `handoffs/PHASE_6_HANDOFF.md` for the scoping rationale)
- New `GET /api/projects/:id` client wiring: `getProject()` + `useProject()`
- **Bug fixed:** `Sidebar`'s project list was still a static "Phase 5 wires
  this up" placeholder even though Phase 5 (Dashboard) had already shipped —
  it never actually got wired. Now shows the 8 most recent projects with
  active-route highlighting.
- **Doc fix:** `packages/shared-types/src/index.ts`'s header comment still
  said domain DTOs were "not defined here yet" — stale since Phase 2 actually
  defined them in the same file. Comment corrected, no type changes.

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
