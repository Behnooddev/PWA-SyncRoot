# Roadmap

SyncRoot is built in 15 phases, one at a time, each reviewed before the
next starts. See [Development Workflow](Development-Workflow) for the
process itself.

## Status

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Planning & architecture | ✅ Done |
| 1 | Project initialization & tooling | ✅ Done |
| 2 | Database schema, migrations, seed | ✅ Done |
| 3 | Backend foundation (modules, middleware, Project module) | ✅ Done |
| 4 | Frontend foundation (layout, routing, theme, reusable components) | ✅ Done |
| 5 | Dashboard (project cards, search, stats, recent activity, CRUD) | ✅ Done |
| 6 | Project Workspace (header, tab shell) | ✅ Done |
| 7 | Task System (board, priority, due date, status) | ✅ Done |
| 8 | Todo System (checklist, completion tracking, reordering) | ✅ Done |
| 9 | Comment System | ⏳ Next |
| 10 | File Manager | Not started |
| 11 | Activity System (full timeline UI) | Not started |
| 12 | Search | Not started |
| 13 | Settings | Not started |
| 14 | PWA (offline, full icon set, install prompt) | Not started |
| 15 | Optimization, security review, deployment prep | Not started |

## Usability milestones

| Milestone | When |
| --- | --- |
| **Barebones usable** — create a project, add tasks, add todos, see it all in the UI | **Reached, end of Phase 8** |
| **Full original spec** | End of Phase 13 |
| **Production-hardened** | End of Phase 15 |

## Phase details

### Phase 0 — Planning
Architecture, folder structure, tech decisions, roadmap, UI/DB/API
strategy.

### Phase 1 — Project Initialization
npm workspaces scaffold, Vite+React+Tailwind v4, Express+TS skeleton,
Prisma init (schema skeleton only), ESLint/Prettier, design tokens, PWA
plugin registration (not full PWA), README.

### Phase 2 — Database
Full Prisma schema (`User`, `Project`, `Task`, `Todo`, `Comment`,
`FileAsset`, `Activity`), initial migration SQL, seed script, pagination
utilities (offset + cursor). See [Data Model](Data-Model).

### Phase 3 — Backend Foundation
Express server assembly, `resolveCurrentUser` + `validate` middleware,
Users and Activity modules (internal, no routes), full **Projects**
module (CRUD, soft-delete, pagination, Activity logging) as the
reference implementation for every module after it.

### Phase 4 — Frontend Foundation
`AppLayout` (responsive Sidebar + Navbar), real route tree (`/`,
`/projects/:id`, `/settings`), `NameGate` first-launch flow, reusable
`Button`/`Input`/`Modal`/`GlassCard` primitives.

### Phase 5 — Dashboard
Project cards, create/edit/delete modals, debounced search, `StatsBar`,
`RecentActivityList` backed by `GET /api/activity/recent`.

### Phase 6 — Project Workspace
Page shell: project header (name, description, color, edit-in-place) + a
tab strip (Board/Todos/Comments/Files/Activity) with placeholders for
content Phases 7–11 fill in.

### Phase 7 — Task System
Create, Edit, Delete, Move Status, Priority, Due Date, board-level
completion progress. Move Status is a dropdown, not drag-and-drop — see
[Known Limitations](Known-Limitations).

### Phase 8 — Todo System
Checkbox, Sorting (up/down buttons, not drag-and-drop), Editing,
Deleting, Completion Tracking. Project-level in the UI; task-scoped
support exists end-to-end in the backend already. **This is the
"barebones usable" milestone.**

### Phase 9 — Comment System *(next)*
Create, Edit, Delete, Timestamps, Author, on Project, Task, or Todo (the
CHECK constraint already exists in the schema).

### Phase 10 — File Manager
Upload, Download, Preview, Metadata, Storage — wiring the
`StorageProvider`/`LocalStorageProvider` (already built in Phase 1) to
real routes and UI.

### Phase 11 — Activity System
The full, filterable, paginated Activity Timeline UI inside the Project
Workspace. Most of the *recording* already happens — every service calls
`activityService.record()` after mutations — this phase is the
**timeline UI**.

### Phase 12 — Search
Global search across Projects, Tasks, Todos, Comments, Files.

### Phase 13 — Settings
Username (already works), Appearance, Storage, Preferences.

### Phase 14 — PWA
Offline support, full Manifest, real icon set (192/512 PNG + maskable —
only one SVG icon exists as of Phase 1), Install Prompt, Caching
strategy.

### Phase 15 — Optimization
Performance (code-splitting — the client bundle is ~540KB as of Phase
8), Accessibility, Security review (see `SECURITY.md`'s known accepted
risks — no auth, no rate limiting), Code Cleanup, Production Build,
Documentation Review, Final Testing, Deployment Prep.

## Deeper detail per phase

Every phase has a corresponding `handoffs/PHASE_N_HANDOFF.md` in the main
repo with the full reasoning behind every non-obvious decision, every bug
found and fixed, and exactly what to read before starting the next phase.
Read the highest-numbered one first — each supersedes the last.
