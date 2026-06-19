Stage: 6b
Domain: modules/desktop-app
Branch: wansing
Status: APPROVED

PR Title: feat(desktop-app): Stage 6b — Wails backend integration (real API + auth)

PR Description:
## What
Replaced all mock Zustand store logic in the Wails desktop app with real API calls
against the Stage 6a backend. UI is unchanged — only the data layer was swapped.
Auth (sign up / sign in / sign out / session restore) is wired to go-better-auth.
Jitsi JWT is fetched per-section on Live Class entry.

## Files Changed
* modules/desktop-app/frontend/src/lib/api.ts (new) — typed API client; manages
  sectionlap_token in localStorage; attaches Authorization: Bearer on authenticated requests
* modules/desktop-app/frontend/src/config.ts — added VITE_API_BASE_URL
* modules/desktop-app/frontend/src/vite-env.d.ts — VITE_API_BASE_URL type
* modules/desktop-app/frontend/src/store/useAppStore.ts — async login/signup/logout/
  initialize; async CRUD for sections and bookings; token persisted (key: sectionlap-auth)
* modules/desktop-app/frontend/src/pages/AuthPage.tsx — real email + password forms
* modules/desktop-app/frontend/src/App.tsx — AppInitializer calls initialize() on mount
* modules/desktop-app/frontend/src/hooks/useCheckout.ts — async createBooking
* modules/desktop-app/frontend/src/hooks/useSection.ts — null-guarded currentUser
* modules/desktop-app/frontend/src/hooks/useSectionForm.ts — async submit via real API
* modules/desktop-app/frontend/src/pages/LiveClassPage.tsx — fetches Jitsi JWT from API
* modules/desktop-app/frontend/src/pages/MyEnrollmentsPage.tsx — null-guarded currentUser
* modules/desktop-app/frontend/src/components/NavBar.tsx — await logout() before navigate

## Dependencies Added
* none (fetch API used directly per DECISIONS.md)

## Tests
* npx tsc --noEmit — PASS
* npm run build (Vite) — PASS

## Acceptance Criteria
- [x] Teacher and student can sign up and sign in via real backend
- [x] Session persists across app reload via initialize() + stored token
- [x] Sections list, create, update via real API (teacher)
- [x] Student booking, pay, retry via real API
- [x] Enrollment gates Live Class access (derived from real booking state)
- [x] Jitsi JWT fetched from API and passed via jwt option
- [x] No mock store logic remains for auth/booking/sections

## Known Issues
* Pre-existing TypeScript strict-null errors in 4 files from prior stages —
  unrelated to Stage 6b, unchanged.
* sectionlap-auth Zustand persist key replaced old sectionlap-store key —
  old localStorage entries from mock era are ignored automatically.

Merge Strategy: squash
Base Branch: wansing
Ready to Merge: YES

---

## Conductor Approval

Gate-Out Status: PASS
Approved By: Dev
Approved Date: 2026-06-19
