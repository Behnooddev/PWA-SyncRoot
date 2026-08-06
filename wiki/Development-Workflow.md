# Development Workflow

SyncRoot is built one phase at a time, with an explicit process, because
that's what's kept 8 phases (so far) consistent and reviewable instead of
drifting.

## The rules

- **One phase at a time.** Explain the plan before coding. Finish, review
  your own code, list every file touched, list remaining work, **then
  stop and wait for explicit approval** before starting the next phase.
- **No placeholder/fake code, ever** — except explicitly-labeled
  workspace-tab placeholders for tabs a later phase owns (a deliberate
  scoping choice from Phase 6, not corner-cutting).
- **Architectural decisions are made explicitly, with rationale written
  down** — never silently. If a decision is delegated ("do whatever you
  think is best"), it still gets recorded in that phase's handoff.
- **Always run root-level aggregate commands**
  (`npm run lint` / `npm run test` / `npm run build` /
  `npm run format:check`), never just per-workspace. Two real bugs
  (missing `eslint.config.js` in `shared-types`, zero client tests) hid
  for multiple phases because only per-workspace commands were run — see
  `handoffs/` for the full story. A third, unrelated bug class was caught
  in Phase 8 the first time these commands actually ran with real network
  access (see below) — the rule keeps earning its place.
- **If something can't be verified in the current sandbox, say so
  explicitly** rather than assuming it works.
- Every new phase's testing steps get added to `HOWTO.md` **before** that
  phase is marked done in `README.md`.
- All handoffs live in `handoffs/PHASE_N_HANDOFF.md`, one per phase (or
  per cluster of phases handled together) — never scattered at the repo
  root.

## Verification checklist for any change

```bash
npm run build           # tsc + vite build, every workspace
npm run lint             # ESLint, --max-warnings=0, every workspace
npm run test              # Vitest, every workspace
npm run format:check       # Prettier check
```

All four at the **root**, all four clean, before calling anything done.

### Services are unit-testable without a database

Every backend module's `*.service.ts` takes its dependencies through the
constructor (repositories, other services) rather than importing
singletons. That's what lets `*.service.test.ts` mock every dependency
and run with zero database access — see any existing `*.service.test.ts`
for the pattern (fake repositories built with `vi.fn()`, asserted against
with `expect(...).toHaveBeenCalledWith(...)`).

## The sandbox / Prisma limitation

Some development sessions run in a sandbox that blocks network access to
`binaries.prisma.sh`. When that's the case:

- `prisma generate` can't produce a real typed Prisma Client.
- `prisma migrate dev` can't run — migration SQL has to be hand-written
  to match `schema.prisma`, not machine-generated.
- No Docker/Postgres available either → no live integration testing.

**What can always be verified regardless of network access:**
`npm install`\*, `tsc --noEmit`, `eslint`, `prettier`, `vite build`, and
`vitest run` — the codebase is deliberately structured so unit tests use
mocks/pure functions and constructor-injected repositories, never a live
DB.

\* *Actually — as of Phase 8, one session did have full npm registry
access, and `npm install` plus the whole verification suite ran for
real for the first time, catching two genuine bugs from Phase 7 that
had gone unverified until then. `binaries.prisma.sh` specifically was
still blocked. Network access can vary session to session — don't
assume based on a past handoff; check for yourself at the start of a
session (`npm install` is a fast, safe way to find out).*

**If you have real network access and Prisma still isn't reachable:**
run `npm install`, then `npm run db:generate --workspace=apps/server`. If
that succeeds, search the codebase for comments containing
"sandbox-only" or "this sandbox" (in `lib/prisma.ts` and file-level
`eslint-disable` headers in repository files) and remove those disables
— a real generated Prisma Client resolves the `any`-typing issue they
exist for. Also run `npm run db:migrate` once to let Prisma confirm or
regenerate any hand-written migration.

## Starting a new chat / session

Give a new chat `SYNCROOT_MASTER.md` (the single source of truth for
what/why/roadmap) plus the latest project zip, and the highest-numbered
`handoffs/PHASE_N_HANDOFF.md`. The handoff supersedes older ones — each
one explicitly folds forward everything still relevant from its
predecessor.
