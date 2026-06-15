ENGINEERING_CONTROLLER.md

Status: ACTIVE
Owner: CONDUCTOR
Scope: Global System Control (Frontend + Backend + Service + Architecture)

⸻

Purpose

This document defines the global engineering direction of the system.

It controls:

* frontend architecture
* backend architecture
* service layer design
* system structure
* API design
* data flow
* state management
* integration rules
* coding standards

This is the highest authority for system design.

Only DESIGN_SYSTEM.md controls UI/UX appearance.

Only the Conductor may modify this file.

⸻

Core Principle

The system must follow strict layered architecture:

UI Layer (Frontend)
↓
Service Layer (Frontend API Layer)
↓
Backend API Layer
↓
Business Logic Layer
↓
Data Access Layer

No layer may bypass another.

⸻

Frontend Engineering Rules

Technology Stack (Fixed)

* React
* TypeScript
* Tailwind CSS
* React Router
* Zustand (state management)

No substitution allowed unless approved by Conductor.

⸻

Frontend Structure

src/
 ├── pages/
 ├── components/
 ├── features/
 ├── services/
 ├── store/
 ├── hooks/
 ├── utils/
 ├── types/
 ├── lib/

⸻

Page Rules

Pages must:

* be thin UI layers only
* contain no business logic
* call services only
* never call API directly

⸻

Service Layer Rules (Frontend)

All external communication MUST go through services:

Example:

sectionService.getSections()
authService.login()
bookingService.create()

Forbidden:

* fetch() inside components
* axios inside pages
* direct API calls in UI

⸻

State Management Rules

* UI state → local state
* Shared state → Zustand store
* Server state → service layer

No mixing responsibilities.

⸻

Backend Engineering Rules

Backend Stack

Must follow DECISIONS.md.

Default architecture:

* REST API
* Layered service architecture

⸻

Backend Structure

backend/
 ├── controllers/
 ├── services/
 ├── repositories/
 ├── models/
 ├── routes/
 ├── middlewares/
 ├── utils/
 ├── config/

⸻

Backend Layer Responsibilities

Controller Layer

* request handling
* input validation
* calls service only

Service Layer

* business logic only
* no HTTP logic
* no database access

Repository Layer

* database operations only

⸻

Strict Backend Rules

Forbidden:

* business logic inside controller
* DB access inside controller
* external API calls inside controller

⸻

API Design Standard

REST Convention

GET    /api/resources
POST   /api/resources
GET    /api/resources/:id
PUT    /api/resources/:id
DELETE /api/resources/:id

⸻

Response Format Standard

{
  "data": {},
  "error": null,
  "status": "success"
}

⸻

Cross-System Rules

Frontend and Backend must be strictly separated:

* Frontend = UI + state + presentation
* Backend = business logic + data + rules

No duplication of business logic across layers.

⸻

Data Flow Rule

All system communication must follow:

UI → Service → API → Controller → Service → Repository → DB

No shortcuts allowed.

⸻

Anti-Patterns (Forbidden)

* API calls inside React components
* business logic inside UI layer
* duplicated validation FE + BE
* skipping service layer
* direct DB access outside repository
* mixing UI and backend logic

⸻

Architecture Validation Gate

Before any stage is approved:

Must verify:

* correct layer separation
* no bypass logic
* service layer used correctly
* backend structure valid
* frontend structure compliant

Failure → BLOCK STAGE

⸻

Final Authority

Only the Conductor may modify:

* system architecture
* layering rules
* service design
* API structure