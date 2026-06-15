Status:
PASS

Stage:
3

Domain:
modules/desktop-app

Summary:
Implemented mock booking/payment/enrollment logic on top of the Stage 1
Wails frontend shell, entirely local (Zustand store + localStorage, no
backend/API).

- Booking: `createBooking(sectionId)` prevents double-booking (returns the
  existing active booking with `error: "ALREADY_BOOKED"` if the current
  student already has a pending/paid booking for the section) and enforces
  section capacity (`error: "CAPACITY_FULL"` once active bookings reach
  `section.capacity`).
- Payment: `BookingRecord.status` simulates `pending → paid → failed`, plus
  `retryBooking` to move `failed → pending`. CheckoutPage exposes "Pay",
  "Simulate Failed Payment", and "Retry Payment" actions and shows
  capacity-full state.
- Enrollment: a `paid` booking unlocks the "Enrolled" banner and "Join Live
  Class" button on SectionDetailPage, and surfaces the section in the new
  "My Enrollments" page (student role).
- Role logic: added `User`/`UserRole` + mock `currentUser` with a
  `switchRole` action (NavBar "Switch Role" button toggles between a mock
  teacher and mock student). Teacher Dashboard now filters to
  `sections.filter(s => s.teacherId === currentUser.id)` and is gated to the
  teacher role; "My Enrollments" (student-only nav link) shows only sections
  with a paid booking for the current student.
- Section model extended with `teacherId` and `capacity`; SectionForm has a
  new Capacity field; SectionCard/SectionListPage/SectionDetailPage show
  seat counts (`enrolledCount/capacity`).
- Persistence: Zustand `persist` bumped to version 2 with a `migrate` that
  resets to default mock state for any pre-v2 persisted data (Stage 1 shape
  is incompatible with the new Section/BookingRecord fields).
- Documented all input/output shapes (Section, User, BookingRecord,
  CreateBookingResult/BookingError, and each operation's behavior) in
  CONTRACTS.md for Stage 6 to implement against.

Modified Files:
- modules/desktop-app/frontend/src/types.ts
- modules/desktop-app/frontend/src/store/useAppStore.ts
- modules/desktop-app/frontend/src/data/mockSections.ts
- modules/desktop-app/frontend/src/hooks/useSection.ts
- modules/desktop-app/frontend/src/hooks/useCheckout.ts
- modules/desktop-app/frontend/src/hooks/useSectionForm.ts
- modules/desktop-app/frontend/src/components/SectionForm.tsx
- modules/desktop-app/frontend/src/components/SectionCard.tsx
- modules/desktop-app/frontend/src/components/NavBar.tsx
- modules/desktop-app/frontend/src/pages/SectionListPage.tsx
- modules/desktop-app/frontend/src/pages/SectionDetailPage.tsx
- modules/desktop-app/frontend/src/pages/CheckoutPage.tsx
- modules/desktop-app/frontend/src/pages/TeacherDashboardPage.tsx
- modules/desktop-app/frontend/src/App.tsx
- modules/desktop-app/frontend/src/App.css
- CONTRACTS.md

New Files:
- modules/desktop-app/frontend/src/data/mockUsers.ts (MOCK_TEACHER,
  MOCK_STUDENT)
- modules/desktop-app/frontend/src/pages/MyEnrollmentsPage.tsx

Dependencies Added:
- none

Tests:
- `npx tsc --noEmit` — passes, no type errors
- `npm run build` (tsc + Vite production build) — succeeds

Acceptance Criteria:
- [x] Booking logic: prevent double-booking, check section capacity (mock data)
- [x] Payment logic: simulate transaction states (pending → paid → failed)
- [x] Enrollment logic: after "paid", unlock section content + "Join Live Class"
- [x] Role logic: teacher sees own posted sections; student sees only purchased sections
- [x] All state persisted in local storage — no API/DB calls
- [x] Logic interfaces documented for future backend replacement (input/output shapes)

Known Issues:
- No browser/Chromium available in this workspace for live UI
  click-through verification (capacity-full flow, role switch, retry
  payment). Verified via type-check + production build only; logic was
  manually traced against the new store implementation.

Recommendations:
- Conductor (or a workspace with a browser) should click through:
  switch role to teacher → post a section with capacity 1 → switch to
  student → book it (fills capacity) → as a second mock student attempt
  to book the same section and confirm "This section is full." → on
  checkout, "Simulate Failed Payment" then "Retry Payment" → "Pay" →
  confirm "My Enrollments" and "Join Live Class" work.

Risks:
- none beyond the UI-verification gap above.

Blockers:
- none.

Ready For Next Stage:
YES
