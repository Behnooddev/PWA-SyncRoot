# Contributing to SyncRoot

SyncRoot is being built phase-by-phase (see `PHASE_0_PLANNING.md` and the
roadmap table in `README.md`). This doc covers the mechanics of
contributing; for _why_ things are built the way they are, read
`PHASE_0_PLANNING.md` first.

## Getting set up

See the **Getting Started** section of `README.md`. Short version:

```bash
npm install
docker compose up -d
cp apps/server/.env.example apps/server/.env
cp apps/client/.env.example apps/client/.env
npm run db:migrate && npm run db:seed
npm run dev
```

## Project structure

- `apps/client` — React 19 + Vite + Tailwind v4
- `apps/server` — Express + TypeScript, Controller → Service → Repository layering
- `packages/shared-types` — DTOs shared between client and server

## Before opening a PR

```bash
npm run lint          # ESLint across every workspace
npm run format:check  # Prettier check
npm run test          # Vitest across every workspace
npm run build          # Full production build
```

All four should pass. CI (`.github/workflows/ci.yml`) runs the same checks.

## Code style

- TypeScript strict mode everywhere — don't loosen `tsconfig.json` to make an error go away; fix the actual type issue.
- No `any` without an explicit, commented reason.
- New backend modules follow the existing `apps/server/src/modules/projects/` structure: `*.schema.ts` (Zod), `*.repository.ts` (only file touching Prisma), `*.service.ts` (business logic, constructor-injected dependencies for testability), `*.controller.ts` (HTTP only), `*.routes.ts`, `*.module.ts` (composition).
- Services should be unit-testable without a database — inject repositories via the constructor, don't import singletons directly inside a service.
- Run Prettier before committing (`npm run format`) — CI will reject unformatted code.

## Commit messages

Conventional, short, present tense: `fix: correct offset pagination bounds`, `feat: add task due-date filter`. Not strictly enforced yet, but appreciated.

## Reporting bugs / requesting features

Use the issue templates under `.github/ISSUE_TEMPLATE/`.
