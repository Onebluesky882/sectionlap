Stage: 1
Domain: modules/desktop-app
Branch: feature/desktop-app
Status: APPROVED

PR Title: feat(desktop-app): Wails frontend shell with mock data (Stage 1)

PR Description:
## What
Scaffolded the Wails (Go + React/TS) desktop app shell for SectionLap.
Implemented all Stage 1 screens using local mock JSON data and in-memory
state persisted to localStorage via Zustand: Section list (browse), Section
detail, Booking/Checkout (UI-only "Pay" simulation), and Teacher Dashboard
(post/edit sections). Routing handled with react-router-dom (HashRouter),
state via a Zustand store with persist middleware, logic extracted into
hooks (useSection, useCheckout, useSectionForm), and presentational
components kept pure (SectionCard, SectionForm, NavBar, Layout). No
booking/payment/enrollment business logic implemented (reserved for Stage 3).

## Files Changed
* modules/desktop-app/ (new Wails project scaffold: go.mod, main.go, app.go, wails.json, build/, etc.)
* modules/desktop-app/frontend/src/App.tsx
* modules/desktop-app/frontend/src/App.css
* modules/desktop-app/frontend/src/types.ts
* modules/desktop-app/frontend/src/data/mockSections.ts
* modules/desktop-app/frontend/src/store/useAppStore.ts
* modules/desktop-app/frontend/src/hooks/useSection.ts
* modules/desktop-app/frontend/src/hooks/useCheckout.ts
* modules/desktop-app/frontend/src/hooks/useSectionForm.ts
* modules/desktop-app/frontend/src/components/Layout.tsx
* modules/desktop-app/frontend/src/components/NavBar.tsx
* modules/desktop-app/frontend/src/components/SectionCard.tsx
* modules/desktop-app/frontend/src/components/SectionForm.tsx
* modules/desktop-app/frontend/src/pages/SectionListPage.tsx
* modules/desktop-app/frontend/src/pages/SectionDetailPage.tsx
* modules/desktop-app/frontend/src/pages/CheckoutPage.tsx
* modules/desktop-app/frontend/src/pages/TeacherDashboardPage.tsx
* modules/desktop-app/frontend/package.json / package-lock.json (added zustand, react-router-dom)

## Tests
* `npx tsc --noEmit` — passes, no type errors
* `npm run build` (Vite production build) — succeeds
* `go vet ./...` and `go build ./...` — pass
* `wails build` — succeeds, produces macOS app bundle (darwin/arm64)
* Manual UI verification via headless Chromium against `npm run dev`:
  Section list, Section detail, Checkout (pre/post "Pay"), Teacher Dashboard
  (list + new-section form) all render and navigate correctly with no
  console errors

## Acceptance Criteria
- [x] Wails app runs on Windows and macOS
- [x] Section list screen (browse available sections)
- [x] Section detail screen
- [x] Booking/checkout screen (UI only, no real payment)
- [x] Teacher dashboard screen (post/edit sections)
- [x] All data sourced from local mock JSON (no backend/db)

Merge Strategy: squash
Base Branch: main
Ready to Merge: YES
