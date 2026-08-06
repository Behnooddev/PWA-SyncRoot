# Data Model

Source of truth: `apps/server/prisma/schema.prisma`. This page summarizes
it — if the two ever disagree, the schema file wins and this page is
stale (please open an issue).

## Entity relationship overview

```
User ──┬── created ──> Project ──┬── has many ──> Task ──┬── has many ──> Todo (optional taskId)
       │                          │                        │
       │                          ├── has many ──> Todo     ├── has many ──> Comment
       │                          │   (project-level,        ├── has many ──> FileAsset
       │                          │    taskId: null)          │
       │                          ├── has many ──> Comment    │
       │                          ├── has many ──> FileAsset  │
       │                          └── has many ──> Activity   │
       │                                                       │
       └── acts as actor/author/uploader on ──> Task, Todo, Comment, FileAsset, Activity
```

`Comment` attaches to exactly one of `Project`, `Task`, or `Todo` (a
hand-added Postgres CHECK constraint enforces this — see
[Architecture](Architecture)). `Todo` attaches to a `Project` always, and
optionally to a `Task` (see [FAQ](FAQ) for the project-level vs
task-scoped distinction).

## Models

### User
No auth — created the first time a name is seen in the `X-User-Name`
header. `name` is unique.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` (cuid) | |
| `name` | `String` | unique |
| `createdAt` | `DateTime` | |

### Project
The top-level container. **Soft-deleted.**

| Field | Type | Notes |
| --- | --- | --- |
| `id`, `name`, `description?` | | |
| `color` | `String` | hex, defaults to the app accent `#6E5AF0` |
| `createdById` | `String` | FK → User |
| `createdAt`, `updatedAt`, `deletedAt?` | | |

### Task
Belongs to exactly one Project. **Soft-deleted.**

| Field | Type | Notes |
| --- | --- | --- |
| `id`, `title`, `description?` | | |
| `status` | enum | `TODO \| IN_PROGRESS \| IN_REVIEW \| DONE` |
| `priority` | enum | `LOW \| MEDIUM \| HIGH \| URGENT` |
| `dueDate?` | `DateTime` | |
| `projectId` | `String` | FK → Project, `onDelete: Cascade` |
| `createdById` | `String` | FK → User |
| `createdAt`, `updatedAt`, `deletedAt?` | | |

### Todo
Belongs to a Project always, and *optionally* to a Task. **Hard-deleted**
(no `deletedAt` — see [Architecture](Architecture) for why that matters
for Activity logging).

| Field | Type | Notes |
| --- | --- | --- |
| `id`, `title` | | |
| `isDone` | `Boolean` | default `false` |
| `position` | `Int` | manual sort order within its list (project-level or task-level) |
| `projectId` | `String` | FK → Project, `onDelete: Cascade` |
| `taskId?` | `String` | FK → Task, `onDelete: Cascade`. `null` = project-level todo |
| `createdById` | `String` | FK → User |
| `createdAt`, `updatedAt` | | |

As of Phase 8, the UI only creates/lists todos with `taskId: null`
(project-level). The schema, repository, and service all support
task-scoped todos already — it's a UI scope decision, not a data-model
gap. See `handoffs/PHASE_8_HANDOFF.md`.

### Comment
Attaches to exactly one of Project/Task/Todo. **Hard-deleted.**

| Field | Type | Notes |
| --- | --- | --- |
| `id`, `content` | | |
| `authorId` | `String` | FK → User |
| `projectId?`, `taskId?`, `todoId?` | `String` | exactly one is non-null (CHECK constraint) |
| `createdAt`, `updatedAt` | | |

Not yet built — this is Phase 9.

### FileAsset
Metadata row for an uploaded file. `storageKey` is an opaque key from
`StorageProvider.save()`, never a raw filesystem path — this is what
makes swapping to S3/MinIO later a new `StorageProvider` implementation,
not a schema change.

| Field | Type | Notes |
| --- | --- | --- |
| `id`, `originalName`, `mimeType` | | |
| `sizeBytes` | `Int` | |
| `storageKey` | `String` | unique, opaque |
| `projectId` | `String` | FK → Project, `onDelete: Cascade` |
| `taskId?` | `String` | FK → Task, `onDelete: Cascade` |
| `uploadedById` | `String` | FK → User |
| `createdAt` | | |

Not yet built — this is Phase 10.

### Activity
Append-only audit/feed log — never updated or deleted by user action,
only inserted by services.

| Field | Type | Notes |
| --- | --- | --- |
| `id`, `type` | | see `ActivityType` enum below |
| `projectId` | `String` | FK → Project, `onDelete: Cascade` |
| `actorId` | `String` | FK → User |
| `taskId?`, `todoId?`, `commentId?`, `fileId?` | `String` | all `onDelete: SetNull`, not Cascade |
| `metadata?` | `Json` | snapshot data (e.g. a deleted task's title) so the feed still renders a label after the row is gone |
| `createdAt` | | |

`ActivityType` values, and which have shipped so far:

| Entity | Created | Updated | Completed/Reopened | Deleted |
| --- | --- | --- | --- | --- |
| Project | ✅ | ✅ | — | ✅ |
| Task | ✅ | ✅ | — | ✅ |
| Todo | ✅ | — (no such type, by design) | ✅ / ✅ | ✅ |
| Comment | not built yet | — | — | not built yet |
| File | not built yet | — | — | not built yet |

Todo deliberately has no generic "updated" type — a title-only edit or a
reorder records nothing; only create, delete, and an actual
done/not-done flip do. See [Architecture](Architecture)'s note on
hard-delete ordering and `handoffs/PHASE_8_HANDOFF.md` §5.3.

## Migrations

Migration SQL lives in `apps/server/prisma/migrations/`. As of Phase 8,
every table above already existed from the single Phase 2 migration — no
schema changes have been needed since. See
[Development Workflow](Development-Workflow) for the sandbox limitation
around `prisma generate`/`migrate dev`.
