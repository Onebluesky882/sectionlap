Stage: 6c
Domain: modules/mobile-app
Branch: wansing
Status: APPROVED

PR Title: feat(mobile-app): Stage 6c — Expo backend integration (real API + auth)

PR Description:
## What
Switched the Expo mobile app from Stage 5's mock Zustand store to real API calls
against the Stage 6a backend. Auth (sign up / sign in / sign out / session restore)
is wired to go-better-auth. Booking, payment, and enrollment state use the real API.
Live class (Jitsi WebView) and sync-service integrations from Stage 5 are unchanged.

## Files Changed
* modules/mobile-app/src/lib/api.ts (new) — typed API client; token from AsyncStorage;
  Authorization: Bearer on authenticated requests
* modules/mobile-app/src/store/useAppStore.ts — async auth + booking + section API calls;
  initialize() restores session from stored token on app load
* modules/mobile-app/src/config.ts — added EXPO_PUBLIC_API_BASE_URL
* modules/mobile-app/app/_layout.tsx — calls initialize() on mount
* modules/mobile-app/app/(tabs)/index.tsx — sections from real API
* modules/mobile-app/app/(tabs)/teach.tsx — section CRUD via real API (teacher)
* modules/mobile-app/app/sections/[id]/checkout.tsx — booking/pay via real API
* modules/mobile-app/app/(auth)/login.tsx (new) — sign in + sign up replacing mock user-picker

## Dependencies Added
* none (fetch API used directly per DECISIONS.md)

## Tests
* pnpm typecheck (tsc --noEmit) — PASS, 0 errors
* No native build available in this workspace (same constraint as Stage 5)

## Acceptance Criteria
- [x] Expo app switched from mock logic to real API calls against Stage 6a
- [x] Teacher/student login flow wired to go-better-auth
- [x] Booking, payment, enrollment state from real API
- [x] Token persisted in AsyncStorage; session restored on mount
- [x] Live class and sync-service integrations unchanged

## Known Issues
* No native build verification — requires expo run:android / expo run:ios on
  a machine with native toolchains.
* Dark-mode Tailwind variant deferred (recommended in Stage 5 gate-out).

Merge Strategy: squash
Base Branch: wansing
Ready to Merge: YES

---

## Conductor Approval

Gate-Out Status: PASS
Approved By: Dev
Approved Date: 2026-06-19
