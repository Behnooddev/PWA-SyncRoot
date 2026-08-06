# FAQ

### Why no authentication?

V1 is scoped for small, trusted teams where "who are you" matters more
than "prove it." First launch asks for a name, stores it in
`localStorage`, and every request carries it as `X-User-Name`. This is a
documented, explicit trade-off — see [Architecture](Architecture) and
`SECURITY.md` — not an oversight. It means **anyone who can reach the API
can act as any username**; don't deploy this publicly without adding real
auth first.

### Why no real-time sync (WebSockets)?

TanStack Query polling, configured per-feature (not one global interval),
covers V1's needs without the operational complexity of a WebSocket
layer (connection state, reconnection handling, scaling considerations).
A WebSocket layer is a reasonable candidate for a post-V1 phase if
collaborative editing latency becomes a real product need.

### Why do some things soft-delete and others hard-delete?

`Project` and `Task` soft-delete (a `deletedAt` column, row stays) so
activity history stays meaningful after deletion — you can still see "X
deleted task Y" in a feed and have `Y` resolve to something. `Todo` and
`Comment` hard-delete — lower stakes, no real product need to preserve
them after removal. See [Data Model](Data-Model) for the full breakdown,
and [Architecture](Architecture) for why hard-delete has to record its
Activity entry *before* deleting, not after.

### Why is `Activity` a nullable-FK table instead of a polymorphic `entityType`/`entityId` column?

Typed Prisma relations over raw flexibility. A polymorphic column would
need application-level joins and loses Prisma's type safety and `include`
ergonomics. The trade-off is one nullable FK column per entity type
`Activity` can reference (`taskId`, `todoId`, `commentId`, `fileId`) — a
few extra columns, but everything stays typed and `SetNull` on delete
"just works" via the database instead of manual cleanup code.

### Why is the Task Board a status dropdown instead of drag-and-drop?

Originally a forced call in Phase 7 — no drag-and-drop library was
installed, and the sandbox had no network access to add and verify one.
As of Phase 8 the sandbox does have network access, so this has become an
actual choice rather than a constraint. See
[Known Limitations](Known-Limitations).

### Why are Task routes flat (`/api/tasks`) instead of nested under `/api/projects/:id/tasks`?

Every other resource in the app (`Project`, `Activity`, `Todo`) is
already flat, with the parent relationship carried in the request
body/query instead of the URL. Nesting only `Task` would be an
inconsistent one-off. The service layer still enforces the relationship
(404s on a bad/missing `projectId`) — it's a URL-shape decision, not a
validation gap.

### Why don't Todo title edits or reorders show up in the Activity feed?

`ActivityType` (see [Data Model](Data-Model)) has `TODO_CREATED`,
`TODO_COMPLETED`, `TODO_REOPENED`, `TODO_DELETED` — no generic "updated."
This was a Phase 2 schema decision, not a Phase 8 oversight. Adding one
would mean a new enum value and a new migration in a phase that
shouldn't need either — if it turns out product-necessary, it's a small,
contained addition for a later phase to make deliberately.

### Are todos project-level or task-level?

Both, by schema design — `Todo.taskId` is optional. As of Phase 8, only
project-level todos have UI (the Todos tab). Task-scoped todos work
end-to-end in the API already; adding UI for them (e.g. an inline
checklist on a `TaskCard`) is a frontend-only addition. See
`handoffs/PHASE_8_HANDOFF.md`.

### Why is this the "SyncRoot Wiki" and not just more README?

The README answers "how do I run this." This wiki answers "why is it
built this way, and what's the current state of every part of it." The
`handoffs/PHASE_N_HANDOFF.md` files in the main repo go one level deeper
still — they're the engineering diary, written for whoever (human or AI)
picks up the next phase.
