Stage: 3
Domain: modules/desktop-app
Status: READY
Model: claude-opus-4-8

Workspace: branch from wansing (Stage 1 merged to wansing)

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

<<<<<<< HEAD
Gate-In Verified: NO
Prior Gate-Out: tasks/state-1-desktop-app-gate-out.md (pending)
Prior Merge: tasks/state-1-desktop-app-merge-approval.md (pending)
=======
Gate-In Verified: YES
Prior Gate-Out: gate-out/state-1-desktop-app.md
Prior Merge: merge-approval/state-1-desktop-app.md
>>>>>>> wansing

Constraints:
- Branch from wansing only — do NOT branch from feature/desktop-app
- STOP after assigned work is complete
- Do NOT merge to wansing/main directly
- Create PR targeting wansing via feature/booking-logic
