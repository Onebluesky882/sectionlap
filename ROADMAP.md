ROADMAP.md

Status: ACTIVE

Owner: CONDUCTOR

Last Updated: 2026-06-17 (post-integration fixes: UX errors, booking API shape, mobile build)

⸻

Purpose

This document defines the long-term direction of the project.

ROADMAP.md is intended for:

* Product Owners
* Project Managers
* Architects
* Developers
* Future Contributors

This document is human-oriented.

Workers may read this document.

Workers must NOT modify this document.

Implementation planning belongs in PIPELINE.md.

⸻

Project Vision

Build SectionLap, an online learning platform where courses are sold per-section
instead of as a single full course (e.g. a "Frontend" course split into HTML,
CSS, JavaScript, Deploy sections). Teachers post sections; students browse,
book, and pay only for the sections they need. Live classes run via
self-hosted Jitsi Meet, with a shared real-time whiteboard and document
highlight across desktop and mobile.

⸻

Problem Statement

* Full-course pricing forces students to pay for content they don't need.
* Teachers lack a simple way to sell individual topics/sections separately.
* Live class tooling (video, whiteboard, document annotation) is fragmented
  across desktop and mobile, with no shared real-time state.

⸻

Business Goals

Goal 1 — Per-Section Marketplace

Description:

Let teachers publish individual sections and students book/pay per section,
lowering cost-to-entry and increasing completion rates.

Success Criteria:

* [x] Teachers can post and manage individual sections
* [x] Students can browse, book, and pay per section (mock logic)
* [x] Real payment + persistence via backend (Stage 6a)

⸻

Goal 2 — Unified Live Classroom Experience

Description:

Provide live video, whiteboard, and document-highlighting that work
consistently across the Wails desktop app and the Expo mobile app.

Success Criteria:

* [x] Self-hosted Jitsi Meet for live video (Stage 2a/2b)
* [x] Real-time whiteboard & document-highlight sync service (Stage 4a)
* [x] Sync features integrated into Wails (Stage 4b)
* [x] Full mobile parity via Expo (Stage 5)

⸻

Strategic Objectives

Objective 1 — Desktop-First Delivery

Description:

Ship a working Wails desktop app (Windows/macOS) covering the full
student/teacher flow on mock data before introducing a real backend.

Success Indicators:

* [x] Frontend shell + mock data (Stage 1)
* [x] Booking/payment/enrollment mock logic (Stage 3)
* [x] Real-time sync integrated into desktop app (Stage 4b)

⸻

Objective 2 — Backend & Mobile Parity

Description:

Introduce a real backend (API + DB + Auth) and bring the Expo mobile app
to feature parity with the desktop app, both running against the same backend.

Success Indicators:

* [x] Backend core: API + DB + Auth (Stage 6a)
* [x] Expo mobile app (Stage 5)
* [x] Wails integrated against the real backend (Stage 6b)
* [x] Expo integrated against the real backend (Stage 6c)

⸻

Guiding Principles

1. Human governance first
2. Contracts before implementation
3. Architecture before coding
4. Validation before merge
5. Integration before release
6. Explicit documentation over assumptions

⸻

Project Scope

In Scope

* Desktop app (Wails — Windows, macOS)
* Mobile app (Expo — Android, iPad)
* Self-hosted live video (Jitsi Meet)
* Real-time whiteboard & document highlight (Yjs)
* Backend API + DB + Auth (PostgreSQL, Fiber v3, Bun, go-better-auth)

⸻

Out of Scope

* Native iOS-only features (project targets Android/iPad via Expo)
* Third-party payment provider integration (TBD, deferred to Stage 6)
* Public/multi-tenant deployment infrastructure

⸻

Current Progress (Task Overview)

This section gives a human-readable snapshot of where the project stands.
Authoritative status and acceptance criteria live in PIPELINE.md.

Done

* [x] Stage 1 — Frontend Shell + Mock Data (Wails)
* [x] Stage 2a — Jitsi Meet Self-host (infra)
* [x] Stage 2b — Jitsi Embed in Wails (integration)
* [x] Stage 2c — Jibri Live Stream (RTMP out)
* [x] Stage 3 — Mock Logic (Booking / Payment / Enrollment)
* [x] Stage 4a — Sync Service (Yjs infra)
* [x] Stage 4b — Sync Service Integration (Wails)
* [x] Stage 5 — Expo App (Student / Teacher)
* [x] Stage 6a — Backend Core (API + DB + Auth)
* [x] Stage 6b — Wails Backend Integration

* [x] Stage 6c — Expo Backend Integration

In Progress

* [ ] Stage 7 — Website (Next.js + Cloudflare)

Next Up

* (none)



⸻

Milestone Backlog

ID	Name	Goal	Status
M-001	Desktop MVP (mock data)	Goal 1 / Objective 1	COMPLETE
M-002	Live Classroom (video + sync)	Goal 2 / Objective 1	COMPLETE
M-003	Mobile App (Expo)	Goal 2 / Objective 2	COMPLETE
M-004	Real Backend (API + DB + Auth)	Goal 1 / Objective 2	COMPLETE
M-005	Full Backend Integration (Desktop + Mobile)	Objective 2	COMPLETE
M-006	Website (Next.js + Cloudflare)	Goal 1	IN_PROGRESS

Status Values:

* PLANNING
* APPROVED
* IN_PROGRESS
* COMPLETE
* CANCELLED

⸻

Success Metrics

The project will be considered successful when:

* [x] A teacher can publish a section and a student can book/pay for it end-to-end on real backend
* [x] Live class (video + whiteboard + document highlight) works on both desktop and mobile
* [x] Desktop client wired to real backend with no mock logic remaining (Stage 6b)
* [x] Mobile client wired to real backend with no mock logic remaining (Stage 6c)
* [x] All pipeline stages COMPLETE on wansing branch (merge to main pending)

⸻

Risks

Risk — Sync/Backend Integration Complexity

Description:

Integrating real-time sync (Yjs) and the future backend into both Wails and
Expo independently could introduce protocol drift between clients.

Mitigation:

CONTRACTS.md documents the shared protocol/contract from Stage 4a so Stage 4b
and Stage 5 implement against the same source of truth.

⸻

Governance & Change Management

PROJECT.md, ROADMAP.md, PIPELINE.md, ARCHITECTURE.md, CONTRACTS.md, and
DECISIONS.md are controlled exclusively by the Conductor — workers must
treat them as read-only (see AGENT_RULES.md "Roadmap Protection" for the
worker-facing rule on ROADMAP.md specifically).

Changes to this roadmap require Conductor review, rationale, impact
analysis, and a documentation update.

⸻

Relationship To Other Documents

PROJECT.md (identity/purpose) · ROADMAP.md (direction/business goals,
this document) · PIPELINE.md (execution stages/progress) · ARCHITECTURE.md
(system structure) · CONTRACTS.md (interfaces/contracts) · DECISIONS.md
(approved technical decisions) · AGENT_RULES.md (worker operating rules).

⸻

Final Statement

ROADMAP.md is the source of truth for project direction (see "Current
Progress" above for a snapshot). PIPELINE.md is the source of truth for
project execution. Only the Conductor may modify project direction.
