Stage: 5
Domain: modules/mobile-app
Status: PENDING
Model: claude-opus-4-8

Workspace: branch from main (after Stage 3 and Stage 4 merged)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage 5)
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md

Task:
Build the Expo app (Android + iPad):
- Mirror the student/teacher flows from the Wails app (section list,
  section detail, booking/checkout, teacher dashboard), reusing the
  mock booking/payment/enrollment logic contracts from Stage 3
- Integrate live class via Jitsi React Native SDK
- Connect whiteboard & document-highlight to the same Sync Service
  (Stage 4), using its documented protocol
- Verify real-time sync works between a Wails client and an Expo client

Gate-In Verified: NO
Prior Gate-Out: tasks/stage-3-gate-out.md, tasks/stage-4-gate-out.md (pending)
Prior Merge: tasks/stage-3-merge-approval.md, tasks/stage-4-merge-approval.md (pending)

Constraints:
- Branch from main only
- STOP after assigned work is complete
- Do NOT merge to dev/main directly
- Create PR targeting main via feature/mobile-app
