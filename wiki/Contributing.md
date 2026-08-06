# Contributing

The canonical, always-up-to-date contributing guide is
[`CONTRIBUTING.md`](https://github.com/OWNER/syncroot/blob/main/CONTRIBUTING.md)
in the main repo — this page is a shorter orientation that links out to
it rather than duplicating it.

## Quick version

```bash
npm install
docker compose up -d
cp apps/server/.env.example apps/server/.env
cp apps/client/.env.example apps/client/.env
npm run db:migrate && npm run db:seed
npm run dev
```

Before opening a PR, all four must pass at the root:

```bash
npm run lint
npm run format:check
npm run test
npm run build
```

CI runs the same four checks.

## Code style

- TypeScript strict mode everywhere — fix the actual type issue, don't
  loosen `tsconfig.json`.
- No `any` without an explicit, commented reason.
- New backend modules follow `apps/server/src/modules/projects/`'s
  structure exactly: `*.schema.ts` (Zod) → `*.repository.ts` (only file
  touching Prisma) → `*.service.ts` (business logic, constructor-injected
  dependencies) → `*.controller.ts` (HTTP only) → `*.routes.ts` →
  `*.module.ts` (composition). See [Architecture](Architecture).
- Services must be unit-testable without a database — inject
  repositories via the constructor.

## If you're picking up the next phase

This project is built one phase at a time with an explicit process — see
[Development Workflow](Development-Workflow) before starting. In short:
read the highest-numbered `handoffs/PHASE_N_HANDOFF.md` in the main repo
first, mirror the existing module pattern file-for-file, run the full
root verification suite before calling anything done, and write your own
`handoffs/PHASE_N_HANDOFF.md` when you're finished.

## Reporting bugs / requesting features

Use the issue templates under `.github/ISSUE_TEMPLATE/` in the main repo.

## Security issues

Do **not** open a public issue for a security vulnerability — see
[`SECURITY.md`](https://github.com/OWNER/syncroot/blob/main/SECURITY.md).
