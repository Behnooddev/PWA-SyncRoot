# API Reference

Base URL: `http://localhost:4000/api` (dev). All routes below are mounted
under this prefix.

## Conventions

- **Every request needs an `X-User-Name` header** (except `/health`) —
  there's no login; see [Architecture](Architecture). Missing it is a
  400, not a silent anonymous request.
- **Success shape:** `{ "data": ... }` — see `ApiSuccess<T>` in
  `@syncroot/shared-types`.
- **List endpoints** return an offset-paginated envelope:
  `{ "data": { "items": [...], "total": number, "limit": number, "offset": number } }`.
- **Error shape:** every thrown error becomes a JSON body via one
  centralized `errorHandler` — see [Architecture](Architecture).
- **Dates** are ISO-8601 strings in responses. `dueDate` on Task accepts
  either a bare `YYYY-MM-DD` or a full ISO datetime on input.
- A `PATCH` body must include **at least one** field — an empty object is
  rejected by validation, not silently accepted as a no-op.

## Projects — `/api/projects`

Soft-deleted. Reference implementation for every module that followed.

| Method | Path | Body / Query | Notes |
| --- | --- | --- | --- |
| `POST` | `/` | `{ name, description?, color? }` | `color` must be `#RRGGBB`; defaults to `#6E5AF0` |
| `GET` | `/` | `?search=&limit=&offset=` | `search` filters by name (case-insensitive) |
| `GET` | `/:id` | | 404 if missing or soft-deleted |
| `PATCH` | `/:id` | `{ name?, description?, color? }` | `description: null` clears it |
| `DELETE` | `/:id` | | soft-delete (`deletedAt` set) |

## Tasks — `/api/tasks`

Flat routes, not nested under `/api/projects/:id/tasks` — `projectId`
travels in the body/query instead, for consistency with every other
resource. `TaskService` still enforces the project relationship (404 on
a bad/missing `projectId`). Soft-deleted.

| Method | Path | Body / Query | Notes |
| --- | --- | --- | --- |
| `POST` | `/` | `{ projectId, title, description?, status?, priority?, dueDate? }` | `status` defaults `TODO`, `priority` defaults `MEDIUM` |
| `GET` | `/` | `?projectId=&status=&limit=&offset=` | `projectId` required |
| `GET` | `/:id` | | |
| `PATCH` | `/:id` | `{ title?, description?, status?, priority?, dueDate? }` | `description`/`dueDate: null` clears it |
| `DELETE` | `/:id` | | soft-delete |

## Todos — `/api/todos`

Hard-deleted (see [Architecture](Architecture) for why deletion order
matters here). Project-level only in the UI as of Phase 8, but the API
already supports task-scoped todos via `taskId`.

| Method | Path | Body / Query | Notes |
| --- | --- | --- | --- |
| `POST` | `/` | `{ projectId, taskId?, title }` | omit `taskId` for a project-level todo |
| `GET` | `/` | `?projectId=&taskId=&limit=&offset=` | omit `taskId` → project-level todos only (`taskId IS NULL`), **not** "everything" |
| `GET` | `/:id` | | |
| `PATCH` | `/:id` | `{ title?, isDone? }` | no way to set `position` directly — use reorder below |
| `PATCH` | `/:id/reorder` | `{ direction: "up" \| "down" }` | swaps position with the adjacent sibling in the same scope; returns the full updated list, not just the one todo; no-ops silently at either edge |
| `DELETE` | `/:id` | | hard delete |

## Activity — `/api/activity`

Read-only in Phase 5–8 — every mutation above calls
`ActivityService.record()` internally, but there's no direct write
endpoint (activity is a side effect of other actions, never created
directly by a client).

| Method | Path | Body / Query | Notes |
| --- | --- | --- | --- |
| `GET` | `/recent` | | powers the Dashboard's Recent Activity widget; **not** the full per-project timeline — that's `ActivityRepository.listForProject`'s cursor method, unused by any route until Phase 11 |

## Not yet built (Phases 9–13)

- `/api/comments` — Phase 9
- `/api/files` — Phase 10
- Full per-project Activity Timeline route — Phase 11 (the repository
  method already exists, just no route/UI yet)
- `/api/search` — Phase 12
- Settings-related routes — Phase 13 (username already works via the
  `X-User-Name` flow; Phase 13 is Appearance/Storage/Preferences)

See [Roadmap](Roadmap) for the full picture.
