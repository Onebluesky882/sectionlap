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

Decision 001: Frontend Application Stack

Date: YYYY-MM-DD

Status: ACCEPTED

Context

The project requires a modern frontend stack that supports:

* rapid development
* strong TypeScript support
* predictable state management
* reusable UI components
* desktop and backend integration

Decision

Frontend applications MUST use:

* React
* TypeScript
* Vite
* TailwindCSS
* Zustand
* shadcn/ui

Approved Stack

Package Manager:

* pnpm

Framework:

* React

Language:

* TypeScript

Build Tool:

* Vite

Styling:

* TailwindCSS

State Management:

* Zustand

UI Components:

* shadcn/ui

Prohibited Alternatives

Workers may NOT introduce:

State Management:

* Redux
* MobX
* Recoil
* Jotai

Styling:

* Plain CSS architecture
* CSS Modules
* Styled Components
* Emotion

Build Tools:

* Webpack
* Parcel
* Create React App

UI Libraries:

* Material UI
* Ant Design
* Chakra UI

Unless explicitly approved by the Conductor.

Consequences

All frontend code must conform to this stack.

Any deviation fails technology compliance.

⸻

Decision 002: Mobile Application Stack

Date: YYYY-MM-DD

Status: ACCEPTED

Context

The project requires:

* iOS support
* Android support
* shared codebase
* rapid iteration

Decision

Mobile applications MUST use:

* Expo
* React Native
* NativeWind
* TypeScript

Approved Stack

Package Manager:

* pnpm

Framework:

* Expo

Language:

* TypeScript

Styling:

* NativeWind

Navigation:

* Expo Router

Prohibited Alternatives

Workers may NOT introduce:

* Flutter
* Ionic
* Cordova
* Capacitor
* Xamarin

Unless explicitly approved by the Conductor.

Consequences

All mobile development must use Expo-based architecture.

⸻

Decision 003: Desktop Application Stack

Date: YYYY-MM-DD

Status: ACCEPTED

Context

The project requires:

* desktop support
* Go backend integration
* lightweight distribution
* native performance

Decision

Desktop applications MUST use:

* Wails
* Go
* React frontend

Approved Stack

Desktop Runtime:

* Wails

Backend Language:

* Go

Frontend:

* React
* Vite
* TailwindCSS
* Zustand
* shadcn/ui

Prohibited Alternatives

Workers may NOT introduce:

* Electron
* Tauri
* Neutralino

Unless explicitly approved by the Conductor.

Consequences

Desktop implementation must remain Wails-based.

⸻

Decision 004: Backend Stack

Date: YYYY-MM-DD

Status: ACCEPTED

Context

The backend must provide:

* high performance
* simple deployment
* maintainability
* strong typing

Decision

Backend services MUST use:

* Go

Approved Stack

Language:

* Go

Minimum Version:

* Go 1.24+

HTTP:

* net/http
* chi

Serialization:

* encoding/json

Prohibited Alternatives

Workers may NOT introduce:

* Node.js
* NestJS
* Express
* Fastify
* Django
* Laravel
* Spring Boot

Unless explicitly approved by the Conductor.

Consequences

Backend business logic must be implemented in Go.

⸻

Decision 005: ORM

Date: YYYY-MM-DD

Status: ACCEPTED

Context

The backend requires:

* PostgreSQL support
* migrations
* maintainability
* performance

Decision

The project MUST use Bun ORM.

Approved Stack

ORM:

* Bun

Official Documentation:

* https://bun.uptrace.dev/

Prohibited Alternatives

Workers may NOT introduce:

* GORM
* Ent
* SQLBoiler
* XORM

Unless explicitly approved by the Conductor.

Consequences

Database access must be implemented through Bun ORM.

⸻

Decision 006: Database

Date: YYYY-MM-DD

Status: ACCEPTED

Context

The project requires:

* relational consistency
* scalability
* mature tooling

Decision

Primary database MUST be PostgreSQL.

Approved Stack

Database:

* PostgreSQL

Version:

* PostgreSQL 16+

Prohibited Alternatives

Workers may NOT introduce:

* MySQL
* MariaDB
* SQLite
* MongoDB
* DynamoDB

Unless explicitly approved by the Conductor.

Consequences

All persistence layers target PostgreSQL.

⸻

Decision 007: Authentication

Date: YYYY-MM-DD

Status: ACCEPTED

Context

The project requires:

* centralized authentication
* reusable identity management
* multi-platform support

Decision

Authentication MUST use Authula.

Repository:

* https://github.com/Authula/authula

Prohibited Alternatives

Workers may NOT introduce:

* Better Auth
* Auth.js
* Clerk
* Supabase Auth
* Firebase Auth
* Keycloak

Unless explicitly approved by the Conductor.

Consequences

Authentication implementation must integrate with Authula.

⸻

Decision 008: Package Manager

Date: YYYY-MM-DD

Status: ACCEPTED

Context

The project requires:

* deterministic dependency installation
* monorepo support
* reproducible builds

Decision

All JavaScript and TypeScript projects MUST use pnpm.

Approved Stack

Package Manager:

* pnpm

Version:

* pnpm 11.x

Required Files

* pnpm-lock.yaml

Prohibited Alternatives

Workers may NOT use:

* npm
* yarn
* bun install

Workers may NOT commit:

* package-lock.json
* yarn.lock
* bun.lockb

Unless explicitly approved by the Conductor.

Consequences

All dependency management must use pnpm.

⸻

Decision 009: Node.js Runtime

Date: YYYY-MM-DD

Status: ACCEPTED

Context

Frontend and mobile applications require a consistent runtime.

Decision

All JavaScript and TypeScript development MUST use Node.js LTS.

Approved Stack

Runtime:

* Node.js

Version:

* Node.js 24.x LTS

Package Manager:

* pnpm 11.x

Prohibited Alternatives

Workers may NOT target unsupported Node versions.

Consequences

Builds and CI environments must use Node.js 24.x.

⸻

Decision 010: Testing Standards

Date: YYYY-MM-DD

Status: ACCEPTED

Context

The project requires repeatable validation before merge.

Decision

All stages MUST include testing evidence.

Required Validation

Frontend:

* Type Check
* Build Verification

Backend:

* Unit Tests
* Build Verification

Mobile:

* Build Verification

Desktop:

* Build Verification

Consequences

Workers may not claim tests passed without execution.

⸻

Decision 011: Dependency Governance

Date: YYYY-MM-DD

Status: ACCEPTED

Context

Uncontrolled dependency growth increases maintenance costs.

Decision

Workers must prefer existing dependencies.

Rules

Workers may NOT add new dependencies unless required.

If adding a dependency:

Worker must document:

* package name
* version
* reason

inside gate-out.md

Consequences

Undocumented dependencies fail gate validation.

⸻

Technology Compliance

Before a stage can PASS:

The implementation must comply with all decisions defined in this document.

Required Validation:

* Approved frontend stack used
* Approved mobile stack used
* Approved desktop stack used
* Approved backend stack used
* Approved ORM used
* Approved database used
* Approved authentication used
* Approved package manager used
* Approved Node version used

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