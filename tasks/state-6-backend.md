Stage: 6
Domain: modules/backend
Status: PENDING
Model: claude-opus-4-8

Workspace: branch from main (after Stage 3 and Stage 5 merged)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage 6)
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md

Task:
Implement the real backend, replacing the mock booking/payment/enrollment
logic introduced in Stage 3:
- Real API + DB implementing the contracts defined during Stage 3
  (see CONTRACTS.md)
- Teacher/student auth
- Switch the Wails app (Stage 1/3) from mock logic to real API calls
- Switch the Expo app (Stage 5) from mock logic to real API calls
- Provision Jitsi room access tied to enrollment status (paid students only)

Gate-In Verified: NO
Prior Gate-Out: tasks/stage-3-gate-out.md, tasks/stage-5-gate-out.md (pending)
Prior Merge: tasks/stage-3-merge-approval.md, tasks/stage-5-merge-approval.md (pending)

Constraints:
- Branch from main only
- STOP after assigned work is complete
- Do NOT merge to dev/main directly
- Create PR targeting main via feature/backend
