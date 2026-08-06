# Known Limitations

Honest, not hidden. This page mirrors README's "Known Gaps" section —
if they ever disagree, treat this as possibly-stale and check
`README.md` in the main repo.

## Scoped-out features (later phases will fill these in)

- **Comments, Files, and the full Activity timeline** don't exist yet in
  the UI — the Project Workspace shows a labeled placeholder for each,
  naming the phase that builds it (9, 10, 11 respectively).
- **PWA manifest** ships one SVG icon only. Proper 192×192/512×512 PNG +
  maskable icons, offline support, and an install prompt are Phase 14.
- **Search** doesn't exist yet — Phase 12.
- **Settings** beyond the username (which already works via
  `X-User-Name`) — Appearance/Storage/Preferences are Phase 13.

## Deliberate scope trade-offs (not bugs, but real product deviations)

- **No drag-and-drop.** Both the Task Board's status change and Todo
  reordering use buttons/dropdowns instead of dragging. This was
  originally a *forced* call in Phase 7 (no network access to install and
  verify a drag-and-drop library). As of Phase 8, network access exists,
  so this is now a genuine choice rather than a constraint — revisit if
  drag interactions become a real product priority.
- **Todos are project-level only in the UI.** The backend fully supports
  task-scoped todos (`taskId` on create/list, validated end-to-end) —
  only the frontend doesn't surface it. See `handoffs/PHASE_8_HANDOFF.md`.
- **Task Board and Todo list each fetch up to 100 items per project in
  one page** — no real pagination/virtualization. Fine at V1 scale; would
  need revisiting for a project with a very large backlog.
- **No authentication, no real-time sync.** Both explicit V1 architecture
  decisions, documented in [Architecture](Architecture) and [FAQ](FAQ) —
  not oversights.

## Verification status

- `npm run build` / `lint` / `test` / `format:check` all pass at the root
  as of Phase 8 — and, as of Phase 8, were actually run for real (not
  just manually reasoned about) for the first time, catching two real
  Phase 7 bugs in the process. See [Development Workflow](Development-Workflow).
- **`binaries.prisma.sh` is still blocked in the current sandbox**, so
  `prisma generate` / `prisma migrate dev` can't run, and there's no
  Docker/Postgres available either — meaning **no live-database
  integration test has ever been run** for any phase. Every migration is
  hand-written to match `schema.prisma`, and every service test runs
  against mocked repositories, not a real database. This is the single
  biggest open verification gap in the project.

## Security

See `SECURITY.md` in the main repo. In short: no auth and no rate
limiting are known, accepted V1 risks — **do not deploy this publicly**
without addressing them first (planned for Phase 15's security review).
