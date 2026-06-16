Stage: 6a
Domain: modules/backend
Status: IN PROGRESS
Model: claude-opus-4-8

Workspace: branch from wansing (after Stage 3 merged)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage 6a)
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md
- docs/adrs/001-split-stage-6-backend-and-auth-library.md

Task:
Implement the real backend, replacing the mock booking/payment/enrollment
logic introduced in Stage 3:
- Go API server using Fiber v3
- PostgreSQL database accessed via Bun ORM (uptrace/bun)
- Real API + DB implementing the contracts defined during Stage 3
  (see CONTRACTS.md)
- Teacher/student auth using github.com/m-t-a97/go-better-auth
- Provision Jitsi room access tied to enrollment status (paid students only)
- Document the auth/session contract (token/session shape, role claims)
  and API endpoints in CONTRACTS.md so Stage 6b (Wails) and Stage 6c (Expo)
  can integrate independently and in parallel
- Document setup/run instructions (DB migrations, env vars) in
  modules/backend/README.md

Gate-In Verified: YES
Prior Gate-Out: gate-out/state-3-booking-logic.md
Prior Merge: merge-approval/state-3-booking-logic.md

Constraints:
- Branch from wansing only
- STOP after assigned work is complete
- Do NOT merge to wansing/main directly
- Do NOT touch modules/desktop-app or modules/mobile-app
- Create PR targeting wansing via feature/backend-core
