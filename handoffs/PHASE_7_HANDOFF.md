# SyncRoot — Handoff Summary (for Phase 8 onward)

**This is the file to read first** if you're starting a new chat or
writing Phase 8 yourself. It supersedes `PHASE_6_HANDOFF.md` (kept in this
same folder for history) as the entry point — everything relevant from it
is folded in below, plus everything Phase 7 added or changed.

**If pasting into a new chat:** attach the latest zip and say "continue
with Phase 8."

---

## 1. What SyncRoot is

Dark-themed, purple-accented collaborative workspace. React 19 + Express +
Postgres/Prisma npm-workspaces monorepo. No auth in V1, no real-time sync
in V1 (polling instead). Full spec + 15-phase roadmap: the project's own
master prompt (`MASTER PROMPT — SyncRoot`).

`README.md` references a `PHASE_0_PLANNING.md` for the full architecture
write-up. **This file was not present in the `syncroot-phase5-final.zip`
Phase 6 started from**, and still isn't present as of Phase 7. Either it
was never exported into these zips, or it only exists on your local
machine outside of what gets zipped. Worth confirming directly — nothing
in Phases 6 or 7 depended on its content beyond what's summarized here and
in `README.md`'s "Architecture at a Glance" section, but Phase 8+ decisions
(e.g. Todo's relationship to Task, per §5 below) may want to reference it.

## 2. Process rules in effect (keep following these)

- One phase at a time. Finish, review, list files, list remaining work,
  stop and wait for approval before the next phase.
- Justify architectural decisions out loud — and when the user delegates a
  judgment call ("do whatever you think is best"), that decision still
  gets written down here, not just made silently.
- No placeholder/fake code — except the explicitly-labeled workspace-tab
  placeholders from Phase 6, which are a deliberate scoping choice, not
  corner-cutting.
- User (Behnood) wants to be challenged, not just agreed with.
- Persian (Farsi) conversation, English code/comments.
- **All project handoffs now live in `handoffs/`, one file per phase (or
  per cluster of phases handled together), going forward** — this was an
  explicit ask starting Phase 7. Don't scatter a new `PHASE_N_HANDOFF.md`
  at the repo root.

## 3. Status: Phases 0–7 complete

| Phase | Scope                                                                          | Status  |
| ----- | ------------------------------------------------------------------------------- | ------- |
| 0     | Planning & architecture                                                         | ✅      |
| 1     | Project init & tooling                                                          | ✅      |
| 2     | Database: schema, migration SQL, seed, pagination utils                        | ✅      |
| 3     | Backend foundation: middleware, Users/Activity/**Projects** modules             | ✅      |
| 4     | Frontend foundation: layout, routing, theme, NameGate, UI primitives           | ✅      |
| 5     | Dashboard: project CRUD UI, search, stats, recent activity                     | ✅      |
| 6     | Project Workspace: header + tab shell, tab content deferred                    | ✅      |
| **7** | **Task System: full backend module + real Board tab (create/edit/delete/move/priority/due date)** | ✅ **just finished** |
| 8     | Todo System                                                                    | ⏳ next |
| 9–11  | Comment System, File Manager, Activity System                                  | not started |
| 12–13 | Search, Settings                                                               | not started |
| 14    | PWA (full icon set, offline strategy)                                          | not started |
| 15    | Optimization, security, deployment prep                                        | not started |

Realistic usability estimate (unchanged, still holds): barebones usable
around end of Phase 8 — **this is now, or very close to it**, once Todos
land. Full original spec by Phase 13. Production-hardened by Phase 15.

## 4. Every deviation from the master prompt / original docs, phases 6 & 7

The master prompt lists Phase 6 as "Project Workspace" (a single bullet
list: Project Details, Task Board, Todo List, Comments, Files, Activity
Timeline) and Phase 7 as "Task System" (Create, Edit, Delete, Move Status,
Priority, Due Date, Progress) as if they were cleanly separable. In
practice, building Phase 6 required deciding how much of Phase 7 (and 8–11)
it would anticipate. Here's exactly what was decided and why:

1. **Phase 6 scope split (shell vs. content).** Rather than build the full
   Project Workspace (including a working Task Board) in one phase, Phase
   6 built only the header + tab-navigation shell, with each tab showing a
   placeholder naming which later phase fills it in. This wasn't in the
   master prompt's phase breakdown explicitly — it's an interpretation
   choice, made because Phase 4 had already established the pattern
   (build the app shell, fill content in a later phase) and mirroring it
   kept each phase reviewable on its own. **Decided with the user's
   explicit "use your judgment" go-ahead**, not unilaterally.

2. **Progress ≠ a database field.** The master prompt lists "Progress" as
   a Task System requirement alongside Create/Edit/Delete/Move
   Status/Priority/Due Date. `schema.prisma`'s `Task` model (defined back
   in Phase 2) has no numeric progress field, and adding one would mean a
   new migration in a phase whose whole point was "no schema changes."
   **Interpreted "Progress" as board-level completion tracking** — the
   "`N` of `M` tasks done, `X`%" bar above the columns — rather than a
   per-task field. If the master prompt actually meant a per-task
   percentage (e.g. a manual 0–100 slider), that's a real gap; flag it if
   so and it's a small addition (one migration, one form field).

3. **"Move Status" is a dropdown, not drag-and-drop.** A Linear/Notion-style
   board conventionally implies dragging cards between columns. No
   drag-and-drop library (`@dnd-kit/*`, `react-beautiful-dnd`, etc.) is in
   `package.json`, and this sandbox has zero network access — **no new
   dependency could be installed and verified working**, so adding one on
   spec would be exactly the kind of unverified risk the process rules
   warn against. Each `TaskCard` instead has a `<select>` to change status
   directly. This is a real, visible product deviation from what "task
   board" usually means — flagging it clearly rather than letting it be
   discovered later. If/when there's network access to actually install
   and test a drag-and-drop library, this is a contained, isolated
   follow-up (touches `TaskBoard.tsx` and `TaskCard.tsx` only).

4. **Task routes are flat (`/api/tasks`), not nested under
   `/api/projects/:id/tasks`.** Every other resource in this app
   (`Project`, `Activity`) is already flat, and a task's `projectId`
   travels in the request body/query instead of the URL. Nesting only
   `Task` would be an inconsistent one-off. `TaskService` still enforces
   the project relationship (404s on a bad/missing `projectId` — see
   `assertProjectExists()`), so this isn't a security or integrity gap,
   just a URL-shape decision.

5. **Two real bugs found and fixed that predate both phases, not
   introduced by them:**
   - `Sidebar.tsx`'s project list was hardcoded to "No projects yet —
     Phase 5 wires this up" even though Phase 5 had shipped. Never
     actually wired. Fixed in Phase 6.
   - `README.md`'s status line and Known Gaps section, and
     `shared-types/index.ts`'s header comment, were all stale — written
     correctly for the phase that created them, never updated as later
     phases shipped. Fixed in Phase 6. **Worth a deliberate check for this
     class of drift at the end of Phase 8 too** — it won't show up in
     `npm run test` output since it's comments/strings, not logic.

None of these five points are things the original docs said explicitly —
they're the judgment calls that had to be made to turn "Project Workspace"
and "Task System" as one-line bullet lists into working code. Recorded
here specifically so a from-scratch reading of the master prompt doesn't
produce a different (and now inconsistent) Phase 8+.

## 5. Handoff for Phase 8 (Todo System) — read before starting

The master prompt describes Todo System as: Checkbox, Sorting, Editing,
Deleting, Completion Tracking. `schema.prisma`'s `Todo` model (check it
directly) already has `projectId` **and an optional `taskId`** — meaning
the original schema anticipated todos being either project-level or
attached to a specific task. **This needs an explicit product decision
before Phase 8 starts, the same way §4.1 above needed one for Phase 6:**
does the Board tab's `TaskCard` get an inline todo checklist (task-scoped
todos), does the Workspace's Todos tab show project-level todos only, or
both? Don't silently pick one — the master prompt's phase list has "Todo
Lists" as a separate top-level feature from "Task Board," which suggests
project-level todos were the primary intent, with task-scoped todos as a
secondary capability the schema just happens to support. Recommend
starting with project-level only (mirrors how Phase 7 didn't touch the
Todos tab at all) and treating task-scoped todos as a fast-follow inside
Phase 8 if time allows, not a blocker for calling Phase 8 done.

**Mechanically, follow the exact same pattern Phase 7 used for Task:**
1. Backend: `modules/todos/` mirroring `modules/tasks/` file-for-file
   (schema/repository/service/controller/routes/module + service tests).
   `TodoDto` already exists in `@syncroot/shared-types`.
2. Frontend: `features/todos/` mirroring `features/tasks/`. Replace the
   placeholder block in `ProjectWorkspacePage.tsx`:
   ```tsx
   {activeTab === "todos" && (
     <WorkspaceTabPlaceholder icon={CheckSquare} title="Todo list" ... phase={8} />
   )}
   ```
   with your real `<TodoList projectId={id} />`. Nothing else in
   `ProjectWorkspacePage.tsx`, `WorkspaceTabs.tsx`, or the other three
   placeholders should need to change.
3. Reuse `components/ui/Select.tsx` (new in Phase 7) if Todo needs any
   dropdown — don't rebuild one.
4. Reuse `lib/format.ts`'s `toDateInputValue()`/`fromDateInputValue()` if
   Todo ever gets a due date too.

## 6. ⚠️ Verification gap — still unresolved, now spans two phases

**Still zero network access in this sandbox** — confirmed again before
writing this handoff (`node_modules` doesn't exist anywhere in the repo,
`npm install` still isn't possible). Everything in Phase 7, on top of
everything in Phase 6, has **not** been run through `tsc`, `eslint`,
`prettier`, `vitest`, or `vite build` for real.

What was done to compensate, same as Phase 6:
- Every new/changed file read back in full.
- A crude bracket/brace/paren balance check run on every changed file in
  both phases (catches gross syntax breakage only).
- Types checked by hand against `TaskDto`, `ProjectRepository`, `useQuery`
  return shapes, etc., by reading the actual source of every function
  called — not assumed from memory.
- Line lengths checked against the 100-char Prettier `printWidth` for
  breakable code (imports, multi-attribute JSX); not attempted for long
  string literals, which Prettier can't break anyway.

**Before trusting Phases 6 and 7, run for real:**

```bash
npm install
npm run build
npm run lint
npm run format:check
npm run test
```

If anything fails, it's almost certainly in one of these Phase 6/7 files —
Phases 0–5 were verified in earlier sessions that did have network access:

```
apps/server/src/modules/tasks/*
apps/client/src/features/tasks/*
apps/client/src/features/project-workspace/*
apps/client/src/components/ui/Select.tsx
apps/client/src/layouts/Sidebar.tsx
apps/client/src/features/projects/api.ts
apps/client/src/features/projects/hooks/useProjects.ts
apps/client/src/lib/format.ts
packages/shared-types/src/index.ts   (comment-only change)
```

## 7. Files changed or added — Phase 7 (on top of Phase 6's list in the old handoff)

**New — backend:**
- `apps/server/src/modules/tasks/task.schema.ts`
- `apps/server/src/modules/tasks/task.repository.ts`
- `apps/server/src/modules/tasks/task.service.ts`
- `apps/server/src/modules/tasks/task.controller.ts`
- `apps/server/src/modules/tasks/task.routes.ts`
- `apps/server/src/modules/tasks/task.module.ts`
- `apps/server/src/modules/tasks/task.service.test.ts` (12 test cases)

**New — frontend:**
- `apps/client/src/features/tasks/api.ts`
- `apps/client/src/features/tasks/constants.ts`
- `apps/client/src/features/tasks/hooks/useTasks.ts`
- `apps/client/src/features/tasks/components/TaskBoard.tsx`
- `apps/client/src/features/tasks/components/TaskCard.tsx`
- `apps/client/src/features/tasks/components/TaskFormModal.tsx`
- `apps/client/src/components/ui/Select.tsx` (new shared primitive)

**Changed:**
- `apps/server/src/app.ts` — registered `taskRouter` at `/api/tasks`
- `apps/client/src/features/project-workspace/ProjectWorkspacePage.tsx` —
  Board tab's placeholder replaced with `<TaskBoard projectId={id} />`
- `apps/client/src/lib/format.ts` — added `toDateInputValue()` /
  `fromDateInputValue()`
- `README.md` — status line, Known Gaps, Roadmap table all updated for
  Phase 7
- `HOWTO.md` — added a Phase 7 verification section + quick-reference row
- `CHANGELOG.md` — added a Phase 7 entry

**Reorganized:**
- `PHASE_6_HANDOFF.md` moved to `handoffs/PHASE_6_HANDOFF.md`
- This file created as `handoffs/PHASE_7_HANDOFF.md`

**Not touched:** Prisma schema, migrations, seed — the `Task` model
already existed in full since Phase 2; Phase 7 only needed to build the
API and UI on top of it.

## 8. Style/communication reminders

- Persian conversation, English code.
- Concise, scannable, mobile-friendly responses.
- Challenge weak ideas, don't just execute uncritically.
- Be explicit about what's actually been verified vs. assumed correct —
  especially critical given §6 above spans two unverified phases now.
- All future handoffs go in `handoffs/`, not the repo root.
