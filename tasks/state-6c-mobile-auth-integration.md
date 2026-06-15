Stage: 6c
Domain: modules/mobile-app
Status: PENDING
Model: claude-opus-4-8

Workspace: branch from wansing (after Stage 5 and Stage 6a merged)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage 6c)
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md

Task:
Switch the Expo app from Stage 5's mock booking/payment/enrollment logic
to real API calls against the Stage 6a backend:
- Replace mock logic with calls to the Stage 6a API (booking, payment,
  enrollment) per CONTRACTS.md
- Add teacher/student login flow wired to go-better-auth via the Stage 6a
  API (session/token handling per CONTRACTS.md)
- Keep live-class (Jitsi React Native SDK) and sync-service integrations
  unchanged

Gate-In Verified: NO
Prior Gate-Out: gate-out/state-5-mobile-app.md, gate-out/state-6a-backend-core.md (pending)
Prior Merge: merge-approval/state-5-mobile-app.md, merge-approval/state-6a-backend-core.md (pending)

Constraints:
- Branch from wansing only
- STOP after assigned work is complete
- Do NOT merge to wansing/main directly
- Create PR targeting wansing via feature/mobile-auth-integration
