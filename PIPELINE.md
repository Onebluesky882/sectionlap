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
| 8 | Role-Based Access Control (admin/supervisor/dev) | COMPLETE |
| 9 | AI Visual Plan Generator (FlowLoop GIF/MP4 + R2) | IN_PROGRESS |
| 10 | Lessons/Topics + Video Clip Upload (Teacher Dashboard) | COMPLETE |
| 11 | Teacher Wallet (QR + Bank Account) + Slip2Go Auto-Verification | IN_PROGRESS |
| 12 | Teacher Identity Verification (Document Upload + AI-Assisted Approval) | IN_PROGRESS |

**Incident — desktop-app frontend broken since 2026-06-18:** The merge commit
`ce056f7` ("merge dev into main (resolve conflicts)") left literal
`<<<<<<< HEAD` / `=======` / `>>>>>>> wansing` conflict markers committed in
18 files under `modules/desktop-app/frontend/` (including `package.json`,
`App.tsx`, `tsconfig.json`, `vite.config.ts`) plus `wails.json` itself —
undetected for ~2 weeks since nobody ran `wails dev` or a frontend build in
that window. Fixed 2026-07-03: resolved every conflict to the `wansing` side
(verified as a strict superset of `HEAD` — auth/role/capacity fields, Tailwind
v4, per-user booking filtering that `HEAD` was missing), removed the stray
`package-lock.json`/`package.json.md5` (project uses pnpm here). Verified via
`tsc --noEmit`, `pnpm run build`, and `go build ./...`, all clean. This does
not change any Stage's acceptance criteria — it restores the state Stage 1/2b/
3/4b were already supposed to be in.

**Incident — website API proxy layer largely missing since Stage 7:** Discovered 2026-07-08 while
verifying Stage 12. `modules/website/src/app/api/` never had `route.ts` proxy files for
`/api/auth/*` (signup/signin/signout/me), `/api/sections` (list + create), `/api/sections/:id`
(detail + update), `/api/sections/:id/jitsi-token`, `/api/bookings` (create + list), `/api/student/
profile`, and `/api/feedback` — the frontend hooks called these paths and 404'd through Next.js
before ever reaching the Go backend, meaning a real user on the deployed website could not sign up,
browse classes, book, view their booking history, or submit feedback, despite the backend for all of
these being real and working (confirmed via direct backend calls during Stage 11's calibration and
this incident's own investigation). Only `/api/upload-ticket`, `/api/visual-plans`, `/api/lessons/*`,
`/api/sections/:id/wallet`, `/api/sections/:id/lessons`, and `/api/bookings/:id/verify-slip` existed.
`/api/teacher/profile` had the same gap, fixed earlier the same day as part of Stage 12.
Fixed 2026-07-08: added all 12 missing `route.ts` proxies following the existing pattern (forward
`Authorization` header, forward body, pass through backend status code — see `/api/teacher/wallet/
route.ts` as the reference implementation). Also fixed a related bug this gap was masking: `/profile`
and `/dashboard/report` read booking history exclusively from `useBookingStore`, which was only ever
populated in-memory by a successful `POST /api/bookings` — since that endpoint 404'd, and even once
fixed there was still no `GET /api/bookings` call anywhere on mount, booking history reset to empty on
every page load. Added `setBookings`/`fetchBookings` and wired both pages to fetch on mount. Verified
end-to-end via curl against the live local stack: signup → sections list/detail → create booking →
fresh `GET /api/bookings` returns the persisted booking (not empty) → student profile submit → feedback
submit → signout, all through the website's own `:3000` proxy layer, not direct-to-backend. `tsc
--noEmit` and `pnpm run build` both clean, all 12 new routes appear in the build's route manifest.
Does not change any Stage's acceptance criteria — restores what Stage 7 was already supposed to
deliver. **Not yet fixed / out of scope for this pass:** mobile and desktop payment flows are still on
the pre-Stage-11 unverified "simulate payment" button (see Stage 11 background) — that's a missing
feature port, not a proxy-layer bug, and wasn't part of this incident.

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
- [x] Auth pages (`/login`) — register + login for student/teacher roles
- [x] Sections page (`/sections`) — browse available sections
- [x] Dashboard + profile pages — teacher flows
- [x] Roadmap page (`/roadmap`) — AI feature roadmap
- [x] Student onboarding (`/onboarding`) — post-signup form (nickname, age, subjects of interest); backend `student_profiles` table + `POST/GET /api/student/profile`

**Gate-In Requirements:**
- Stage 6a merged to wansing (backend API available for `/api/bookings`)

**Dispatch-In:** `tasks/stage-07-website.md`

**Gate-Out:** `gate-out/stage-07-website.md`

**Merge-Approval:** `merge-approval/stage-07-website.md`

⸻

### Stage 8 — Role-Based Access Control Expansion (admin / supervisor / dev)

**Domain:** modules/backend
**Agent:** [assigned agent]
**Status:** `COMPLETE`

**Tech Stack:**
- Same as Stage 6a (Fiber v3 / Bun / PostgreSQL)

**Background:**
Stage 6a introduced `teacher` and `student` roles. This stage adds three internal-operation roles:

| Role | Purpose | Section Permissions |
|------|---------|---------------------|
| `admin` | Platform moderation — approve/reject teachers & sections, update any section's fields | `PUT /PATCH /api/admin/sections/:id` (no ownership check) |
| `supervisor` | Full manual CRUD — operate sections on behalf of any teacher, including delete | `GET / POST / PUT / PATCH / DELETE /api/internal/sections` |
| `dev` | Same permissions as supervisor — engineering access for debugging / seeding | `GET / POST / PUT / PATCH / DELETE /api/internal/sections` |

**Key Design Decisions:**
- `RequireAnyRole(roles...)` middleware helper: avoids duplicating route groups for supervisor & dev.
- `SectionService.AdminUpdate` — shared by admin and supervisor; skips owner check.
- `SectionService.Delete` — validates section existence; real deletion guarded by Postgres FK RESTRICT on `bookings.section_id` (prevents deleting sections with active bookings).
- All new routes are under distinct path prefixes (`/api/admin/`, `/api/internal/`) — no collision with teacher/student routes.

**Acceptance Criteria:**
- [x] `RoleSupervisor` and `RoleDev` constants added to `models.UserRoleType`
- [x] `RequireAnyRole` middleware added — supervisor and dev share the same route group
- [x] `SectionRepository.Delete` implemented
- [x] `SectionService.AdminUpdate` (no ownership check) and `SectionService.Delete` added
- [x] Admin: `PUT/PATCH /api/admin/sections/:id` — update any section
- [x] Supervisor/Dev: `GET/POST/PUT/PATCH/DELETE /api/internal/sections[/:id]` — full CRUD
- [x] Backend builds clean (`go build ./...`) and all tests pass
- [x] ADR 002 documents role permission matrix

**Gate-In Requirements:**
- Stage 6a merged (backend role system baseline exists)
- Stage 7 merged (website consumes section API — ensure no breaking route changes)

**Gate-Out:** All acceptance criteria checked, `go build ./...` and `go test ./...` green.

⸻

### Stage 9 — AI Visual Plan Generator (FlowLoop GIF/MP4 + R2)

**Domain:** modules/visual-plan-service, modules/backend, modules/website
**Agent:** [assigned agent]
**Status:** `IN_PROGRESS`

**Tech Stack:**
- Python FastAPI microservice (frame generation)
- Pillow + ffmpeg (draw frames → compile GIF/MP4)
- Cloudflare R2 (object storage, S3-compatible)
- Claude API claude-haiku-4-5 (parse text plan → structured JSON — Haiku chosen for low latency/cost on this simple extraction task; falls back to a local mock parser when `CLAUDE_API_KEY` is unset)
- Go backend: new visual_plans table + REST endpoints
- Next.js website: `/visual-plan` page + embed component

**Background:**
Teacher/student inputs a text learning plan → Claude parses into structured steps →
Python service draws animated frames (dark theme, teal accents) → ffmpeg compiles
to GIF + MP4 → upload to R2 → shareable embed link returned to user.
User can embed the GIF in any section description or share on social media.

**Acceptance Criteria:**
- [x] `modules/visual-plan-service/` Python FastAPI service:
  - `POST /generate` accepts structured JSON → returns `{ gifUrl, mp4Url }` — verified end-to-end via a real `POST /api/visual-plans` call
  - Pillow draws frames: dark theme `#1A2332`, teal `#6AA098`, 2x supersample (1800×640 → 900×320) — verified: downloaded the generated GIF, confirmed valid `GIF image data, 900 x 320`
  - ffmpeg compiles frames → `.gif` (palettegen, confirmed valid) + `.mp4` (libx264, yuv420p, framerate 12 — upload succeeded, but the MP4 file itself was not independently downloaded/inspected)
  - boto3 uploads both files to R2 under `visual-plans/{user_id}/{plan_id}.*` — verified via the returned object key path
  - `GET /health` returns 200 — verified via curl
- [x] Backend (Go) `visual_plans` table: `id, user_id, title, prompt_text, structured_json, gif_url, mp4_url, r2_key_gif, r2_key_mp4, created_at` — verified created in local Postgres via `\d visual_plans` (note: split into `r2_key_gif`/`r2_key_mp4` instead of a single `r2_key`)
- [x] Backend env vars added to config: `CLAUDE_API_KEY`, `VISUAL_SERVICE_URL`, `R2_BUCKET`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` — all wired and verified working via a real generate call. (`R2_PUBLIC_BASE_URL` intentionally *not* added to the Go backend — superseded by presigned URLs, see below)
- [x] Backend routes wired and responding:
  - `POST   /api/visual-plans` — Claude parse + generate (auth required) — verified end-to-end
  - `GET    /api/visual-plans` — list own plans (route registered, not exercised this session)
  - `GET    /api/visual-plans/:id` — public view — verified end-to-end, including fresh presign on each read (Amz-Date differs between two calls to the same id)
  - `DELETE /api/visual-plans/:id` — delete own (route registered, not exercised this session)
- [ ] Website `/visual-plan` page: text input → loading state → preview GIF → copy embed link *(files created, not yet exercised in a browser)*
- [ ] Website `/visual-plan/[id]` page: public view + download GIF/MP4 buttons *(files created, not yet exercised in a browser)*
- [ ] `<VisualPlanEmbed>` component usable inside section descriptions
- [x] R2 access: design changed from a static public URL pattern to backend-presigned GET URLs (1h TTL, regenerated from `r2_key_gif`/`r2_key_mp4` on every read) since `sectionlap-bucket` is private with no custom domain — verified working via a real presigned URL fetch
- [x] `go build ./...` green
- [ ] `pnpm build` green *(not yet run)*

**Gate-In Requirements:**
- Stage 6a merged (auth + user_id available)
- Stage 7 merged (website base exists)
- Stage 8 merged (role system stable — no breaking route changes)
- Cloudflare R2 bucket created and CORS configured — done: `sectionlap-bucket` exists, CORS (`GET`, all origins) set via `wrangler r2 bucket cors set`

**Dispatch-In:** `tasks/stage-09-visual-plan.md`

**Gate-Out:** All acceptance criteria checked, services start, end-to-end test (text → GIF download) passes.

⸻

### Stage 10 — Lessons/Topics + Video Clip Upload (Teacher Dashboard)

**Domain:** modules/backend, modules/website
**Agent:** [assigned agent]
**Status:** `COMPLETE`

**Background:**
Teachers previously created a flat `Section` with no internal structure. This stage adds ordered
`Lesson` (topic) sub-entities under a section, each holding one or more video `LessonClip`s, so a
teacher can break a section into a syllabus with per-topic video content.

**Key Design Decisions:**
- Reused the existing chunked video-upload pipeline built for `classId`-scoped video
  (`useVideoFileUpload`/`VideoFileUploader`/`upload-ticket`/`r2Presign.ts`) as-is — a synthetic
  `lesson-{lessonId}-clip-{uuid}` id is passed in as `classId`, so no changes were needed to that
  pipeline at all.
- `lessons`/`lesson_clips` use `ON DELETE CASCADE` from `sections`/`lessons` respectively (owned
  content, unlike the `RESTRICT` used for bookings).
- No R2 object cleanup on delete — matches the existing `VisualPlanService.Delete` precedent
  (DB-only delete).

**Acceptance Criteria:**
- [x] Backend: `lessons`/`lesson_clips` tables, full CRUD + reorder + clip registration + presigned
      playback endpoint, all teacher-ownership gated
- [x] Website: `LessonList` component wired into `/dashboard/sections/[id]/edit`, reusing
      `VideoFileUploader` unchanged
- [x] `go build ./...` / `go test ./...` clean
- [x] `pnpm build` clean (strict TypeScript, all routes registered)
- [x] End-to-end verified against local Postgres: create/list/reorder/delete lesson, register/delete
      clip, playback presign, ownership 403s, reorder IDOR guard — all passed
- [x] Found + fixed a real bug during verification: empty `clips` serialized as `null` instead of
      `[]`, which would have crashed the frontend's `.map()` — fixed in `lesson_service.go`

**Gate-In Requirements:**
- Stage 6a merged (backend API/DB pattern established)
- Stage 7 merged (website 3-layer page pattern + upload pipeline exist)

**Gate-Out:** All acceptance criteria checked, `go build`/`go test`/`pnpm build` green, manual
end-to-end curl walkthrough passed.

⸻

### Stage 11 — Teacher Wallet (QR + Bank Account) + Slip2Go Auto-Verification

**Domain:** modules/backend, modules/website
**Agent:** [assigned agent]
**Status:** `IN_PROGRESS`

**Tech Stack:**
- Slip2Go (`https://connect.slip2go.com`) — Thai bank-slip verification API, `SLIP_2GO_SECRET`
  already present in `modules/backend/.env`
- `jsqr` (website) — client-side QR decode from an uploaded slip photo, no server round-trip of
  raw image bytes needed for decoding

**Background:**
First slice of a larger "how to earn / teacher wallet" request. Exploration surfaced that the
booking→payment flow was fully mocked with a real gap: `Booking.Pay()` was a bare state flip with
no gateway, and **the frontend never called it at all** — students could book but never reach
`paid`, so `bookingRepo.IsEnrolled` (which gates Jitsi access) could never pass through the real
flow. This stage closes that gap using Slip2Go instead of a manual "teacher confirms" step: student
uploads a photo of their transfer slip → browser decodes its QR client-side → backend sends it to
Slip2Go with `checkCondition` (receiver name/account from the teacher's wallet + exact section
price) → Slip2Go itself confirms the match → booking flips straight to `paid`.

**Key Design Decisions:**
- New `TeacherWallet` entity, not bolted onto `TeacherProfile` — `TeacherProfile.Submit()` does a
  full-replace `Upsert` from 4 hardcoded fields; adding QR/bank fields there would silently wipe the
  QR whenever a teacher edits verification info (or vice versa).
- No manual "teacher confirms payment" step/dashboard — Slip2Go decode + our own matching (see
  below) replaces that for this slice. A failed match just leaves the booking `pending` for retry;
  no override/dispute UI built yet (see Manual Payment Confirmation Fallback dev-rec on the Report
  page).
- **Matching is done in our own backend code, not via Slip2Go's `checkCondition`** — live calibration
  (real PromptPay transfer + real slip) found `checkCondition.checkReceiver` fails to match a
  PromptPay-proxy receiver (`bank.account` is `null` for those; Slip2Go only exposes the masked
  proxy number) and Slip2Go truncates receiver names, so exact name matching isn't reliable either.
  `slip2go_client.go`'s `GetSlipInfo` now just decodes the slip (no `checkCondition` sent); matching
  is `SlipInfo.MatchesWallet` — **last-4-digits of the account/PromptPay number + exact transferred
  amount only**. Receiver *name* is deliberately not compared: Slip2Go's name is Thai-title-prefixed
  and truncated, and teachers can be foreign nationals with English names, so name isn't a reliable
  match signal — last-4 + amount is what actually identifies "this transfer, to this teacher, for
  this course."
- Added `POST /api/teacher/wallet/test-slip` — a teacher uploads any slip where they were the
  receiver; the backend saves the exact name/last-4 Slip2Go reports (sidesteps mismatches from
  manually-typed names/spacing/titles). The name is still stored and shown to students during
  checkout for their own visual double-check, just not used by the automated matcher.

**Acceptance Criteria:**
- [x] Backend: `TeacherWallet` model/repo/controller (Upsert + Get, mirrors `TeacherProfile`) +
      `POST /api/teacher/wallet/test-slip` calibration endpoint
- [x] Backend: `Slip2GoClient.GetSlipInfo` — decodes a slip QR, extracts receiver name/last-4/amount/
      transRef; `SlipInfo.MatchesWallet` does last-4 + amount matching in Go
- [x] Backend: `Booking.VerifySlip` service method — ownership check, loads teacher's wallet +
      section price, decodes + matches, flips to `paid` on match, stores raw response either way
- [x] Routes: `PUT/GET /api/teacher/wallet`, `POST /api/teacher/wallet/test-slip`,
      `GET /api/sections/:id/wallet` (public), `POST /api/bookings/:id/verify-slip`
- [x] `go build ./...` / `go test ./...` clean
- [x] Website: `/dashboard/wallet` page (QR upload via existing `ImageUpload`, bank fields)
- [x] Website: section detail page shows the teacher's QR/bank info once a pending booking exists,
      with a slip-upload button that decodes + auto-submits for verification
- [x] Migrated `useBookingStore`'s `Booking` type off Stage-1 mock shape
      (`pending/confirmed/cancelled` with `date`/`timeSlot`) to the real backend enum
      (`pending/paid/failed`) — fixes `/profile` and `/dashboard/report` status displays that were
      silently always showing zero for "confirmed"/"cancelled" since those values never occurred in
      real data
- [x] `pnpm build` clean (strict TypeScript, all new routes registered)
- [x] **Live Slip2Go calibration** — real PromptPay transfer + real slip QR decoded and run through
      the full flow: teacher `test-slip` → wallet saved with real name/last-4 → student books a
      1-baht section → `verify-slip` with the real QR → booking flips `pending` → `paid` →
      `GET /api/sections/:id/jitsi-token` succeeds. First time this project's booking→payment→
      enrollment gate has worked end-to-end with real data.
- [ ] "How to Earn" marketing page — deferred, separate follow-up not part of this slice

**Gate-In Requirements:**
- Stage 6a merged (backend API/DB pattern established)
- Stage 7 merged (website 3-layer page pattern, `ImageUpload`/`useUpload` exist)
- `SLIP_2GO_SECRET` present in `modules/backend/.env` — done, package active

**Gate-Out:** All acceptance criteria checked including the live calibration call; full booking →
QR display → slip upload → auto-verify → Jitsi-access-unlocked path exercised end-to-end.

⸻

### Stage 12 — Teacher Identity Verification (Document Upload + AI-Assisted Approval)

**Domain:** modules/backend, modules/website, modules/admin
**Agent:** [assigned agent]
**Status:** `IN_PROGRESS`

**Tech Stack:**
- Claude API `claude-haiku-4-5-20251001`, vision input — same raw-HTTP pattern as Stage 9's
  `parseWithClaude`, same `CLAUDE_API_KEY`, no new SDK
- Cloudflare R2 (presigned PUT/GET, same pipeline as Stage 9/10/11)

**Background:**
Teachers (including foreign/adult applicants) previously verified identity with a free-text ID
*number* only — no document photo — and `/teacher-verify` optimistically marked the user verified
client-side regardless of actual backend state (bug). `POST /api/sections` also had no
`is_verified` check at all, so verification was cosmetic even when granted. This stage adds a real
passport/ID-photo upload, an AI extraction+match step (name + age ≥18) for instant auto-approval on
a confident match, a three-state status model (`pending`/`approved`/`rejected` + rejection reason)
for the existing admin queue on anything less than confident, and closes the section-creation gate.
Applies identically to Thai and foreign teachers — no separate work-permit/visa check.

**Key Design Decisions:**
- Status lives on `teacher_profiles.verification_status`, not by widening `user_roles.is_verified`
  (which stays a derived boolean, synced by the service layer) — avoids rippling into
  `auth_controller.go`'s three response payloads and the desktop-app/mobile-app `User` types for no
  functional gain. See ADR 003.
- AI extraction and the approve/reject decision are separated: Claude only extracts structured
  fields (name/DOB/doc type/confidence); the actual match/age/threshold logic runs in our own Go
  code (`evaluateExtraction`), never delegated to the model's own judgment — same principle as
  Stage 11's `SlipInfo.MatchesWallet`.
- Any failure, ambiguity, or missing `CLAUDE_API_KEY`/R2 config fails safe to `pending` (admin
  queue) — never auto-approves on uncertainty, never hard-fails the submission.
- Bundled fix: `POST /api/sections` now actually enforces `is_verified` via
  `middlewares.GetIsVerified` — previously absent entirely.

**Acceptance Criteria:**
- [x] Backend: `teacher_profiles` additive columns (doc R2 key, status, rejection reason, AI
      extraction fields, raw response, reviewer) + backfill for pre-existing verified teachers
- [x] Backend: `TeacherVerificationService` (Submit/Approve/Reject) + `name_match.go` (Levenshtein +
      token-set name matching, dependency-free)
- [x] Backend: `POST /api/teacher/profile` requires `documentKey`, returns real status;
      `POST /api/admin/teachers/:id/reject` requires a reason; admin list presigns a document
      preview URL
- [x] Backend: section-creation gate (`SectionController.Create` now checks `IsVerified`)
- [x] Backend: 11 unit tests (name matching, age calc, decision-matrix branches, AI-unconfigured
      fail-safe, approve/reject sync) — `go build ./...` / `go test ./...` clean
- [x] Website: `/teacher-verify` document upload step (`identity-document` upload type reusing the
      Stage 7/10 R2 presign pipeline), status-aware UI (pending/rejected-with-reason+resubmit/
      approved), fixed the optimistic-verified bug in `useTeacherVerify.ts`
- [x] Website: found + fixed a pre-existing gap — `/api/teacher/profile` had no Next.js proxy route
      at all (the old form silently failed); added `src/app/api/teacher/profile/route.ts`
- [x] Admin: `/teachers` page shows document preview link, three-state status badge, plain-language
      AI verdict note, required-reason reject flow
- [x] ADR 003 written (`docs/adrs/003-ai-assisted-teacher-identity-verification.md`)
- [x] `go build`/`go vet`/`go test` (backend), `tsc --noEmit` + `pnpm build` (website, admin) all
      clean
- [x] **End-to-end verification run 2026-07-08** against local Postgres + rebuilt backend, real R2
      bucket, real Claude API key — full path exercised via curl: signup → upload-ticket
      (`identity-document` type, correct `identity/user-{id}-{date}-{name}` key) → PUT to R2 → 200 →
      submit profile → admin queue shows the case with a presigned document-preview URL that
      round-trips the real uploaded JPEG → reject with empty reason correctly 400s, reject with a
      reason correctly 200s and the teacher sees the exact reason on `GET /api/teacher/profile` →
      resubmission clears the stale `rejection_reason`/`reviewed_by`/`ai_verdict` (confirmed via
      direct DB query) → section-creation gate correctly 403s the unverified teacher and 201s the
      same teacher immediately after admin approval — real positive+negative control, not assumed.
      **One item not exercised live:** the Claude vision call itself hit a real `invalid_request_error`
      ("Your credit balance is too low") from the configured `CLAUDE_API_KEY` — an account billing
      issue, not a code defect. This incidentally became a real (not synthetic) test of the
      fail-safe path: the raw error was persisted to `ai_raw_response` for audit and the case routed
      to `pending` rather than crashing or auto-approving, exactly as designed. The auto-approve and
      AI-driven name-mismatch/underage branches remain verified only at the unit-test level
      (`evaluateExtraction` table tests) until `CLAUDE_API_KEY` has credit — re-run once topped up.
      Also found + fixed during this pass: `modules/website/.dev.vars`'s `BACKEND_URL` pointed at a
      stale Docker image (`sectionlap-backend-local`, built 3 days prior, predating this stage's
      code) — rebuilt the image but redirected local dev to a freshly-built binary on :8080 instead
      of recreating the container (recreating it would have required re-injecting secrets as plain
      `docker run -e` flags, which the environment correctly refused); the Docker image itself is
      rebuilt and tagged `sectionlap-backend:local` and ready to redeploy whenever convenient.

**Gate-In Requirements:**
- Stage 6a merged (backend API/DB pattern established)
- Stage 7 merged (website 3-layer pattern, R2 presign pipeline exist)
- Stage 8 merged (admin role/route group exists)
- `CLAUDE_API_KEY` present (reused from Stage 9, no new key)

**Gate-Out:** All acceptance criteria checked; real end-to-end pass completed 2026-07-08 for every
branch except the live Claude auto-approve/name-mismatch/underage verdicts, which are blocked on
`CLAUDE_API_KEY` billing (account credit, not code) — re-run that one slice once credit is topped
up, then flip to `COMPLETE`.

⸻

<!-- Repeat for each stage -->
