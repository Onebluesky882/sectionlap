Stage: 3
Domain: modules/desktop-app
Branch: feature/booking-logic
Status: APPROVED

PR Title: feat(desktop-app): mock booking/payment/enrollment logic (Stage 3)

PR Description:
## What
Implemented mock booking/payment/enrollment logic on top of the Stage 1
Wails frontend shell, entirely local (Zustand store + localStorage, no
backend/API).

- Booking: `createBooking(sectionId)` prevents double-booking and enforces
  section capacity (`error: "ALREADY_BOOKED"` / `error: "CAPACITY_FULL"`).
- Payment: `BookingRecord.status` simulates `pending → paid → failed`, plus
  `retryBooking` to move `failed → pending`. CheckoutPage exposes "Pay",
  "Simulate Failed Payment", and "Retry Payment" actions.
- Enrollment: a `paid` booking unlocks the "Enrolled" banner and "Join Live
  Class" button on SectionDetailPage, and surfaces the section in a new
  "My Enrollments" page (student role).
- Role logic: added `User`/`UserRole` + mock `currentUser` with a
  `switchRole` action. Teacher Dashboard filters to the current teacher's
  sections; "My Enrollments" shows only the current student's paid bookings.
- Section model extended with `teacherId` and `capacity`; UI shows seat
  counts (`enrolledCount/capacity`).
- Persistence: Zustand `persist` bumped to v2 with a migrate step.
- Documented all input/output shapes (Section, User, BookingRecord,
  CreateBookingResult/BookingError) in CONTRACTS.md for Stage 6a.

## Files Changed
* modules/desktop-app/frontend/src/types.ts
* modules/desktop-app/frontend/src/store/useAppStore.ts
* modules/desktop-app/frontend/src/data/mockSections.ts
* modules/desktop-app/frontend/src/hooks/useSection.ts
* modules/desktop-app/frontend/src/hooks/useCheckout.ts
* modules/desktop-app/frontend/src/hooks/useSectionForm.ts
* modules/desktop-app/frontend/src/components/SectionForm.tsx
* modules/desktop-app/frontend/src/components/SectionCard.tsx
* modules/desktop-app/frontend/src/components/NavBar.tsx
* modules/desktop-app/frontend/src/pages/SectionListPage.tsx
* modules/desktop-app/frontend/src/pages/SectionDetailPage.tsx
* modules/desktop-app/frontend/src/pages/CheckoutPage.tsx
* modules/desktop-app/frontend/src/pages/TeacherDashboardPage.tsx
* modules/desktop-app/frontend/src/App.tsx
* modules/desktop-app/frontend/src/App.css
* CONTRACTS.md
* modules/desktop-app/frontend/src/data/mockUsers.ts (new)
* modules/desktop-app/frontend/src/pages/MyEnrollmentsPage.tsx (new)

## Tests
* `npx tsc --noEmit` — passes, no type errors
* `npm run build` (tsc + Vite production build) — succeeds

## Acceptance Criteria
- [x] Booking logic: prevent double-booking, check section capacity (mock data)
- [x] Payment logic: simulate transaction states (pending → paid → failed)
- [x] Enrollment logic: after "paid", unlock section content + "Join Live Class" button
- [x] Role logic: teacher sees own posted sections; student sees only purchased sections
- [x] All state persisted in local storage — no API/DB calls
- [x] Logic interfaces documented for future backend replacement (input/output shapes)

## Known Issues (non-blocking)
- No browser/Chromium available in this workspace for live UI click-through
  verification (capacity-full flow, role switch, retry payment). Verified
  via type-check + production build + manual code trace. Recommend a
  follow-up click-through pass: switch role to teacher → post a section
  with capacity 1 → switch to student → book it → second mock student
  attempts to book (expect "This section is full.") → "Simulate Failed
  Payment" → "Retry Payment" → "Pay" → confirm "My Enrollments" and
  "Join Live Class".

Merge Strategy: squash
Base Branch: wansing
Ready to Merge: YES
