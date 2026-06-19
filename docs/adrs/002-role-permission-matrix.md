---
name: role-permission-matrix
description: Permission matrix for admin, supervisor, and dev roles on section CRUD operations
metadata:
  type: project
---

# ADR 002 — Role Permission Matrix (admin / supervisor / dev)

**Date:** 2026-06-18  
**Status:** Accepted

## Context

Stage 6a defined two user-facing roles (`teacher`, `student`). As the platform grows, internal operators need controlled access to manage sections without being tied to the teacher ownership model.

Three new roles are introduced. They do **not** appear in the public auth flow — they are assigned manually via the `user_roles` table.

## Decision

### Role Definitions

| Role | Intended User | Key Restriction |
|------|--------------|-----------------|
| `admin` | Platform moderator | Can update section fields + approve/reject sections & teachers. Cannot create or delete sections. |
| `supervisor` | Ops/support staff | Full manual CRUD on any section. Can create sections on behalf of any teacher. |
| `dev` | Engineering team | Same permissions as supervisor — used for seeding, debugging, and local testing. |

### Endpoint Permission Matrix

| Endpoint | teacher | student | admin | supervisor | dev |
|----------|---------|---------|-------|------------|-----|
| `GET /api/sections` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `GET /api/sections/:id` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `POST /api/sections` | ✓ (own) | ✗ | ✗ | ✓ | ✓ |
| `PUT /api/sections/:id` | ✓ (own) | ✗ | ✗ | ✓ | ✓ |
| `PUT /api/admin/sections/:id` | ✗ | ✗ | ✓ | ✓ | ✓ |
| `PATCH /api/admin/sections/:id` | ✗ | ✗ | ✓ | ✓ | ✓ |
| `DELETE /api/internal/sections/:id` | ✗ | ✗ | ✗ | ✓ | ✓ |
| `GET /api/admin/teachers` | ✗ | ✗ | ✓ | ✗ | ✗ |
| `POST /api/admin/teachers/:id/approve` | ✗ | ✗ | ✓ | ✗ | ✗ |
| `POST /api/admin/sections/:id/approve` | ✗ | ✗ | ✓ | ✗ | ✗ |

### Route Groups

```
/api/admin/...           — RequireRole(admin)
/api/internal/sections   — RequireAnyRole(supervisor, dev)
```

`RequireAnyRole` is implemented as a pre-built set lookup so adding future roles is O(1).

### Delete Guard

`SectionService.Delete` relies on the existing Postgres `FK RESTRICT` constraint on `bookings.section_id`. If any booking (including `pending`) references the section, Postgres will reject the delete with a foreign key violation. The service surfaces this as a 500 with the DB error message. Supervisors must cancel or remove all bookings before deleting a section.

## Alternatives Considered

- **Single `internal` role** — rejected; admin moderators and engineering/ops staff have different responsibilities and should not share the full-delete permission.
- **Bitmask permissions** — overkill for the current scale; a simple role enum is easier to audit.

## Consequences

- `user_roles.role` column now accepts five values: `teacher`, `student`, `admin`, `supervisor`, `dev`.
- No database migration needed beyond the enum widening (Postgres `TEXT` column, no `CHECK` constraint).
- Adding a new internal role in the future: add the constant in `models/user_role.go` and pass it to `RequireAnyRole`.
