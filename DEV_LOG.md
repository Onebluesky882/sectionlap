DEV_LOG.md

Status: ACTIVE

Owner: DEV

⸻

Purpose

This document records direct changes made by the dev (acting as Conductor)
on the `wansing` branch to governance/direction documents.

It exists so workers can quickly see what the dev changed and why, without
diffing every governance file.

This log is append-only — do not edit or remove past entries.

Workers must read all unread entries before starting assigned work.

⸻

2026-06-16 (14)

Files changed:

* DEV_LOG.md (reset)
* DEV_LOG_ARCHIVE.md (new)
* GOVERNANCE_CORE.md

What changed:

* DEV_LOG.md: reset to reduce token cost. All entries up to and including
  entry (13) have been moved to DEV_LOG_ARCHIVE.md.
* DEV_LOG_ARCHIVE.md (new): contains all archived entries (1–13).
  Workers do NOT need to read this file for current tasks.
* GOVERNANCE_CORE.md: added DEV_LOG_ARCHIVE.md to the Governance File
  Ownership table (Owner: Dev, read-only for Conductor and Workers).

Why:

DEV_LOG.md had grown to 513 lines. Workers are required to read it before
every task dispatch, making the accumulated history an unnecessary token
cost. Past entries are preserved in DEV_LOG_ARCHIVE.md for auditing.

Impact on workers:

* Read DEV_LOG.md only (this file). DEV_LOG_ARCHIVE.md is for audit
  reference — you do not need to read it unless investigating past decisions.
* No governance rules changed by this reset.

⸻

2026-06-16 (15)

Files changed:

* PIPELINE.md
* PROJECT.md
* ROADMAP.md

What changed:

* PIPELINE.md Stage 5: Status changed from `PENDING` to `COMPLETE`;
  all 5 acceptance criteria ticked.
* PROJECT.md "Current Stage": updated to reflect Stage 4b and Stage 6a
  running in parallel (Stage 5 is now merged).
* ROADMAP.md: moved Stage 5 from "Next Up" to "Done"; added Stage 6a
  to "In Progress"; removed Stage 6b/6c from "Next Up" (6b remains,
  6c removed from that section as it follows 6b).

Why:

Dev confirmed Stage 5 (Expo App) has been merged to wansing.

Impact on workers:

* Stage 6c Gate-In now satisfiable — Stage 5 merged to wansing is confirmed.
* Active stages: Stage 4b (Wails sync integration) and Stage 6a (Backend Core).

⸻

2026-06-16 (16)

Files changed:

* PIPELINE.md
* PROJECT.md
* ROADMAP.md

What changed:

* PIPELINE.md Stage 4b: Status changed from `IN PROGRESS` to `COMPLETE`;
  both acceptance criteria ticked.
* PROJECT.md "Current Stage": updated to Stage 6a only (4b now complete).
* ROADMAP.md: moved Stage 4b from "In Progress" to "Done".

Why:

PR #7 feat(desktop-app): integrate Live Class with sync-service (Stage 4b)
was merged to wansing on 2026-06-15. Gate-out PASS, merge-approval APPROVED.
Delivered: useSyncRoom hook, SyncCanvas, WhiteboardPanel, DocumentHighlightPanel,
LiveClassPage updated with Video/Whiteboard/Highlight tabs.

Impact on workers:

* Stage 6b Gate-In is now satisfiable (Stage 4b merged to wansing confirmed).
* Current active stage: Stage 6a — Backend Core.

⸻

2026-06-16 (17)

Files changed:

* PIPELINE.md
* ROADMAP.md
* breakdown_feature.md (new)

What changed:

* PIPELINE.md Stage 2c: Status changed from `IN PROGRESS` to `COMPLETE`;
  all 4 acceptance criteria ticked.
* ROADMAP.md: added Stage 2c to "Done" list.
* breakdown_feature.md (new): breakdown of all 19 planned AI/system/student
  features from Planning.md — each with dependencies, difficulty, and
  priority. Includes 5-phase implementation sequence (A–E).

Why:

PR #9 feat(live-class): add Jibri live streaming merged to wansing.
gate-out/state-2c-jitsi-livestream.md Status: PASS, Ready For Next Stage: YES.
Delivers: Jibri service in docker-compose + teacher Start/Stop RTMP panel in LiveClassPage.

Impact on workers:

* No pending stages depend on 2c as a gate-in requirement.
* breakdown_feature.md is Dev-only planning reference — workers do not need to read it.

⸻

2026-06-16 (18)

Files changed:

* PIPELINE.md
* PROJECT.md
* ROADMAP.md
* CONTRACTS.md
* DECISIONS.md

What changed:

* PIPELINE.md Stage 6a: Status → `COMPLETE`; all 5 acceptance criteria ticked;
  auth library path corrected to `github.com/Authula/authula`.
* PROJECT.md "Current Stage": updated to Stage 6b / 6c.
* ROADMAP.md: moved Stage 6a to "Done"; "In Progress" now empty (awaiting 6b/6c dispatch).
* CONTRACTS.md: merged API_CONTRACT.md content from modules/backend/ into a new
  "Module: Backend API (Stage 6a)" section — auth endpoints, session shape,
  sections/bookings endpoints, Jitsi JWT format, standard response format.
* DECISIONS.md 007: clarified that go-better-auth and github.com/Authula/authula
  are the same library (GitHub slug vs Go module path). Removed "Authula" from
  Prohibited list since it refers to the same approved library.

Why:

PR #10 feat(backend): Stage 6a merged to wansing. gate-out PASS.
CONTRACTS.md update was a known issue from gate-out — required before 6b/6c dispatch.
DECISIONS.md 007 clarification prevents future workers from incorrectly rejecting
the only approved auth library due to a module path mismatch.

Impact on workers:

* Stage 6b and 6c Gate-In requirements are now fully satisfied — both can be dispatched.
* Workers implementing 6b/6c must read CONTRACTS.md "Module: Backend API (Stage 6a)"
  for the auth/session contract, endpoint list, and response shapes.
* Auth import path: `github.com/Authula/authula` (not m-t-a97/go-better-auth).

⸻

Date: 2026-06-17

Files Changed:
* AGENT_RULES.md — added "Frontend Folder Structure (desktop-app)" section

What Changed:

Added a new governance section to AGENT_RULES.md specifying:
1. All pages in desktop-app frontend must follow the folder-per-page pattern:
   `pages/<name>/page.tsx` (kebab-case folder, always named page.tsx)
2. Relative imports in page.tsx must use `../../` prefix
3. No flat page files (e.g. `pages/FooPage.tsx`) are allowed
4. Service layer rule: pages must not call fetch() directly; must go through
   services/ → lib/api.ts

Why:

Pages were reorganized from flat `pages/XxxPage.tsx` to folder structure
`pages/<name>/page.tsx` for clarity and scalability. This rule ensures future
worker agents follow the same convention and do not revert to flat files.

Impact on workers:

* Any stage that adds or modifies pages in desktop-app/frontend must use the
  folder-per-page structure
* All imports inside page.tsx must use `../../` to reach src-level directories
* Pages may not call fetch() or API directly — must use services/

⸻

2026-06-17 (19)

Files changed:

* modules/desktop-app/frontend/src/pages/auth/page.tsx
* modules/desktop-app/frontend/src/lib/formatError.ts (new)
* modules/backend/controllers/booking_controller.go
* modules/mobile-app/babel.config.js
* modules/mobile-app/package.json
* modules/mobile-app/pnpm-lock.yaml
* modules/mobile-app/nativewind-env.d.ts (new)
* ROADMAP.md

What changed:

1. **Desktop UX — user-friendly error messages** (commits a419274, 2e7638d):
   - Auth page forms now have `noValidate` — prevents browser-native "The string
     did not match the expected pattern." tooltip from appearing on submit.
   - Added front-end validation for email format and password length (≥8 chars)
     before hitting the backend, with plain-language messages.
   - Added `src/lib/formatError.ts` — maps raw backend/library error strings
     (e.g. "email already registered", "password length invalid",
     "invalid credentials") to user-readable sentences.
   - Auth page catch blocks use `formatError()` instead of bare `err.message`.

2. **Backend — fix POST /api/bookings response shape** (commit e0b95ea):
   - Controller was returning `data: {booking: {...}, error: null}` (nested).
   - All other booking endpoints (Pay/Fail/Retry/Cancel) return `data: booking`
     directly. Both mobile and desktop bookingService.createBooking expected
     the flat shape — booking was stored with wrong structure, causing pay to
     silently fail.
   - Fixed to return `data: booking` on success, `data: null` on conflict,
     consistent with all other booking endpoints.

3. **Mobile — fix Expo Android bundle compilation** (commit 5051137):
   - Removed `"nativewind/babel"` preset from babel.config.js. It transitively
     loads `react-native-css-interop/babel` which unconditionally adds
     `"react-native-worklets/plugin"` — a Reanimated 4 dependency not installed.
   - Added `worklets: false` to `babel-preset-expo` options to prevent it from
     auto-loading `react-native-worklets/plugin`.
   - NativeWind styling still works via `jsxImportSource: "nativewind"` in
     `babel-preset-expo` (confirmed by bundle inspection).
   - Installed `isomorphic-webcrypto` — missing peer dep of `lib0` (transitive
     dep of `y-websocket`). Android bundle now compiles at 4.2 MB.

4. **ROADMAP.md** — updated Last Updated date and ticked final success metric
   (all pipeline stages COMPLETE on wansing branch).

Why:

Post-integration QA: user-facing UI tests revealed raw developer error messages,
a booking API shape mismatch that silently broke the pay flow, and a mobile
bundler that failed to compile due to missing Babel/npm dependencies.

Impact on workers:

* No pipeline stages remain — no worker dispatch needed.
* If any future stage is added, read the updated AGENT_RULES.md and CONTRACTS.md
  before starting.
* formatError.ts is the canonical place to add new error string mappings;
  do not display raw err.message to users in auth or booking flows.
