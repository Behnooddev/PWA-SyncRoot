# SyncRoot — Handoff Summary (for Phase 7 onward)

**If you paste this into a new chat: attach the latest zip and say
"continue with Phase 7."** If you're writing Phase 7 yourself, this file
tells you exactly what Phase 6 built and — just as important — every place
it diverged from `MASTER PROMPT — SyncRoot` and the prior handoff doc, so
nothing surprises you later.

---

## 1. What SyncRoot is

Dark-themed, purple-accented collaborative workspace. React 19 + Express +
Postgres/Prisma npm-workspaces monorepo. No auth in V1, no real-time sync
in V1 (polling instead). Full spec + 15-phase roadmap: the project's own
master prompt. `PHASE_0_PLANNING.md` is referenced by `README.md` but was
**not present in the `syncroot-phase5-final.zip` this phase started
from** — either it wasn't exported, or it's only on your local machine.
Worth confirming it still exists somewhere; nothing in Phase 6 depended on
its content beyond what's already summarized in this file and README.

## 2. Process rules in effect (keep following these)

- One phase at a time. Finish, review, list files, list remaining work,
  stop and wait for approval before the next phase.
- Justify architectural decisions out loud.
- No placeholder/fake code — except the *explicitly-labeled* workspace-tab
  placeholders from Phase 6 itself, which are a deliberate scoping choice,
  not corner-cutting (see §4).
- User (Behnood) wants to be challenged, not just agreed with.
- Persian (Farsi) conversation, English code/comments.
- Every deliverable should be run/tested before being handed over — **this
  did NOT happen for Phase 6** the way it did for Phases 1–5. See §5,
  this is important.

## 3. Status: Phases 0–6 complete

| Phase | Scope                                                                       | Status  |
| ----- | ---------------------------------------------------------------------------- | ------- |
| 0     | Planning & architecture                                                      | ✅      |
| 1     | Project init & tooling                                                       | ✅      |
| 2     | Database: schema, migration SQL, seed, pagination utils                      | ✅      |
| 3     | Backend foundation: middleware, Users/Activity/**Projects** modules          | ✅      |
| 4     | Frontend foundation: layout, routing, theme, NameGate, UI primitives         | ✅      |
| 5     | Dashboard: project CRUD UI, search, stats, recent activity                   | ✅      |
| **6** | **Project Workspace: header + tab shell (Board/Todos/Comments/Files/Activity), tab content deferred** | ✅ **just finished** |
| 7     | Task System (board content + backend)                                        | ⏳ next |
| 8–11  | Todo System, Comment System, File Manager, Activity System                   | not started |
| 12–13 | Search, Settings                                                             | not started |
| 14    | PWA (full icon set, offline strategy)                                        | not started |
| 15    | Optimization, security, deployment prep                                      | not started |

Realistic usability estimate (unchanged from prior handoff, still holds):
barebones usable around end of Phase 8. Full original spec by Phase 13.
Production-hardened by Phase 15.

## 4. Phase 6 scope decision — READ THIS BEFORE STARTING PHASE 7

The original roadmap lists Phase 6 (Project Workspace) before Phases 7–11
(Task/Todo/Comment/File/Activity systems). Two options existed: build
Phase 6 as a full page (workspace shell + real Task Board together), or
build it as shell-only with placeholders and let 7–11 fill in each tab.

**Decision made (with the user's explicit go-ahead to use judgment):
shell-only.** `ProjectWorkspacePage` now has a real header (name,
description, color, edit, delete) and a real 5-tab strip with the active
tab persisted in the URL (`?tab=todos`, etc.) — but every tab body is a
`WorkspaceTabPlaceholder` naming the phase that replaces it. This mirrors
how Phase 4 built the app shell before Phase 5 filled in the Dashboard.

**What this means for Phase 7:** you do NOT need to build any workspace
layout, routing, header, or tab-switching. That's done. Task System's job
is narrower than the original phase description might suggest — it's:

1. Backend: `Task` module (schema/repository/service/controller/routes),
   mirroring `apps/server/src/modules/projects/` file-for-file. `TaskDto`
   already exists in `@syncroot/shared-types` — reuse it.
2. Frontend: replace the single line in
   `apps/client/src/features/project-workspace/ProjectWorkspacePage.tsx`
   that reads:
   ```tsx
   {activeTab === "board" && (
     <WorkspaceTabPlaceholder icon={KanbanSquare} title="Task board" ... phase={7} />
   )}
   ```
   with your real `<TaskBoard projectId={id} />` (or similar) component.
   Everything around it — the tab strip, the URL state, the header — stays
   as-is.

**Don't touch:** `ProjectHeader.tsx`, `WorkspaceTabs.tsx`, or the other
four placeholder blocks — those belong to Phase 6 and Phases 8–11
respectively.

## 5. ⚠️ Verification gap — different from every prior phase

**This sandbox (the one that did Phase 6) had zero network access at
all** — not even the npm registry (`npm install` failed with a 403
immediately). This is a step beyond the earlier "Prisma binary CDN is
blocked" limitation described in the prior handoff (§5 there) — this time
literally nothing could be installed, so **`tsc`, `eslint`, `prettier`,
`vitest`, and `vite build` were NOT run for Phase 6's code, at all.**

What WAS done instead, to compensate:
- Every new/changed file was read back in full after writing.
- A crude bracket/brace/paren balance check was run on every changed
  file (catches gross syntax breakage, nothing more).
- Line lengths were checked by hand against the 100-char Prettier
  `printWidth` and manually wrapped where the break was real code (import
  statements, multi-attribute JSX) — not attempted for long string
  literals, which Prettier can't break anyway (the pre-existing code has
  plenty of those too, e.g. `Sidebar.tsx`'s original className strings).
- Types were checked by hand against `ProjectDto`, `useQuery`'s return
  shape, etc., by reading the actual source of every function called.

**What this means for you:** before trusting Phase 6, run for real:

```bash
npm install
npm run build
npm run lint
npm run format:check
npm run test
```

If any of these fail, it's almost certainly in the new Phase 6 files:
`ProjectWorkspacePage.tsx`, `features/project-workspace/components/*`,
`Sidebar.tsx`, `features/projects/api.ts`, `features/projects/hooks/useProjects.ts`,
`packages/shared-types/src/index.ts` (comment-only change there). Phases
0–5's code was untouched and was already verified in earlier sessions.

## 6. Files changed or added in Phase 6

**New:**
- `apps/client/src/features/project-workspace/components/ProjectHeader.tsx`
- `apps/client/src/features/project-workspace/components/WorkspaceTabs.tsx`
- `apps/client/src/features/project-workspace/components/WorkspaceTabPlaceholder.tsx`
- `PHASE_6_HANDOFF.md` (this file)

**Rewritten:**
- `apps/client/src/features/project-workspace/ProjectWorkspacePage.tsx`
  (was a one-paragraph stub, now the real shell)

**Changed:**
- `apps/client/src/layouts/Sidebar.tsx` — **bug fix**, not a Phase 6
  feature per se: the project list here was still hardcoded to "No
  projects yet — Phase 5 wires this up" even though Phase 5 was long done.
  Now wired to `useProjects({ limit: 8 })`, with loading/empty/error
  states and active-route highlighting.
- `apps/client/src/features/projects/api.ts` — added `getProject(id)`
- `apps/client/src/features/projects/hooks/useProjects.ts` — added
  `useProject(id)` (404-aware: doesn't retry on a real 404)
- `apps/client/src/router/index.tsx` — comment-only update (was
  describing both Dashboard and Workspace as stubs; only Workspace still
  was)
- `packages/shared-types/src/index.ts` — comment-only fix (header said
  domain DTOs "are intentionally NOT defined here yet"; they've been
  defined in this same file since Phase 2 — the comment was just never
  updated)
- `README.md` — status line was still frozen at "Phase 1 complete, no
  business logic yet" despite Phases 2–5 being done; Known Gaps section
  still said "Prisma schema currently defines only datasource/generator"
  despite the full schema existing since Phase 2. Both corrected. Roadmap
  table updated to show Phase 6 done.
- `HOWTO.md` — added a "Phase 6" verification section + quick-reference
  table row
- `CHANGELOG.md` — added a Phase 6 entry, including the doc fixes above

**Not touched:** Prisma schema, migrations, seed, or any backend module —
Phase 6 was frontend-only by design (no new entities, no new API surface
beyond the pre-existing `GET /projects/:id`).

## 7. Pattern worth noticing: stale status text

Three separate places (`README.md`'s status line, `README.md`'s Known
Gaps, `Sidebar.tsx`'s placeholder text, `shared-types/index.ts`'s header
comment) had fallen out of sync with the code — each one written
correctly for the phase it was created in, then never revisited as later
phases shipped. None were caught by lint/tsc/tests because they're
comments or static strings, not logic. Worth a deliberate check for this
class of drift at the end of future phases too, since it won't show up in
`npm run test` output.

## 8. Style/communication reminders

- Persian conversation, English code.
- Concise, scannable, mobile-friendly responses.
- Challenge weak ideas, don't just execute uncritically.
- Be explicit about what's actually been verified vs. assumed correct —
  especially critical for Phase 6 given §5 above.
