# Security Policy

## Supported versions

SyncRoot is pre-1.0 and under active phase-by-phase development. Only the
latest state on the default branch is supported — there are no maintained
release branches yet.

## Reporting a vulnerability

If you find a security issue (e.g. an injection vector, an auth bypass —
note V1 has no authentication by design, see `PHASE_0_PLANNING.md` §1, so
that specific gap is a known, documented trade-off, not something to report),
please **do not open a public issue**. Instead, contact the maintainer
directly and allow time for a fix before public disclosure.

## Known, accepted risks in the current phase

These are intentional V1 scope decisions, not bugs:

- **No authentication.** Anyone who can reach the API can act as any
  username via the `X-User-Name` header. Do not deploy this publicly
  without adding real auth first.
- **No rate limiting** on the API yet.
- **Local file storage** has no virus/content scanning on upload.

These are tracked for later phases (see the roadmap in `README.md`) rather
than being silently ignored.
