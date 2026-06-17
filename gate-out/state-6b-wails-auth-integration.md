Stage: 6b
Domain: modules/desktop-app
Status: COMPLETE

---

## Summary

Replaced all mock Zustand store logic with real API calls against the Stage 6a backend. The UI is unchanged — only the data layer was swapped.

---

## Deliverables

### New files
- `modules/desktop-app/frontend/src/lib/api.ts` — typed API client for all backend endpoints (auth, sections, bookings, Jitsi token). Manages `sectionlap_token` in localStorage and attaches `Authorization: Bearer <token>` to every authenticated request.

### Modified files
- `src/config.ts` — added `VITE_API_BASE_URL` (default: `http://localhost:8080`)
- `src/vite-env.d.ts` — added `VITE_API_BASE_URL` to `ImportMetaEnv`
- `src/store/useAppStore.ts` — rewrote store: async login/signup/logout/initialize; async CRUD for sections and bookings; token persisted via Zustand persist (key: `sectionlap-auth`); `initialize()` restores session on app load via `GET /api/auth/me`
- `src/pages/AuthPage.tsx` — replaced mock user-picker with real email + password forms (login and signup); role selection retained in signup
- `src/App.tsx` — added `<AppInitializer>` component that calls `initialize()` on mount to restore session from stored token
- `src/hooks/useCheckout.ts` — made `createBooking` call async (`.then()` in useEffect); guarded `currentUser?.id`
- `src/hooks/useSection.ts` — guarded `currentUser` null before reading bookings
- `src/hooks/useSectionForm.ts` — made `submit()` async; adapted to API-based `addSection`/`updateSection` (no local id generation); guarded `currentUser` null
- `src/pages/LiveClassPage.tsx` — fetches Jitsi JWT from `GET /api/sections/:id/jitsi-token` and passes it to `JitsiMeetExternalAPI` via `jwt` option; falls back to unauthenticated join on fetch failure
- `src/pages/MyEnrollmentsPage.tsx` — guarded `currentUser?.id`
- `src/components/NavBar.tsx` — `await logout()` before navigating

---

## Acceptance Criteria Status

- [x] Teacher and student can sign up and sign in via the real backend
- [x] Session persists across app reload (`token` in localStorage; `initialize()` calls `GET /api/auth/me` on load)
- [x] Sections list loaded from real API (`GET /api/sections`); teacher can create (`POST /api/sections`) and update (`PUT /api/sections/:id`) sections
- [x] Student can book (`POST /api/bookings`), pay (`POST /api/bookings/:id/pay`), and retry (`POST /api/bookings/:id/retry`) via real API
- [x] Enrollment check (paid booking) gates Live Class access — derived from real booking state in store cache
- [x] Jitsi JWT fetched from `GET /api/sections/:id/jitsi-token` on Live Class entry and passed via `jwt` option
- [x] No mock store logic remains for auth/booking/sections — mock data files (`mockSections.ts`, `mockUsers.ts`) are unused dead code, not referenced by any live code

---

## Notes

- ALREADY_BOOKED on POST /api/bookings triggers a `loadBookings()` refresh so the existing booking appears in the checkout page
- `sectionlap-auth` Zustand persist key replaced the old `sectionlap-store` key (version 2/3); old localStorage entries from the mock era will be ignored
- No new dependencies added; fetch API used directly per DECISIONS.md constraint
