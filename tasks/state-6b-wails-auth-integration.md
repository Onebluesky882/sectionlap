Stage: 6b
Domain: modules/desktop-app
Status: PENDING
Model: claude-opus-4-8

Workspace: branch from wansing (after Stage 3 and Stage 6a merged)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage 6b)
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md

Task:
Switch the Wails app from Stage 3's mock booking/payment/enrollment logic
to real API calls against the Stage 6a backend:
- Replace local-storage-backed mock logic with calls to the Stage 6a API
  (booking, payment, enrollment) per CONTRACTS.md
- Add teacher/student login flow wired to go-better-auth via the Stage 6a
  API (session/token handling per CONTRACTS.md)
- Keep Live Class (Stage 2b) and sync-service (Stage 4b) integrations
  unchanged

Gate-In Verified: NO
Prior Gate-Out: gate-out/state-3-booking-logic.md, gate-out/state-6a-backend-core.md (pending)
Prior Merge: merge-approval/state-3-booking-logic.md, merge-approval/state-6a-backend-core.md (pending)

Constraints:
- Branch from wansing only — do NOT branch from feature/desktop-app
- STOP after assigned work is complete
- Do NOT merge to wansing/main directly
- Create PR targeting wansing via feature/wails-auth-integration
