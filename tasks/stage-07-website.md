Stage: 7
Domain: modules/website
Status: COMPLETE
Gate-In Verified: YES

---

## Objective

Build the public-facing website for SectionLap using Next.js 16 (App Router)
deployed to Cloudflare Workers via OpenNext. The website covers the student-facing
booking flow and landing experience, wired to the real backend from Stage 6a.

---

## Tech Stack

- Framework: Next.js 16 (App Router)
- Styling: Tailwind CSS v4
- State: Zustand v5
- Deploy: Cloudflare Workers via OpenNext

---

## Architecture Pattern

- `src/app/<name>/page.tsx` — Server Component; imports only from `src/preload/<name>/page.tsx`
- `src/preload/<name>/page.tsx` — `"use client"`; combines hook logic + pure UI
- `src/hooks/use<Name>.ts` — custom hooks for business logic
- `src/store/use<Name>Store.ts` — Zustand global state
- `src/components/` — pure presentational components

---

## Deliverables

1. [x] Home page (`/`) — landing with CTA to booking
2. [x] Booking page (`/booking`) — date + time slot selection wired to POST /api/bookings
3. [x] Zustand store for booking state (`useBookingStore.ts`)
4. [x] All pages pass TypeScript strict mode
5. [x] Deployed to Cloudflare Workers via OpenNext
6. [x] Auth pages (`/login`) — register + login for student/teacher roles
7. [x] Sections page (`/sections`) — browse available sections
8. [x] Dashboard (`/dashboard`) — teacher dashboard with section management
9. [x] Profile page (`/profile`) — teacher verification form
10. [x] Roadmap page (`/roadmap`) — AI feature roadmap (translated to English)
11. [x] Student onboarding (`/onboarding`) — post-signup profile form (nickname, age, subjects of interest)
    - Backend: `student_profiles` table, `POST/GET /api/student/profile`
    - Frontend: 3-layer page + `useStudentProfile` hook + redirect from register flow

---

## Gate-In Requirements (verified)

- [x] Stage 6a merged to wansing (backend API available for `/api/bookings`)

---

## Dispatch Authorization

Dev dispatched this stage directly. Execution authorized.
