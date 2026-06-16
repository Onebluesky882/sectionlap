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
