# ADR 001 — Split Stage 6 (Backend) by Domain and Adopt go-better-auth

**Date:** 2026-06-15
**Status:** ACCEPTED

## Context

Stage 6 was originally one monolithic stage covering: real API + DB,
teacher/student auth, switching the Wails app (modules/desktop-app) to
real API calls, switching the Expo app (modules/mobile-app) to real API
calls, and Jitsi room provisioning tied to enrollment.

This bundles three different domains (backend, desktop-app, mobile-app)
into a single dispatch, which:
- Cannot be parallelized — one agent must touch three modules sequentially
- Creates a large blast radius for a single PR
- Doesn't match the parallelism policy already established for Stage 2
  (2a infra / 2b integration) and Stage 4 (4a infra / 4b integration)

Additionally, no auth implementation was specified. The project needs a
Go-based auth solution for teacher/student roles that integrates with the
modules/backend API.

## Decision

1. **Split Stage 6 into three domain-scoped stages:**
   - **Stage 6a — Backend Core** (`modules/backend`): real API + DB
     implementing the Stage 3 contracts, teacher/student auth, and Jitsi
     room provisioning tied to enrollment.
   - **Stage 6b — Wails Backend Integration** (`modules/desktop-app`):
     switch the Wails app from mock logic (Stage 3) to real API calls
     against Stage 6a, including login/auth flows.
   - **Stage 6c — Expo Backend Integration** (`modules/mobile-app`):
     switch the Expo app (Stage 5) from mock logic to real API calls
     against Stage 6a, including login/auth flows.

   6b and 6c both depend only on 6a (+ their own prior stage) and have no
   dependency on each other — they run in parallel, matching the
   parallelism policy in PIPELINE.md.

2. **Adopt `github.com/m-t-a97/go-better-auth`** as the auth library for
   Stage 6a, providing teacher/student role-based authentication for the
   backend API.

3. **Stage 6a tech stack:**
   - Database: PostgreSQL
   - Web framework: Fiber v3 (Go)
   - ORM: Bun (uptrace/bun)
   - Auth: go-better-auth (item 2 above)

## Consequences

- PIPELINE.md Stage 6 entry is replaced by Stage 6a / 6b / 6c entries,
  each with its own Gate-In Requirements, Dispatch-In, Gate-Out, and
  Merge-Approval files.
- `tasks/state-6-backend.md` is replaced by `tasks/state-6a-backend-core.md`,
  `tasks/state-6b-wails-auth-integration.md`, and
  `tasks/state-6c-mobile-auth-integration.md`.
- Stage 6a must document its auth contract (session/token shape, role
  claims) in CONTRACTS.md so 6b and 6c can integrate independently.
- `go-better-auth` becomes a dependency of `modules/backend`; the worker
  for Stage 6a is responsible for verifying it meets the
  teacher/student role-auth requirement and documenting setup in
  modules/backend's README.
