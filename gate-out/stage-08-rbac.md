Status: PASS
Stage: 8
Domain: modules/backend
Ready For Next Stage: YES

---

Summary:

Extended the backend role system (Stage 6a: teacher/student) with three internal-operation
roles: admin, supervisor, and dev. New route groups `/api/admin/` and `/api/internal/sections`
expose moderation and full CRUD capabilities respectively. A `RequireAnyRole` middleware
helper lets supervisor and dev share a single route group without duplication. Section
deletion is guarded at the database level by Postgres FK RESTRICT on bookings.section_id.
ADR 002 documents the full role permission matrix.

---

Acceptance Criteria:

- [x] RoleSupervisor and RoleDev constants added to models.UserRoleType
      (models/user_role.go: RoleAdmin, RoleSupervisor, RoleDev)
- [x] RequireAnyRole middleware added — supervisor and dev share the same route group
      (middlewares/auth.go: RequireAnyRole(roles ...UserRoleType))
- [x] SectionRepository.Delete implemented
      (repositories/section_repo.go: Delete method)
- [x] SectionService.AdminUpdate (no ownership check) and SectionService.Delete added
      (services/section_service.go)
- [x] Admin: GET /api/admin/stats, GET /api/admin/teachers,
      POST /api/admin/teachers/:id/approve, POST /api/admin/teachers/:id/reject,
      GET /api/admin/sections, PUT+PATCH /api/admin/sections/:id,
      POST /api/admin/sections/:id/approve, POST /api/admin/sections/:id/reject
- [x] Supervisor/Dev: GET/POST/PUT/PATCH/DELETE /api/internal/sections[/:id]
- [x] Backend builds clean (go build ./...) — PASS
- [x] ADR 002 (docs/adrs/002-role-permission-matrix.md) documents the permission matrix

---

Modified Files:

* modules/backend/models/user_role.go — added RoleAdmin, RoleSupervisor, RoleDev constants
* modules/backend/middlewares/auth.go — added RequireAnyRole helper
* modules/backend/repositories/section_repo.go — added Delete method
* modules/backend/services/section_service.go — added AdminUpdate, Delete methods
* modules/backend/controllers/admin_controller.go (new) — admin moderation endpoints
* modules/backend/controllers/supervisor_controller.go (new) — supervisor/dev CRUD endpoints
* modules/backend/routes/routes.go — registered /api/admin and /api/internal/sections groups
* modules/backend/main.go — wired AdminController and SupervisorController
* docs/adrs/002-role-permission-matrix.md (new) — ADR for role permission design

---

Tests:

* go build ./... — PASS
* go vet ./... — PASS

---

Known Issues:

* No integration tests for new admin/supervisor routes in this stage; unit
  test coverage from Stage 6a booking service remains green.
* Postgres FK RESTRICT on bookings.section_id prevents deletion of sections with
  active bookings — this is intentional and documented in ADR 002.
