Stage: 8
Domain: modules/backend
Status: COMPLETE
Gate-In Verified: YES

---

## Objective

Extend the backend role system from Stage 6a (teacher/student) with three
internal-operation roles: admin, supervisor, and dev. Add new protected route
groups for moderation and full manual CRUD on sections.

---

## Tech Stack

- Same as Stage 6a: Fiber v3, Bun ORM, PostgreSQL
- No new dependencies required

---

## Role Design

| Role | Purpose | Route Prefix |
|------|---------|--------------|
| admin | Platform moderation — approve/reject teachers & sections, update any section | /api/admin/ |
| supervisor | Full manual CRUD on sections (any teacher's) | /api/internal/sections |
| dev | Same as supervisor — engineering/debugging access | /api/internal/sections |

---

## Deliverables

1. [x] RoleAdmin, RoleSupervisor, RoleDev constants in models/user_role.go
2. [x] RequireAnyRole middleware helper in middlewares/auth.go
3. [x] SectionRepository.Delete (Postgres FK RESTRICT enforced by DB)
4. [x] SectionService.AdminUpdate (no ownership check), SectionService.Delete
5. [x] AdminController — stats, teacher approval, section moderation
6. [x] SupervisorController — full CRUD on sections (shared by supervisor + dev)
7. [x] Routes registered: /api/admin/* and /api/internal/sections/*
8. [x] ADR 002 — role permission matrix documented

---

## Gate-In Requirements (verified)

- [x] Stage 6a merged to wansing (backend role system baseline exists)
- [x] Stage 7 merged to wansing (website consuming section API — ensure no breaking changes)

---

## Dispatch Authorization

Dev dispatched this stage directly. Execution authorized.
