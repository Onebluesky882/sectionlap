Stage: 3
Domain: modules/desktop-app
Status: PENDING
Model: claude-opus-4-8

Workspace: branch from main (after Stage 1 merged)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage 3)
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md

Task:
Add booking/payment/enrollment logic on top of the Stage 1 mock data,
still entirely local (no backend/API):
- Booking: prevent double-booking, enforce section capacity
- Payment: simulate transaction states (pending → paid → failed)
- Enrollment: on "paid", unlock section content + "Join Live Class"
- Role logic: teacher sees own posted sections; student sees only
  purchased sections
- Persist state in local storage
- Document the input/output shapes of this logic in CONTRACTS.md so
  Stage 6 (backend) can implement the same contracts

Gate-In Verified: NO
Prior Gate-Out: tasks/stage-1-gate-out.md (pending)
Prior Merge: tasks/stage-1-merge-approval.md (pending)

Constraints:
- Branch from main only — do NOT branch from feature/desktop-app
- STOP after assigned work is complete
- Do NOT merge to dev/main directly
- Create PR targeting main via feature/booking-logic
