# HOWTO — Running & Testing SyncRoot, Phase by Phase

This guide assumes you've done the one-time setup below. Each phase
section then tells you exactly what to run and what you should see to
confirm that phase's work is actually functioning.

## One-time setup (do this once)

```bash
# Prerequisites: Node >= 20, Docker

npm install
docker compose up -d                          # starts local Postgres
cp apps/server/.env.example apps/server/.env
cp apps/client/.env.example apps/client/.env
npm run db:generate --workspace=apps/server    # generates the Prisma Client
npm run db:migrate                             # applies the schema
npm run db:seed                                # loads sample data (2 users, 1 project, tasks, todos, a comment)
```

If `db:migrate` or `db:generate` fail with a network/engine error, your
environment can't reach Prisma's binary CDN — check your network/firewall.
This is unrelated to the app code itself.

---

## Phase 1 — Project Initialization

**What to verify:** the toolchain itself works — no app logic yet.

```bash
npm run build   # builds shared-types -> server -> client, in that order
npm run lint    # ESLint across every workspace
```

Then:

```bash
npm run dev
```

Open **http://localhost:5173** — you should see a purple-accented dark
glass card. Open **http://localhost:4000/api/health** directly — you
should get `{"status":"ok","timestamp":"..."}`.

**If the server crashes with a `DATABASE_URL` error:** that's the exact
bug described in `CHANGELOG.md` under Phase 1 — it should already be
fixed in this codebase. If you see it, `apps/server/.env` is probably
missing (see one-time setup above).

---

## Phase 2 — Database

**What to verify:** the schema and seed data are real and queryable.

```bash
npm run db:studio --workspace=apps/server
```

Opens Prisma Studio in your browser (usually `localhost:5555`). You
should see 7 tables (`users`, `projects`, `tasks`, `todos`, `comments`,
`files`, `activities`) with the seed data already in them: 2 users
(Alice, Bob), 1 project ("SyncRoot Launch"), 3 tasks, 4 todos, 1 comment.

**To verify the soft-delete + CHECK constraint work at the DB level**,
connect with `psql` (or use Prisma Studio's row editor) and try:

```sql
-- Should fail -- comments must target exactly one of project/task/todo:
INSERT INTO comments (id, content, "authorId", "createdAt", "updatedAt")
VALUES ('test1', 'no target', (SELECT id FROM users LIMIT 1), now(), now());
```

This should be rejected by the `comments_exactly_one_target_chk` constraint.

---

## Phase 3 — Backend Foundation (Projects API)

**What to verify:** the Projects REST API works end-to-end, and the unit
test suite passes.

```bash
npm run test --workspace=apps/server
```

Expect: `18 passed`.

With the server running (`npm run dev:server`), test the API directly:

```bash
# List projects (X-User-Name is required on every route except /health)
curl -H "X-User-Name: TestUser" http://localhost:4000/api/projects

# Create a project
curl -X POST -H "X-User-Name: TestUser" -H "Content-Type: application/json" \
  -d '{"name":"My Test Project","description":"testing phase 3"}' \
  http://localhost:4000/api/projects

# Missing X-User-Name should 400:
curl -i http://localhost:4000/api/projects

# Invalid body should 422:
curl -i -X POST -H "X-User-Name: TestUser" -H "Content-Type: application/json" \
  -d '{}' http://localhost:4000/api/projects
```

Each create/update/delete should also insert a row into `activities` —
check Prisma Studio after running these.

---

## Phase 4 — Frontend Foundation

**What to verify:** layout, routing, and the first-launch name flow.

```bash
npm run dev:client
```

1. Open the app in a **private/incognito window** (so localStorage is
   empty) — you should see the "Welcome to SyncRoot" name prompt before
   anything else. Enter a name; it should disappear and show the layout.
2. Resize the browser below ~768px width — the sidebar should collapse
   behind a hamburger menu (top-left).
3. Click **Settings** in the sidebar — you should be able to change your
   name and see a "Saved" confirmation.
4. Check the top-right of the Navbar — a small dot should show
   "Connected" (green) if the server is running, or "Offline" (red) if not.

---

## Phase 5 — Dashboard

**What to verify:** full project CRUD from the UI, wired to the real API.

With both `npm run dev:server` and `npm run dev:client` running (or just `npm run dev`):

1. Go to `/` — you should see the seeded "SyncRoot Launch" project as a card.
2. Click **New project**, fill in a name, pick a color, submit — a new
   card should appear within ~1 second, and "Total projects" in the stats
   bar should increment.
3. Hover a project card — pencil/trash icons should appear top-right.
   Click the pencil, change the name, save — the card updates in place.
4. Click the trash icon — a confirm dialog appears; confirming removes
   the card (it's soft-deleted in the DB, not gone — check Prisma Studio,
   `deletedAt` should now be set on that row).
5. Type in the search box — after ~300ms the grid should filter to
   matching projects only.
6. Check the right-hand **Recent activity** panel — every create/edit/
   delete you just did should appear there, newest first, with a relative
   timestamp ("2 minutes ago").
7. Open a second browser tab on the same page — create a project in tab
   1, and within 15 seconds (no manual refresh) it should appear in tab 2
   too. This is the polling-based sync from `PHASE_0_PLANNING.md` — there's
   no WebSocket, so it's not instant, but it shouldn't require a refresh.

---

## Phase 6 — Project Workspace

**What to verify:** the page shell — header, tabs, and per-tab placeholders
— for a single project.

```bash
npm run dev
```

1. From the Dashboard, click a project card (not its pencil/trash icons) —
   you should land on `/projects/<id>` with a "← Dashboard" breadcrumb, the
   project's name/description/color bar, and a 5-tab strip: Board, Todos,
   Comments, Files, Activity.
2. Each tab should show a distinct placeholder card naming which phase
   builds its real content (Board → "Coming in Phase 7", Todos → Phase 8,
   Comments → Phase 9, Files → Phase 10, Activity → Phase 11).
3. Click through the tabs — the URL should update to `?tab=todos` etc.
   (except Board, which is the default and has no query param). Reload the
   page on a non-default tab — it should stay on that tab, not reset to
   Board.
4. Click the pencil icon in the header — the same edit modal from the
   Dashboard opens, prefilled. Change the name, save — the header updates
   in place, and if you go back to the Dashboard, the card reflects the
   change too.
5. Click the trash icon, confirm — you should be redirected to the
   Dashboard and the project should be gone from the grid (soft-deleted,
   same as Phase 5's delete).
6. Visit a URL for a project id that doesn't exist (or delete a project,
   then try to reload its old `/projects/<id>` URL) — you should see a
   "This project doesn't exist or was deleted" message with a button back
   to the Dashboard, not a crash or a blank page.
7. Check the **Sidebar** (left side, or the hamburger menu on mobile) — it
   should now list your actual projects (up to 8, most recent first) as
   clickable links, with the current project highlighted when you're on
   its workspace page. (This was a leftover bug from Phase 4/5 — see
   `handoffs/PHASE_6_HANDOFF.md`.)

**Known limitation for this phase specifically:** steps 1–7 above test the
shell, not real task/todo/comment/file/activity data — there isn't any yet.
That's Phases 7–11.

---

## Phase 7 — Task System

**What to verify:** the Board tab is now real — full task CRUD, status
moves, priority, due dates, and a completion progress bar.

```bash
npm run dev
```

1. Open a project, land on the **Board** tab (default) — you should see 4
   columns: To Do, In Progress, In Review, Done, each with a count and a
   "+" button.
2. Click "+" on any column — a "New task" modal opens with that column's
   status pre-selected. Fill in a title (required), optionally a
   description, priority, and due date. Save — the card should appear in
   the column you clicked "+" on, not always in "To Do".
3. Hover a task card — pencil and trash icons should fade in. Click the
   pencil — the same modal opens, prefilled, with "Save changes" instead
   of "Create task".
4. On a card, change the status dropdown at the bottom — the card should
   move to the new column immediately (no drag-and-drop in this phase —
   see `handoffs/PHASE_7_HANDOFF.md` for why).
5. Set a due date in the past on a task that isn't Done — the due date
   text on the card should render in red as "Overdue: …". Mark that task
   Done — the red overdue styling should go away even though the date is
   still in the past.
6. Once at least one task exists, a progress bar should appear above the
   columns showing "`N` of `M` tasks done" and a percentage — mark tasks
   Done/un-Done and confirm the bar updates.
7. Delete a task (trash icon → confirm) — it should disappear from the
   board. Go to the Dashboard — the "Recent Activity" widget should show
   the task creation/update/delete events you just made (Phase 7 tasks
   feed Phase 5's activity feed, since `ActivityService.record()` is
   shared infrastructure, not new).
8. Try creating a task with an empty title — should show an inline "Task
   title is required." error and NOT submit, rather than crashing or
   silently doing nothing.

**Known limitation for this phase specifically:** up to 100 tasks per
project are fetched in one page — no pagination/virtualization yet (fine
for V1 scale, see README's Known Gaps).

---

## Phase 8 — Todo System

**What to verify:** the Todos tab is now real — project-level checklist
items with completion tracking and reordering. This is the "barebones
usable" milestone: a user can now create a project, add tasks, add
todos, and see it all in the UI.

```bash
npm run dev
```

1. Open a project, go to the **Todos** tab.
2. Type a title in the "Add a todo…" box and submit (Enter or the +
   button) — it should appear at the bottom of the list immediately.
3. Click the checkbox on a todo — it should show a checkmark, the title
   should get a strikethrough, and the progress bar above the list
   (visible once at least one todo exists) should update its "`N` of `M`
   done" count and percentage.
4. Click a todo's title (not the checkbox) — it becomes an editable text
   field. Change the text and press Enter (or click away) — the new
   title should save. Press Escape instead — it should revert without
   saving.
5. Hover a todo — up/down chevrons and a trash icon should fade in. Use
   the chevrons to reorder a todo — the list order should update and
   persist across a page reload. The chevron should be visually disabled
   (and do nothing) at the top of the list for "up" and the bottom for
   "down".
6. Delete a todo (trash icon → confirm) — it should disappear from the
   list.
7. Go to the Dashboard's "Recent Activity" widget — you should see
   entries for todos you created and for ones you checked/unchecked, but
   **not** for a title-only rename or a reorder (see
   `handoffs/PHASE_8_HANDOFF.md` for why — there's no ActivityType for
   either of those, on purpose).
8. Try adding a todo with an empty/whitespace-only title — the Add
   button should stay disabled rather than submitting a blank item.

**Known limitation for this phase specifically:** todos are project-level
only in the UI — the backend already supports task-scoped todos
end-to-end (`taskId` on create/list), but no UI surfaces it yet. See
`handoffs/PHASE_8_HANDOFF.md`.

---

## Quick reference: one command per phase

| Phase | Fastest way to sanity-check it              |
| ----- | ------------------------------------------- |
| 1     | `npm run build`                             |
| 2     | `npm run db:studio --workspace=apps/server` |
| 3     | `npm run test --workspace=apps/server`      |
| 4     | `npm run dev:client`, open in incognito     |
| 5     | `npm run dev`, use the Dashboard UI         |
| 6     | `npm run dev`, open a project from the Dashboard |
| 7     | `npm run test --workspace=apps/server` (task.service.test.ts), then `npm run dev` and use the Board tab |
| 8     | `npm run test --workspace=apps/server` (todo.service.test.ts), then `npm run dev` and use the Todos tab |

This file will keep growing as new phases land — each new phase should
add its own section here before being marked done in `README.md`.
