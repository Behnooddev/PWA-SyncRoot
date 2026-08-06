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

## Quick reference: one command per phase

| Phase | Fastest way to sanity-check it              |
| ----- | ------------------------------------------- |
| 1     | `npm run build`                             |
| 2     | `npm run db:studio --workspace=apps/server` |
| 3     | `npm run test --workspace=apps/server`      |
| 4     | `npm run dev:client`, open in incognito     |
| 5     | `npm run dev`, use the Dashboard UI         |

This file will keep growing as new phases land — each new phase should
add its own section here before being marked done in `README.md`.
