# PIPELINE.md

## Stages

| Stage | Domain | Status |
|-------|--------|--------|
| 1 | Frontend Shell + Mock Data (Wails) | IN PROGRESS |
| 2 | Jitsi Meet Self-host + Embed | PENDING |
| 3 | Mock Logic (Booking / Payment / Enrollment) | PENDING |
| 4 | Sync Service (Yjs Whiteboard & Document Highlight) | PENDING |
| 5 | Expo App (Student / Teacher) | PENDING |
| 6 | Backend (Replace Mock Booking/Payment/Enrollment) | PENDING |

⸻

## Stage Detail

### Stage 1 — Frontend Shell + Mock Data (Wails)

**Domain:** modules/desktop-app
**Agent:** [assigned agent]
**Status:** `IN PROGRESS`

**Acceptance Criteria:**
- [ ] Wails app runs on Windows and macOS
- [ ] Section list screen (browse available sections)
- [ ] Section detail screen
- [ ] Booking/checkout screen (UI only, no real payment)
- [ ] Teacher dashboard screen (post/edit sections)
- [ ] All data sourced from local mock JSON (no backend/db)

**Gate-In Requirements:**
- None (Stage 1 starts immediately)

**Dispatch-In:** `tasks/stage-1/dispatch-in.md`
<!-- Conductor writes this AFTER prior stage merges to main -->

**Gate-Out:** `tasks/stage-1/gate-out.md`
<!-- Agent writes this when stage is complete -->

**Merge-Approval:** `tasks/stage-1/merge-approval.md`
<!-- Conductor writes this after gate validation passes; triggers PR merge -->

⸻

### Stage 2 — Jitsi Meet Self-host + Embed

**Domain:** modules/live-class
**Agent:** [assigned agent]
**Status:** `PENDING` → `IN PROGRESS` → `COMPLETE` | `BLOCKED`

**Acceptance Criteria:**
- [ ] Jitsi Meet running locally via docker-compose
- [ ] "Live Class" screen in Wails app embeds local Jitsi room (webview/iframe)
- [ ] Join/leave room works with mic/cam from the Wails app
- [ ] Setup/run instructions documented

**Gate-In Requirements:**
- Stage 1 merged to main (Wails app shell exists)

**Dispatch-In:** `tasks/stage-2/dispatch-in.md`

**Gate-Out:** `tasks/stage-2/gate-out.md`

**Merge-Approval:** `tasks/stage-2/merge-approval.md`

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

**Dispatch-In:** `tasks/stage-3/dispatch-in.md`

**Gate-Out:** `tasks/stage-3/gate-out.md`

**Merge-Approval:** `tasks/stage-3/merge-approval.md`

⸻

### Stage 4 — Sync Service (Yjs Whiteboard & Document Highlight)

**Domain:** modules/sync-service
**Agent:** [assigned agent]
**Status:** `PENDING` → `IN PROGRESS` → `COMPLETE` | `BLOCKED`

**Acceptance Criteria:**
- [ ] WebSocket sync server running locally (Yjs + y-websocket)
- [ ] Whiteboard: collaborative drawing surface, real-time sync across connected clients
- [ ] Document highlight: load PDF/image, draw/highlight annotations synced in real-time
- [ ] Wails app integrated as a client connecting to the sync service
- [ ] Shared protocol/contract documented for Expo (Stage 5) to reuse
- [ ] Setup/run instructions documented

**Gate-In Requirements:**
- Stage 1 merged to main (Wails app shell exists)

**Dispatch-In:** `tasks/stage-4/dispatch-in.md`

**Gate-Out:** `tasks/stage-4/gate-out.md`

**Merge-Approval:** `tasks/stage-4/merge-approval.md`

⸻

### Stage 5 — Expo App (Student / Teacher)

**Domain:** modules/mobile-app
**Agent:** [assigned agent]
**Status:** `PENDING` → `IN PROGRESS` → `COMPLETE` | `BLOCKED`

**Acceptance Criteria:**
- [ ] Expo app runs on Android and iPad
- [ ] Student/Teacher flows mirrored from Wails (section list, booking, dashboard) using mock logic from Stage 3
- [ ] Live class via Jitsi React Native SDK
- [ ] Whiteboard & document-highlight connected to the same Sync Service from Stage 4
- [ ] Real-time sync verified between Wails and Expo clients

**Gate-In Requirements:**
- Stage 3 merged to main (mock logic contracts available)
- Stage 4 merged to main (sync service + protocol available)

**Dispatch-In:** `tasks/stage-5/dispatch-in.md`

**Gate-Out:** `tasks/stage-5/gate-out.md`

**Merge-Approval:** `tasks/stage-5/merge-approval.md`

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

**Dispatch-In:** `tasks/stage-6/dispatch-in.md`

**Gate-Out:** `tasks/stage-6/gate-out.md`

**Merge-Approval:** `tasks/stage-6/merge-approval.md`

⸻

<!-- Repeat for each stage -->
