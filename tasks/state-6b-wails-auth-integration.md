Stage: 6b
Domain: modules/desktop-app
Status: IN PROGRESS
Model: claude-opus-4-8

Workspace: branch feature/wails-auth-integration from wansing

⸻

Context Files (read in this order)

1. GOVERNANCE_CORE.md
2. START_HERE.md
3. DEV.md
4. AGENT_RULES.md
5. SECURITY_RULES.md
6. DECISIONS.md
7. CONTRACTS.md  ← primary reference for API shapes and auth contract
8. PIPELINE.md (Stage 6b section)
9. DEV_LOG.md (unread entries)

⸻

Gate-In Verified: YES

- Stage 3 merged to wansing ✅ (merge-approval/state-3-booking-logic.md)
- Stage 6a merged to wansing ✅ (merge-approval/state-6a-backend-core.md)

⸻

Task

Switch the Wails desktop app from Stage 3's mock Zustand store to real API
calls against the Stage 6a backend. The UI must not change — only the data
layer is replaced.

### 1. Auth Integration

Replace the mock `switchRole` / hardcoded currentUser with real auth:

- Login page: POST `/api/auth/signin` → store returned `token` + `user`
- Signup page: POST `/api/auth/signup` (body includes `role: "teacher"|"student"`)
- Signout: POST `/api/auth/signout` with Bearer token
- On app load: GET `/api/auth/me` to restore session if token exists in storage

Token storage: `localStorage` key `sectionlap_token` (or equivalent).
Attach to every authenticated request: `Authorization: Bearer <token>`

Session shape from backend (CONTRACTS.md "Module: Backend API"):
```json
{
  "data": {
    "token": "<opaque-session-token>",
    "user": { "id": "string", "name": "string", "email": "string", "role": "teacher" | "student" }
  }
}
```

### 2. Sections API

Replace mock section data with real API calls:

| Action | Endpoint |
|--------|----------|
| List sections | GET `/api/sections` |
| Create section | POST `/api/sections` (teacher only) |
| Update section | PUT `/api/sections/:id` (teacher + owner only) |

Section shape from backend matches Stage 3 `Section` type exactly.

### 3. Bookings API

Replace mock booking store with real API calls:

| Action | Endpoint |
|--------|----------|
| Create booking | POST `/api/bookings` body: `{ sectionId }` |
| List my bookings | GET `/api/bookings` |
| Pay booking | POST `/api/bookings/:id/pay` |
| Fail booking | POST `/api/bookings/:id/fail` |
| Retry booking | POST `/api/bookings/:id/retry` |

Error handling: HTTP 409 returns `{ "error": "ALREADY_BOOKED" }` or
`{ "error": "CAPACITY_FULL" }` — surface these to the user.

### 4. Jitsi Token

Replace hardcoded room name with backend-issued JWT:

- When user enters Live Class: GET `/api/sections/:id/jitsi-token`
- Response: `{ "data": { "token": "<jitsi-jwt>", "roomId": "section-<sectionId>" } }`
- Pass token to `JitsiMeetExternalAPI` via `jwt` option

### 5. Backend URL Config

Add `VITE_API_BASE_URL` to `config.ts` (default: `http://localhost:8080`).
All API calls use this base URL.

### What NOT to change

- Live Class UI (Jitsi embed, tabs) — Stage 2b/2c work
- Whiteboard / Document Highlight — Stage 4b work
- Any UI component or page layout

⸻

Acceptance Criteria

- [ ] Teacher and student can sign up and sign in via the real backend
- [ ] Session persists across app reload (token restored, /api/auth/me called)
- [ ] Sections list loaded from real API; teacher can create/update sections
- [ ] Student can book, pay, retry a section via real API
- [ ] Enrollment check (paid booking) gates Live Class access — uses real booking state
- [ ] Jitsi JWT fetched from backend on Live Class entry (not hardcoded)
- [ ] No mock store logic remains for auth/booking/sections

⸻

Output Artifacts

- Gate-out: `gate-out/state-6b-wails-auth-integration.md`
- Merge-approval: `merge-approval/state-6b-wails-auth-integration.md`
- PR: `feat(desktop-app): Stage 6b — wire Wails to real backend API`
- PR targets: `wansing`

⸻

Constraints

- Branch from `wansing` only — do NOT branch from any feature branch
- Do NOT merge to `wansing` or `main` directly — create PR only
- Do NOT modify: CONTRACTS.md, PIPELINE.md, DECISIONS.md, or any governance file
- Do NOT change Live Class, Whiteboard, or Document Highlight components
- Follow SECURITY_RULES.md — never log tokens, never commit .env files
- Tech stack: follow DECISIONS.md (no new auth libraries, no new HTTP clients
  beyond what's already in the project)
