Stage: 8
Domain: modules/backend
Branch: wansing
Status: APPROVED

PR Title: feat(backend): Stage 8 — RBAC expansion (admin / supervisor / dev roles)

PR Description:
## What
Extended the backend role system (Stage 6a: teacher/student) with three
internal-operation roles. New route groups give admin moderation power and
give supervisor/dev full manual CRUD over sections via a shared
RequireAnyRole middleware gate. Section deletion is enforced at the DB level
(FK RESTRICT on bookings.section_id). Role permission matrix documented in ADR 002.

## Files Changed
* modules/backend/models/user_role.go — RoleAdmin, RoleSupervisor, RoleDev constants
* modules/backend/middlewares/auth.go — RequireAnyRole helper
* modules/backend/repositories/section_repo.go — Delete method
* modules/backend/services/section_service.go — AdminUpdate (no owner check), Delete
* modules/backend/controllers/admin_controller.go (new) — moderation endpoints
* modules/backend/controllers/supervisor_controller.go (new) — full CRUD endpoints
* modules/backend/routes/routes.go — /api/admin/* and /api/internal/sections/* groups
* modules/backend/main.go — wired new controllers
* docs/adrs/002-role-permission-matrix.md (new)

## Dependencies Added
* none

## Tests
* go build ./... — PASS
* go vet ./... — PASS
* Pre-existing booking service unit tests — PASS

## Acceptance Criteria
- [x] RoleSupervisor and RoleDev constants added to models.UserRoleType
- [x] RequireAnyRole middleware — supervisor and dev share one route group
- [x] SectionRepository.Delete implemented
- [x] SectionService.AdminUpdate (no ownership check) and SectionService.Delete added
- [x] Admin: GET /api/admin/stats, teachers list + approve/reject, sections list + update + approve/reject
- [x] Supervisor/Dev: GET/POST/PUT/PATCH/DELETE /api/internal/sections[/:id]
- [x] go build ./... and go test ./... green
- [x] ADR 002 documents role permission matrix

## Known Issues
* No integration tests for new admin/supervisor routes; unit test coverage from
  Stage 6a remains green.
* Deleting a section with active bookings returns a Postgres FK RESTRICT error —
  intentional behavior documented in ADR 002.

Merge Strategy: squash
Base Branch: wansing
Ready to Merge: YES

---

## Conductor Approval

Gate-Out Status: PASS
Approved By: Dev
Approved Date: 2026-06-19
