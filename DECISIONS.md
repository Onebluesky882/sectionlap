DECISIONS.md

Status: ACTIVE

Owner: CONDUCTOR

Last Updated: YYYY-MM-DD

⸻

Purpose

DECISIONS.md is the authoritative source for all approved technology choices.

Workers must follow all decisions defined in this document.

Workers may not replace, substitute, or introduce alternative technologies without explicit Conductor approval.

If a technology requirement conflicts with implementation preferences, this document takes precedence.

⸻

Decisions

Each row is ACCEPTED unless noted. "Prohibited" items require explicit
Conductor approval to use. Any deviation fails Technology Compliance
(Status: FAIL, Ready For Next Stage: NO).

001 — Frontend Application Stack (Date: YYYY-MM-DD)

* Approved: React, TypeScript, Vite, TailwindCSS, Zustand, shadcn/ui, pnpm
* Prohibited: Redux, MobX, Recoil, Jotai (state) · Plain CSS, CSS Modules,
  Styled Components, Emotion (styling) · Webpack, Parcel, Create React App
  (build) · Material UI, Ant Design, Chakra UI (UI libs)

002 — Mobile Application Stack (Date: YYYY-MM-DD)

* Approved: Expo, React Native, NativeWind, TypeScript, Expo Router, pnpm
* Prohibited: Flutter, Ionic, Cordova, Capacitor, Xamarin

003 — Desktop Application Stack (Date: YYYY-MM-DD)

* Approved: Wails (Go runtime) + React frontend (Vite, TailwindCSS,
  Zustand, shadcn/ui)
* Prohibited: Electron, Tauri, Neutralino

004 — Backend Stack (Date: YYYY-MM-DD)

* Approved: Go 1.24+, Fiber v3 (HTTP framework), encoding/json
* Prohibited: net/http (standalone, without Fiber), chi, Node.js, NestJS,
  Express, Fastify, Django, Laravel, Spring Boot

005 — ORM (Date: YYYY-MM-DD)

* Approved: Bun ORM (uptrace/bun — https://bun.uptrace.dev/)
* Prohibited: GORM, Ent, SQLBoiler, XORM

006 — Database (Date: YYYY-MM-DD)

* Approved: PostgreSQL 16+
* Prohibited: MySQL, MariaDB, SQLite, MongoDB, DynamoDB

007 — Authentication (Date: YYYY-MM-DD)

* Approved: go-better-auth (https://github.com/m-t-a97/go-better-auth),
  teacher/student roles
* Prohibited: Authula, Auth.js, Clerk, Supabase Auth, Firebase Auth, Keycloak

008 — Package Manager (Date: YYYY-MM-DD)

* Approved: pnpm 11.x — `pnpm-lock.yaml` required
* Prohibited: npm, yarn, `bun install`; never commit `package-lock.json`,
  `yarn.lock`, or `bun.lockb`

009 — Node.js Runtime (Date: YYYY-MM-DD)

* Approved: Node.js 24.x LTS + pnpm 11.x
* Prohibited: unsupported/older Node versions

010 — Testing Standards (Date: YYYY-MM-DD)

* Required validation per layer:
  - Frontend: type check, build verification
  - Backend: unit tests, build verification
  - Mobile: build verification
  - Desktop: build verification
* Workers may not claim tests passed without execution.

011 — Dependency Governance (Date: YYYY-MM-DD)

* Workers must prefer existing dependencies.
* New dependencies require Conductor-facing documentation in gate-out.md:
  package name, version, reason.
* Undocumented dependencies fail gate validation.

012 — Version Policy (Date: 2026-06-16)

Default rule: install @latest stable. Workers must query the registry
(see AGENT_RULES.md → "Technology Freshness Compliance") and must not
rely on memory or training data for version numbers.

Pinned Versions

Entries below override the @latest default. Only the Conductor may add
or remove pins. Workers must use the pinned version exactly.

  (none — add pins here when required)

Format for new pins:
  package@X.Y.Z — reason — added YYYY-MM-DD

⸻

Technology Compliance

Before a stage can PASS, the implementation must comply with every
Approved item above relevant to its domain (frontend/mobile/desktop stack,
backend stack, ORM, database, auth, package manager, Node version).

Failure to comply results in:

Status: FAIL

Ready For Next Stage: NO

⸻

Decision Change Process

Technology decisions may only be changed by the Conductor.

Required:

1. Impact Analysis
2. Architecture Review
3. Contract Review
4. Decision Update
5. Pipeline Review

Workers may not modify this file.

Workers may not override decisions through implementation.

⸻

Final Authority

DECISIONS.md is authoritative for technology selection.

If implementation differs from DECISIONS.md:

DECISIONS.md wins.

Workers must treat this file as read-only.
