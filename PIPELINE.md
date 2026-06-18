# PIPELINE.md

## Stages

| Stage | Domain | Status |
|-------|--------|--------|
| 1 | Frontend Shell + Mock Data (Wails) | COMPLETE |
| 2a | Jitsi Meet Self-host (infra) | COMPLETE |
| 2b | Jitsi Embed in Wails (integration) | COMPLETE |
| 2c | Jitsi Live Stream (Jibri + RTMP out) | COMPLETE |
| 3 | Mock Logic (Booking / Payment / Enrollment) | COMPLETE |
| 4a | Sync Service (Yjs infra) | COMPLETE |
| 4b | Sync Service Integration (Wails) | COMPLETE |
| 5 | Expo App (Student / Teacher) | COMPLETE |
| 6a | Backend Core (API + DB + Auth) | COMPLETE |
| 6b | Wails Backend Integration | COMPLETE |
| 6c | Expo Backend Integration | COMPLETE |
| 7 | Website (Next.js + Cloudflare) | COMPLETE |

**Parallel work note:** Stage 2a and Stage 4a have no dependency on Stage 1
and are dispatched in parallel with it. Their integration counterparts
(2b, 4b) are gated on Stage 1 (and 2a/4a respectively) merging to wansing.

**Parallelism policy:** Workers run concurrently by default. A stage is only
gated on another stage if it has a *real* cross-domain dependency (consumes
code, a contract, or a protocol produced by the prior stage) — listed under
each stage's Gate-In Requirements. No other ordering is implied or enforced.
Currently:
- Stage 3 and Stage 4a have no dependency on each other — run in parallel.
- Once Stage 4a completes, Stage 4b and Stage 5 (once Stage 3 also completes)
  have no dependency on each other (different codebases: Wails vs Expo) —
  run in parallel.
- Stage 6a depends only on Stage 3 — it does not wait on Stage 5 or 4b.
- Stage 6b and Stage 6c both depend only on Stage 6a (+ their own prior
  stage: 6b on Stage 3, 6c on Stage 5) — they have no dependency on each
  other and run in parallel.

⸻

## Stage Detail

### Stage 1 — Frontend Shell + Mock Data (Wails)

**Domain:** modules/desktop-app
**Agent:** [assigned agent]
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Wails app runs on Windows and macOS
- [x] Section list screen (browse available sections)
- [x] Section detail screen
- [x] Booking/checkout screen (UI only, no real payment)
- [x] Teacher dashboard screen (post/edit sections)
- [x] All data sourced from local mock JSON (no backend/db)

**Gate-In Requirements:**
- None (Stage 1 starts immediately)

**Dispatch-In:** `tasks/state-1-desktop-app.md`

**Gate-Out:** `gate-out/state-1-desktop-app.md`

**Merge-Approval:** `merge-approval/state-1-desktop-app.md`

⸻

### Stage 2a — Jitsi Meet Self-host (infra)

**Domain:** modules/live-class
**Agent:** [assigned agent]
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Jitsi Meet running locally via docker-compose
- [x] Setup/run instructions documented
- [x] Local Jitsi room URL/config documented for Stage 2b to consume

**Gate-In Requirements:**
- None — runs in parallel with Stage 1, no dependency

**Dispatch-In:** `tasks/state-2a-jitsi-infra.md`

**Gate-Out:** `gate-out/state-2a-jitsi-infra.md`

**Merge-Approval:** `merge-approval/state-2a-jitsi-infra.md`

⸻

### Stage 2b — Jitsi Embed in Wails (integration)

**Domain:** modules/desktop-app
**Agent:** [assigned agent]
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] "Live Class" screen in Wails app embeds local Jitsi room (webview/iframe)
- [x] Join/leave room works with mic/cam from the Wails app (code/wiring complete;
      end-to-end mic/cam verification pending Docker availability — see gate-out)

**Gate-In Requirements:**
- Stage 1 merged to wansing (Wails app shell exists)
- Stage 2a merged to wansing (Jitsi instance + config available)

**Dispatch-In:** `tasks/state-2b-jitsi-embed.md`

**Gate-Out:** `gate-out/state-2b-jitsi-embed.md`

**Merge-Approval:** `merge-approval/state-2b-jitsi-embed.md`

⸻

### Stage 2c — Jitsi Live Stream (Jibri + RTMP out)

**Domain:** modules/live-class, modules/desktop-app
**Agent:** [assigned agent]
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Jibri service added to docker-compose and starts successfully
- [x] Teacher can start/stop live stream from the Wails Live Class screen (RTMP URL configurable)
- [x] Stream reaches RTMP endpoint (YouTube Live or local RTMP server for local test)
- [x] Setup/run instructions updated in modules/live-class/README.md

**Gate-In Requirements:**
- Stage 2a merged to wansing (Jitsi docker-compose exists)
- Stage 2b merged to wansing (Live Class screen + IFrame API wired)

**Dispatch-In:** `tasks/state-2c-jitsi-livestream.md`

**Gate-Out:** `gate-out/state-2c-jitsi-livestream.md`

**Merge-Approval:** `merge-approval/state-2c-jitsi-livestream.md`

⸻

### Stage 3 — Mock Logic (Booking / Payment / Enrollment)

**Domain:** modules/desktop-app
**Agent:** [assigned agent]
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Booking logic: prevent double-booking, check section capacity (mock data)
- [x] Payment logic: simulate transaction states (pending → paid → failed)
- [x] Enrollment logic: after "paid", unlock section content + "Join Live Class" button
- [x] Role logic: teacher sees own posted sections; student sees only purchased sections
- [x] All state persisted in local storage — no API/DB calls
- [x] Logic interfaces documented for future backend replacement (input/output shapes)

**Gate-In Requirements:**
- Stage 1 merged to wansing

**Dispatch-In:** `tasks/state-3-booking-logic.md`

**Gate-Out:** `gate-out/state-3-booking-logic.md`

**Merge-Approval:** `merge-approval/state-3-booking-logic.md`

⸻

### Stage 4a — Sync Service (Yjs infra)

**Domain:** modules/sync-service
**Agent:** [assigned agent]
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] WebSocket sync server running locally (Yjs + y-websocket)
- [x] Whiteboard: collaborative drawing surface, real-time sync across connected clients
- [x] Document highlight: load PDF/image, draw/highlight annotations synced in real-time
- [x] Shared protocol/contract documented for Wails (Stage 4b) and Expo (Stage 5) to reuse
- [x] Setup/run instructions documented

**Gate-In Requirements:**
- None — runs in parallel with Stage 1, no dependency

**Dispatch-In:** `tasks/state-4a-sync-infra.md`

**Gate-Out:** `gate-out/state-4a-sync-infra.md`

**Merge-Approval:** `merge-approval/state-4a-sync-infra.md`

⸻

### Stage 4b — Sync Service Integration (Wails)

**Domain:** modules/desktop-app
**Agent:** [assigned agent]
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Wails app integrated as a client connecting to the sync service
- [x] Whiteboard and document-highlight usable from within the Wails app

**Gate-In Requirements:**
- Stage 1 merged to wansing (Wails app shell exists)
- Stage 4a merged to wansing (sync service + protocol available)

**Dispatch-In:** `tasks/state-4b-sync-integration.md`

**Gate-Out:** `gate-out/state-4b-sync-integration.md`

**Merge-Approval:** `merge-approval/state-4b-sync-integration.md`

⸻

### Stage 5 — Expo App (Student / Teacher)

**Domain:** modules/mobile-app
**Agent:** [assigned agent]
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Expo app runs on Android and iPad
- [x] Student/Teacher flows mirrored from Wails (section list, booking, dashboard) using mock logic from Stage 3
- [x] Live class via Jitsi React Native SDK
- [x] Whiteboard & document-highlight connected to the same Sync Service from Stage 4a
- [x] Real-time sync verified between Wails and Expo clients

**Gate-In Requirements:**
- Stage 3 merged to wansing (mock logic contracts available)
- Stage 4a merged to wansing (sync service + protocol available)

**Dispatch-In:** `tasks/state-5-mobile-app.md`

**Gate-Out:** `gate-out/state-5-mobile-app.md`

**Merge-Approval:** `merge-approval/state-5-mobile-app.md`

⸻

### Stage 6a — Backend Core (API + DB + Auth)

**Domain:** modules/backend
**Agent:** [assigned agent]
**Status:** `COMPLETE`

**Tech Stack:**
- Database: PostgreSQL
- Web framework: Fiber v3 (Go)
- ORM: Bun (uptrace/bun)
- Auth: github.com/Authula/authula v1.11.0 (go-better-auth, teacher/student roles)

**Acceptance Criteria:**
- [x] Real API + DB (PostgreSQL via Bun) implementing the booking/payment/enrollment contracts from Stage 3
- [x] Fiber v3 HTTP server exposing the API
- [x] Auth for teacher/student roles via go-better-auth
- [x] Jitsi room provisioning tied to enrollment (access granted only to paid students)
- [x] Auth/session contract documented in CONTRACTS.md for Stage 6b/6c to consume

**Gate-In Requirements:**
- Stage 3 merged to wansing (contracts defined)

**Dispatch-In:** `tasks/state-6a-backend-core.md`

**Gate-Out:** `gate-out/state-6a-backend-core.md`

**Merge-Approval:** `merge-approval/state-6a-backend-core.md`

⸻

### Stage 6b — Wails Backend Integration

**Domain:** modules/desktop-app
**Agent:** [assigned agent]
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Wails app switched from mock logic (Stage 3) to real API calls against Stage 6a
- [x] Teacher/student login flow wired to go-better-auth via Stage 6a API

**Gate-In Requirements:**
- Stage 3 merged to wansing (mock logic to replace)
- Stage 6a merged to wansing (backend API + auth available)

**Dispatch-In:** `tasks/state-6b-wails-auth-integration.md`

**Gate-Out:** `gate-out/state-6b-wails-auth-integration.md`

**Merge-Approval:** `merge-approval/state-6b-wails-auth-integration.md`

⸻

### Stage 6c — Expo Backend Integration

**Domain:** modules/mobile-app
**Agent:** [assigned agent]
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Expo app switched from mock logic (Stage 5) to real API calls against Stage 6a
- [x] Teacher/student login flow wired to go-better-auth via Stage 6a API

**Gate-In Requirements:**
- Stage 5 merged to wansing (mobile app exists, mock logic to replace)
- Stage 6a merged to wansing (backend API + auth available)

**Dispatch-In:** `tasks/state-6c-mobile-auth-integration.md`

**Gate-Out:** `gate-out/state-6c-mobile-auth-integration.md`

**Merge-Approval:** `merge-approval/state-6c-mobile-auth-integration.md`

⸻

### Stage 7 — Website (Next.js + Cloudflare)

**Domain:** modules/website
**Agent:** [assigned agent]
**Status:** `COMPLETE`

**Tech Stack:**
- Framework: Next.js 16 (App Router)
- Styling: Tailwind CSS v4
- State: Zustand v5
- Deploy: Cloudflare Workers via OpenNext

**Architecture Pattern:**
- `src/app/<name>/page.tsx` — Server Component; imports only from `src/preload/<name>/page.tsx`
- `src/preload/<name>/page.tsx` — `"use client"`; combines hook logic + pure UI
- `src/hooks/use<Name>.ts` — custom hooks for business logic
- `src/store/use<Name>Store.ts` — Zustand global state
- `src/components/` — pure presentational components

**Acceptance Criteria:**
- [x] Home page (`/`) — landing with CTA to booking
- [x] Booking page (`/booking`) — date + time slot selection wired to POST /api/bookings
- [x] Zustand store for booking state
- [x] All pages pass TypeScript strict mode
- [x] Deployed to Cloudflare Workers via OpenNext

**Gate-In Requirements:**
- Stage 6a merged to wansing (backend API available for `/api/bookings`)

**Dispatch-In:** `tasks/stage-07-website.md`

**Gate-Out:** `gate-out/stage-07-website.md`

**Merge-Approval:** `merge-approval/stage-07-website.md`

⸻

<!-- Repeat for each stage -->
