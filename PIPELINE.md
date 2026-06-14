# PIPELINE.md

## Stages

| Stage | Domain | Status |
|-------|--------|--------|
| 1 | Frontend Shell + Mock Data (Wails) | COMPLETE |
| 2a | Jitsi Meet Self-host (infra) | IN PROGRESS |
| 2b | Jitsi Embed in Wails (integration) | PENDING |
| 3 | Mock Logic (Booking / Payment / Enrollment) | PENDING |
| 4a | Sync Service (Yjs infra) | IN PROGRESS |
| 4b | Sync Service Integration (Wails) | PENDING |
| 5 | Expo App (Student / Teacher) | PENDING |
| 6 | Backend (Replace Mock Booking/Payment/Enrollment) | PENDING |

**Parallel work note:** Stage 2a and Stage 4a have no dependency on Stage 1
and are dispatched in parallel with it. Their integration counterparts
(2b, 4b) are gated on Stage 1 (and 2a/4a respectively) merging to main.

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
<!-- Conductor writes this AFTER prior stage merges to main -->

**Gate-Out:** `gate-out/state-1-desktop-app.md`
<!-- Agent writes this when stage is complete -->

**Merge-Approval:** `merge-approval/state-1-desktop-app.md`
<!-- Conductor writes this after gate validation passes; triggers PR merge -->

⸻

### Stage 2a — Jitsi Meet Self-host (infra)

**Domain:** modules/live-class
**Agent:** [assigned agent]
**Status:** `IN PROGRESS`

**Acceptance Criteria:**
- [ ] Jitsi Meet running locally via docker-compose
- [ ] Setup/run instructions documented
- [ ] Local Jitsi room URL/config documented for Stage 2b to consume

**Gate-In Requirements:**
- None — runs in parallel with Stage 1, no dependency

**Dispatch-In:** `tasks/state-2a-jitsi-infra.md`

**Gate-Out:** `gate-out/state-2a-jitsi-infra.md`

**Merge-Approval:** `merge-approval/state-2a-jitsi-infra.md`

⸻

### Stage 2b — Jitsi Embed in Wails (integration)

**Domain:** modules/desktop-app
**Agent:** [assigned agent]
**Status:** `PENDING`

**Acceptance Criteria:**
- [ ] "Live Class" screen in Wails app embeds local Jitsi room (webview/iframe)
- [ ] Join/leave room works with mic/cam from the Wails app

**Gate-In Requirements:**
- Stage 1 merged to main (Wails app shell exists)
- Stage 2a merged to main (Jitsi instance + config available)

**Dispatch-In:** `tasks/state-2b-jitsi-embed.md`

**Gate-Out:** `gate-out/state-2b-jitsi-embed.md`

**Merge-Approval:** `merge-approval/state-2b-jitsi-embed.md`

⸻

### Stage 3 — Mock Logic (Booking / Payment / Enrollment)

**Domain:** modules/desktop-app
**Agent:** [assigned agent]
**Status:** `PENDING` → `IN PROGRESS` → `COMPLETE` | `BLOCKED`

**Acceptance Criteria:**
- [ ] Booking logic: prevent double-booking, check section capacity (mock data)
- [ ] Payment logic: simulate transaction states (pending → paid → failed)
- [ ] Enrollment logic: after "paid", unlock section content + "Join Live Class" button
- [ ] Role logic: teacher sees own posted sections; student sees only purchased sections
- [ ] All state persisted in local storage — no API/DB calls
- [ ] Logic interfaces documented for future backend replacement (input/output shapes)

**Gate-In Requirements:**
- Stage 1 merged to main

**Dispatch-In:** `tasks/state-3-booking-logic.md`

**Gate-Out:** `gate-out/state-3-booking-logic.md`

**Merge-Approval:** `merge-approval/state-3-booking-logic.md`

⸻

### Stage 4a — Sync Service (Yjs infra)

**Domain:** modules/sync-service
**Agent:** [assigned agent]
**Status:** `IN PROGRESS`

**Acceptance Criteria:**
- [ ] WebSocket sync server running locally (Yjs + y-websocket)
- [ ] Whiteboard: collaborative drawing surface, real-time sync across connected clients
- [ ] Document highlight: load PDF/image, draw/highlight annotations synced in real-time
- [ ] Shared protocol/contract documented for Wails (Stage 4b) and Expo (Stage 5) to reuse
- [ ] Setup/run instructions documented

**Gate-In Requirements:**
- None — runs in parallel with Stage 1, no dependency

**Dispatch-In:** `tasks/state-4a-sync-infra.md`

**Gate-Out:** `gate-out/state-4a-sync-infra.md`

**Merge-Approval:** `merge-approval/state-4a-sync-infra.md`

⸻

### Stage 4b — Sync Service Integration (Wails)

**Domain:** modules/desktop-app
**Agent:** [assigned agent]
**Status:** `PENDING`

**Acceptance Criteria:**
- [ ] Wails app integrated as a client connecting to the sync service
- [ ] Whiteboard and document-highlight usable from within the Wails app

**Gate-In Requirements:**
- Stage 1 merged to main (Wails app shell exists)
- Stage 4a merged to main (sync service + protocol available)

**Dispatch-In:** `tasks/state-4b-sync-integration.md`

**Gate-Out:** `gate-out/state-4b-sync-integration.md`

**Merge-Approval:** `merge-approval/state-4b-sync-integration.md`

⸻

### Stage 5 — Expo App (Student / Teacher)

**Domain:** modules/mobile-app
**Agent:** [assigned agent]
**Status:** `PENDING` → `IN PROGRESS` → `COMPLETE` | `BLOCKED`

**Acceptance Criteria:**
- [ ] Expo app runs on Android and iPad
- [ ] Student/Teacher flows mirrored from Wails (section list, booking, dashboard) using mock logic from Stage 3
- [ ] Live class via Jitsi React Native SDK
- [ ] Whiteboard & document-highlight connected to the same Sync Service from Stage 4a
- [ ] Real-time sync verified between Wails and Expo clients

**Gate-In Requirements:**
- Stage 3 merged to main (mock logic contracts available)
- Stage 4a merged to main (sync service + protocol available)

**Dispatch-In:** `tasks/state-5-mobile-app.md`

**Gate-Out:** `gate-out/state-5-mobile-app.md`

**Merge-Approval:** `merge-approval/state-5-mobile-app.md`

⸻

### Stage 6 — Backend (Replace Mock Booking/Payment/Enrollment)

**Domain:** modules/backend
**Agent:** [assigned agent]
**Status:** `PENDING` → `IN PROGRESS` → `COMPLETE` | `BLOCKED`

**Acceptance Criteria:**
- [ ] Real API + DB implementing the booking/payment/enrollment contracts from Stage 3
- [ ] Auth for teacher/student roles
- [ ] Wails app switched from mock logic to real API calls
- [ ] Expo app switched from mock logic to real API calls
- [ ] Jitsi room provisioning tied to enrollment (access granted only to paid students)

**Gate-In Requirements:**
- Stage 3 merged to main (contracts defined)
- Stage 5 merged to main (both clients exist to migrate)

**Dispatch-In:** `tasks/state-6-backend.md`

**Gate-Out:** `gate-out/state-6-backend.md`

**Merge-Approval:** `merge-approval/state-6-backend.md`

⸻

<!-- Repeat for each stage -->
