Stage: 6a
Domain: modules/backend
Branch: feature/backend-core
Status: APPROVED

PR Title: feat(backend): Stage 6a — Backend Core (Fiber v3 + PostgreSQL + go-better-auth + Jitsi)

PR Description:
## What
Implemented the real backend API server replacing the mock booking/payment/enrollment
logic from Stage 3. Full layered Go service built with Fiber v3, PostgreSQL + Bun ORM,
go-better-auth (github.com/Authula/authula v1.11.0) for teacher/student auth, and
Jitsi JWT provisioning tied to enrollment status.

All Stage 3 contracts are implemented exactly — clients (Wails Stage 6b, Expo Stage 6c)
can swap mock logic for real API calls without UI changes. Auth/session contract has
been merged into CONTRACTS.md for 6b/6c to consume.

## Files Changed
* modules/backend/cmd/server/main.go
* modules/backend/config/env.go
* modules/backend/db/db.go
* modules/backend/models/section.go
* modules/backend/models/booking.go
* modules/backend/models/user_role.go
* modules/backend/repositories/section_repo.go
* modules/backend/repositories/booking_repo.go
* modules/backend/repositories/user_role_repo.go
* modules/backend/services/section_service.go
* modules/backend/services/booking_service.go
* modules/backend/services/jitsi_service.go
* modules/backend/controllers/auth_controller.go
* modules/backend/controllers/section_controller.go
* modules/backend/controllers/booking_controller.go
* modules/backend/controllers/jitsi_controller.go
* modules/backend/middlewares/auth.go
* modules/backend/routes/routes.go
* modules/backend/go.mod
* modules/backend/go.sum
* modules/backend/.env.example
* modules/backend/.gitignore
* modules/backend/README.md
* modules/backend/API_CONTRACT.md

## Dependencies Added
* github.com/Authula/authula@v1.11.0 — go-better-auth (approved, DECISIONS.md 007)
* github.com/gofiber/fiber/v3@v3.3.0 — approved web framework (DECISIONS.md 004)
* github.com/uptrace/bun@v1.2.18 — approved ORM (DECISIONS.md 005)
* github.com/uptrace/bun/dialect/pgdialect@v1.2.18
* github.com/uptrace/bun/driver/pgdriver@v1.2.18
* github.com/golang-jwt/jwt/v5@v5.2.2 — Jitsi JWT (HS256)
* github.com/google/uuid@v1.6.0
* github.com/joho/godotenv@v1.5.1

## Tests
* TestCreateBooking_Success — PASS
* TestCreateBooking_AlreadyBooked — PASS
* TestCreateBooking_CapacityFull — PASS
* TestPayBooking — PASS
* TestFailBooking — PASS
* TestRetryBooking — PASS
* TestFailedBookingNotCountedInCapacity — PASS

All 7 unit tests PASS (`go test ./services/... -v`)
`go build ./...` — PASS
`go vet ./...` — PASS

## Acceptance Criteria
- [x] Real API + DB (PostgreSQL via Bun) implementing Stage 3 contracts
- [x] Fiber v3 HTTP server exposing the API
- [x] Auth for teacher/student roles via go-better-auth
- [x] Jitsi room provisioning tied to enrollment (paid students only)
- [x] Auth/session contract documented in CONTRACTS.md for Stage 6b/6c

## Known Issues
* No PostgreSQL in CI — integration tests require a running Postgres instance;
  unit tests (booking service) use mocks and pass without a database.
* Jitsi JWT endpoint requires `JITSI_APP_SECRET`; returns 500 if not set (safe fail).
* Pre-existing TypeScript strict-null errors in 4 desktop-app files from prior
  stages — unrelated to Stage 6a.

Merge Strategy: squash
Base Branch: wansing
Ready to Merge: YES
