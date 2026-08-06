# SyncRoot — Handoff Summary (for Phase 9 onward)

**This is the file to read first** if you're starting a new chat or
writing Phase 9 yourself. It supersedes `PHASE_7_HANDOFF.md` (kept in this
same folder for history) as the entry point — everything relevant from it
is folded in below, plus everything Phase 8 added or changed.

**If pasting into a new chat:** attach the latest zip and say "continue
with Phase 9."

---

## 1. Big one first: real verification happened this phase (unlike 1–7)

Every session through Phase 7 ran in a sandbox with **zero network
access** — `npm install` was never possible, so `build`/`lint`/`test`/
`format:check` were never run for real; verification was manual (reading
every file back, hand-checking types, brace-balance checks). This
session's sandbox has real npm registry access. First thing done: ran
`npm install` at the root, then the full root verification suite —

```bash
npm run build && npm run lint && npm run test && npm run format:check
```

**This caught two real, previously-invisible bugs from Phase 7:**

1. `TaskService.create()` violated `exactOptionalPropertyTypes: true` by
   passing possibly-`undefined` optional fields (`description`, `status`,
   `priority`, `dueDate`) straight into the repository call, instead of
   conditionally spreading them the way `TaskService.update()` already
   did a few lines below. Fixed to match `update()`'s pattern.
2. Three ESLint findings with `--max-warnings=0`: two in
   `task.service.test.ts` (vitest's `expect.any()` / `expect.anything()`
   are typed `any`, tripping `@typescript-eslint/no-unsafe-assignment`),
   and one in `WorkspaceTabs.tsx` — a Phase 6 file, not Phase 7 —
   (`isWorkspaceTab`'s export tripped `react-refresh/only-export-components`
   because it's a non-component export from a component file). All three
   fixed with scoped, commented `eslint-disable-next-line`s.

After both fixes: root `build`/`lint`/`test`/`format:check` all pass
clean. **Phases 0–7 are now genuinely verified for the first time**, not
just manually reasoned about.

**`binaries.prisma.sh` is still blocked (403)** — confirmed again this
session — and there's no Docker/`psql` in this sandbox either. So
`prisma generate`/`migrate dev` and any live-database integration test
are still impossible here. That specific limitation is unchanged from
every prior phase; only the "everything else" part of verification
changed. **If a future session claims network access too, still re-run
the suite yourself rather than trusting this note** — access could change
session to session, and "it passed last time" isn't the same as "it
passes now."

## 2. What SyncRoot is

Dark-themed, purple-accented collaborative workspace. React 19 + Express +
Postgres/Prisma npm-workspaces monorepo. No auth in V1, no real-time sync
in V1 (polling instead). Full spec + 15-phase roadmap: `SYNCROOT_MASTER.md`
(the document to hand a fresh chat, per its own first line).

## 3. Process rules in effect (keep following these)

- One phase at a time. Finish, review, list files, list remaining work,
  stop and wait for approval before the next phase.
- Justify architectural decisions out loud — and when the user delegates a
  judgment call ("do whatever you think is best"), that decision still
  gets written down here, not just made silently.
- No placeholder/fake code — except the explicitly-labeled workspace-tab
  placeholders from Phase 6 for tabs not yet built, which are a deliberate
  scoping choice, not corner-cutting.
- User (Behnood) wants to be challenged, not just agreed with.
- Persian (Farsi) conversation, English code/comments.
- All handoffs live in `handoffs/`, one file per phase.
- **Always run root-level aggregate commands** (`npm run lint/test/build`),
  not per-workspace — see §1. This is no longer a hypothetical rule from
  earlier bugs; it's now been proven twice.

## 4. Status: Phases 0–8 complete

| Phase | Scope                                                                          | Status  |
| ----- | ------------------------------------------------------------------------------- | ------- |
| 0     | Planning & architecture                                                         | ✅      |
| 1     | Project init & tooling                                                          | ✅      |
| 2     | Database: schema, migration SQL, seed, pagination utils                        | ✅      |
| 3     | Backend foundation: middleware, Users/Activity/**Projects** modules             | ✅      |
| 4     | Frontend foundation: layout, routing, theme, NameGate, UI primitives           | ✅      |
| 5     | Dashboard: project CRUD UI, search, stats, recent activity                     | ✅      |
| 6     | Project Workspace: header + tab shell, tab content deferred                    | ✅      |
| 7     | Task System: full backend module + real Board tab                              | ✅      |
| **8** | **Todo System: full backend module + real Todos tab (project-level)**          | ✅ **just finished** |
| 9–11  | Comment System, File Manager, Activity System                                  | ⏳ next |
| 12–13 | Search, Settings                                                               | not started |
| 14    | PWA (full icon set, offline strategy)                                          | not started |
| 15    | Optimization, security, deployment prep                                        | not started |

Realistic usability estimate: **barebones usable milestone reached as of
this phase** — a user can create a project, add tasks, add todos, and see
it all in the UI. Full original spec by Phase 13. Production-hardened by
Phase 15.

## 5. Decisions made this phase (read before touching Todo code)

1. **Todos are project-level only in the UI.** `PHASE_7_HANDOFF.md` §5
   left this as an open product decision and recommended starting
   project-level-only, treating task-scoped todos as a fast-follow if
   time allowed. Went with that recommendation. The backend does **not**
   take the same shortcut — `todo.schema.ts`, `TodoRepository`, and
   `TodoService` all fully support an optional `taskId` end-to-end
   (including `TodoService.assertTaskInProject`, which 404s/400s a
   `taskId` that doesn't exist or belongs to a different project). Only
   `TodoList.tsx`/`useTodos.ts` omit it everywhere. Adding task-scoped
   todo UI later (e.g. an inline checklist on `TaskCard`) is additive —
   new frontend only, zero backend changes.

2. **`GET /api/todos?projectId=X` scoping is explicit, not "everything."**
   If `taskId` is omitted from the query, the service filters to
   `taskId: null` (project-level only) — it does **not** return every
   todo regardless of scope. If `taskId` is given, it scopes to exactly
   that task. There's no "give me all of them mixed together" mode in V1.
   This was a judgment call (§ mirrors the Phase 7 §4.4 URL-shape-decision
   pattern) — flagging it explicitly in case a future phase (Search,
   Phase 12) wants a cross-scope todo query and needs to add a new mode
   rather than assuming this one already does it.

3. **No `TODO_UPDATED` activity type — by original schema design, not an
   oversight.** Check `ActivityType` in `activity.repository.ts` (and the
   Postgres enum in `schema.prisma`/the Phase 2 migration SQL): it has
   `TODO_CREATED`, `TODO_COMPLETED`, `TODO_REOPENED`, `TODO_DELETED` — no
   generic "updated." Task has `TASK_UPDATED` for comparison, so this
   omission for Todo is deliberate, dating back to Phase 2. Consequence:
   `TodoService.update()` only records an activity when `isDone` is
   present **and actually changes** — a title-only rename or a no-op
   `isDone` write records nothing. Reordering (`TodoService.reorder()`)
   never records anything either, for the same reason. This is
   intentional, not a gap — don't "fix" it by inventing a new
   `ActivityType` without a real product reason, since that means a new
   migration in a phase that shouldn't need one.

4. **Activity is recorded *before* the delete, not after, in
   `TodoService.delete()` — the opposite order from
   `TaskService.softDelete()`.** Task soft-deletes (`deletedAt` set, row
   stays), so the order the activity log and the delete happen in doesn't
   matter — the row `Activity.taskId` points at still exists either way.
   Todo **hard**-deletes (no `deletedAt` column — see schema/master doc:
   soft-delete is Project + Task only). If the activity were recorded
   *after* `todoRepository.delete()`, the insert would try to set
   `Activity.todoId` to a row that Postgres has already removed, and the
   foreign key would reject it. Recording first means the FK's
   `ON DELETE SET NULL` fires naturally when the todo is deleted a moment
   later, exactly the same mechanism that already handles a user or
   project being purged. **This is a general pattern worth remembering
   for Phase 9 (Comment is also hard-delete, per the master doc) — same
   ordering will be needed there.**

5. **Reordering is up/down buttons swapping `position`, not
   drag-and-drop** — same reasoning and same call as Phase 7's Task Board
   status dropdown (`PHASE_7_HANDOFF.md` §4.3): no drag-and-drop library
   is in `package.json`. The difference this time: **a drag-and-drop
   library could actually be installed and verified now**, since this
   session has real npm access (§1) — unlike Phase 7, where "no network to
   verify a new dependency" was the blocking reason, not just "no time."
   Kept the button approach anyway, for consistency with the Task Board
   and because up/down buttons are simpler to keep accessible
   (keyboard/screen-reader friendly) without extra work. If drag
   interactions become a real product priority, Phase 9+ is a reasonable
   point to revisit both the Task Board and the Todo list together in one
   pass, now that installing the dependency is actually possible.
   `TodoRepository.swapPositions()` is the first `prisma.$transaction()`
   call in the codebase — needed for atomicity when writing two rows'
   `position` at once.

## 6. Mechanically, what Phase 8 built (same pattern as Phase 7 → Task)

**Backend** — `apps/server/src/modules/todos/`, file-for-file mirroring
`modules/tasks/`: `todo.schema.ts` → `todo.repository.ts` →
`todo.service.ts` → `todo.controller.ts` → `todo.routes.ts` →
`todo.module.ts`, plus `todo.service.test.ts` (18 tests). Registered at
`/api/todos` in `app.ts`. `TodoDto` already existed in
`@syncroot/shared-types` from Phase 2 — no shared-types changes needed.

**Frontend** — `apps/client/src/features/todos/`, mirroring
`features/tasks/`: `api.ts`, `hooks/useTodos.ts`,
`components/TodoItem.tsx`, `components/TodoList.tsx`. Replaced the
Phase 6 placeholder in `ProjectWorkspacePage.tsx`:

```tsx
{activeTab === "todos" && <TodoList projectId={id} />}
```

Reused `GlassCard`, `Button`, `Input`, `ConfirmDialog` — no new shared UI
primitive was needed this phase (Phase 7 added `Select`; Todo doesn't need
a dropdown for anything). Title editing is click-to-edit inline, same
interaction pattern as `ProjectHeader`'s name/description fields from
Phase 6, not a modal — todos are single-field enough that a modal would
be more ceremony than the task warrants, unlike Task (5 fields, genuinely
needs `TaskFormModal`).

**Not touched:** Prisma schema, migrations, seed — `Todo` already existed
in full since Phase 2 (confirmed by grepping the Phase 2 migration SQL for
`CREATE TABLE "todos"` before starting — it's there). Phase 8 only needed
to build the API and UI on top of it, exactly like Phase 7 did for Task.

## 7. Handoff for Phase 9 (Comment System) — read before starting

The master prompt describes Comment System as: Create, Edit, Delete,
Timestamps, Author. Per `SYNCROOT_MASTER.md` Part 2, `Comment` already has
a hand-added Postgres CHECK constraint enforcing exactly one of
project/task/todo is set — confirm this is really in the Phase 2 migration
SQL before assuming it, the same way §6 above confirmed `Todo` was there
for this phase. `Comment` is also **hard-delete** (`SYNCROOT_MASTER.md`
Part 2) — apply the §5.4 lesson from this phase: record `COMMENT_DELETED`
*before* deleting the row, not after, or the FK will reject the insert.

Unlike Todo, Comment doesn't have an open "which scope" product question —
it's explicitly multi-scope by schema design (project OR task OR todo, via
the CHECK constraint), so the API/UI need to actually support attaching a
comment to any of the three from the start, not defer scope the way Todo
deferred task-scoping. Where to surface comments in the UI (a comments
section per tab? A unified comments tab that filters by scope?) is worth
deciding explicitly and writing down here, the same way §5.1 did for Todo.

Mechanically: same pattern as Phases 7 and 8 — backend module mirroring
`modules/todos/`, frontend feature mirroring `features/todos/`, replace
the Phase 6 Comments tab placeholder in `ProjectWorkspacePage.tsx`.

## 8. Files changed or added — Phase 8 (on top of Phase 7's list)

**New — backend:**
- `apps/server/src/modules/todos/todo.schema.ts`
- `apps/server/src/modules/todos/todo.repository.ts`
- `apps/server/src/modules/todos/todo.service.ts`
- `apps/server/src/modules/todos/todo.controller.ts`
- `apps/server/src/modules/todos/todo.routes.ts`
- `apps/server/src/modules/todos/todo.module.ts`
- `apps/server/src/modules/todos/todo.service.test.ts` (18 test cases)

**New — frontend:**
- `apps/client/src/features/todos/api.ts`
- `apps/client/src/features/todos/hooks/useTodos.ts`
- `apps/client/src/features/todos/components/TodoItem.tsx`
- `apps/client/src/features/todos/components/TodoList.tsx`

**Changed:**
- `apps/server/src/app.ts` — registered `todoRouter` at `/api/todos`
- `apps/server/src/modules/tasks/task.service.ts` — **bug fix**, see §1.1
- `apps/server/src/modules/tasks/task.service.test.ts` — **lint fixes**,
  see §1.2
- `apps/client/src/features/project-workspace/components/WorkspaceTabs.tsx`
  — **lint fix** (pre-existing since Phase 6), see §1.2
- `apps/client/src/features/project-workspace/ProjectWorkspacePage.tsx` —
  Todos tab's placeholder replaced with `<TodoList projectId={id} />`,
  removed now-unused `CheckSquare` import
- `README.md` — status line, Known Gaps, Roadmap table, and the sandbox
  network-access note all updated for Phase 8
- `HOWTO.md` — added a Phase 8 verification section + quick-reference row
- `CHANGELOG.md` — added a Phase 8 entry

**Not touched:** Prisma schema, migrations, seed.

## 9. Style/communication reminders

- Persian conversation, English code.
- Concise, scannable, mobile-friendly responses.
- Challenge weak ideas, don't just execute uncritically.
- Be explicit about what's actually been verified vs. assumed correct.
- All future handoffs go in `handoffs/`, not the repo root.
