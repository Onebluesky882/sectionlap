# Stage 6a — Backend API Contract

This document supplements CONTRACTS.md with the auth/session contract for
Stage 6b (Wails) and Stage 6c (Expo) to consume. The Conductor should
merge this into CONTRACTS.md per governance rules.

---

## Auth Library

go-better-auth (Authula) v1.11.0 — real module path: `github.com/Authula/authula`

Session storage: PostgreSQL (`sessions` table via Bun ORM)

---

## Session / Token Shape

After signup or signin, the backend returns a **session token** (raw string):

```json
{
  "data": {
    "token": "<opaque-session-token>",
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "teacher" | "student"
    }
  },
  "error": null,
  "status": "success"
}
```

The token is an opaque random string (not a JWT). It is hashed (HMAC-SHA256
keyed with `AUTH_SECRET`) before storage in the `sessions` table.

**Session table columns:**

| Column | Type | Description |
|---|---|---|
| `id` | string | UUID |
| `user_id` | string | References `users.id` |
| `token` | string | HMAC hash of the raw token |
| `expires_at` | timestamp | Expiry (default: 24h) |
| `ip_address` | string? | Client IP at signin |
| `user_agent` | string? | Client UA at signin |

---

## Role Claims

Roles are stored in the `user_roles` table:

| Column | Type | Values |
|---|---|---|
| `user_id` | string | FK to `users.id` |
| `role` | string | `"teacher"` or `"student"` |

Role is set during signup (from the `role` field in the request body).

---

## How Clients Send the Token

Send the session token in the `Authorization` header:

```
Authorization: Bearer <session-token>
```

The backend also accepts a `sectionlap_session` cookie (for browser-based clients).

---

## Auth Endpoints

### POST /api/auth/signup

**Body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "securepass",
  "role": "teacher"
}
```

**Response:** 201 Created
```json
{
  "data": { "token": "...", "user": { "id": "...", "name": "...", "email": "...", "role": "teacher" } },
  "error": null,
  "status": "success"
}
```

**Errors:**
- 400 `"role must be 'teacher' or 'student'"`
- 400 `"email already exists"` (from Authula)
- 400 `"invalid password length"` (min 8, max 128 chars)

---

### POST /api/auth/signin

**Body:**
```json
{ "email": "alice@example.com", "password": "securepass" }
```

**Response:** 200 OK — same shape as signup

**Errors:**
- 401 `"invalid credentials"`

---

### POST /api/auth/signout

**Headers:** `Authorization: Bearer <token>`

**Response:** 200 OK
```json
{ "data": { "message": "signed out" }, "error": null, "status": "success" }
```

---

### GET /api/auth/me

**Headers:** `Authorization: Bearer <token>`

**Response:** 200 OK
```json
{
  "data": { "id": "...", "name": "...", "email": "...", "role": "teacher" },
  "error": null,
  "status": "success"
}
```

**Errors:**
- 401 `"unauthorized"` (missing/invalid token)
- 401 `"unauthorized: role not set"` (user has no role in user_roles table)

---

## Sections Endpoints

### GET /api/sections

Public. Returns all sections.

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "HTML Basics",
      "description": "...",
      "price": 29.99,
      "teacher": "Alice",
      "teacherId": "uuid",
      "category": "Frontend",
      "durationMinutes": 90,
      "capacity": 20,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "error": null,
  "status": "success"
}
```

### POST /api/sections

Auth: Bearer token, teacher role required.

**Body:**
```json
{
  "title": "HTML Basics",
  "description": "Learn HTML from scratch",
  "price": 29.99,
  "category": "Frontend",
  "durationMinutes": 90,
  "capacity": 20
}
```

The `teacher` display name and `teacherId` are derived from the session.

### PUT /api/sections/:id

Auth: Bearer token, teacher role required, must be section owner.

Body: same as POST (all fields optional).

### GET /api/sections/:id/jitsi-token

Auth: Bearer token. Teacher (owner) or enrolled student (paid booking) only.

**Response:**
```json
{
  "data": { "token": "<jitsi-jwt>", "roomId": "section-<sectionId>" },
  "error": null,
  "status": "success"
}
```

**Errors:**
- 403 `"forbidden: only the section teacher can get a token"`
- 403 `"forbidden: student is not enrolled in this section"`

---

## Bookings Endpoints

### POST /api/bookings

Auth: Bearer token.

**Body:** `{ "sectionId": "uuid" }`

**Response (success):** 201
```json
{
  "data": { "booking": { "id": "...", "sectionId": "...", "studentId": "...", "status": "pending", "bookedAt": "ISO8601" }, "error": null },
  "error": null,
  "status": "success"
}
```

**Response (conflict):** 409
```json
{
  "data": { "booking": { ... }, "error": "ALREADY_BOOKED" },
  "error": "ALREADY_BOOKED",
  "status": "error"
}
```

```json
{
  "data": { "booking": null, "error": "CAPACITY_FULL" },
  "error": "CAPACITY_FULL",
  "status": "error"
}
```

### GET /api/bookings

Returns all bookings for the authenticated user.

### POST /api/bookings/:id/pay

Transitions booking from `pending` → `paid`. Sets `paidAt`.

### POST /api/bookings/:id/fail

Transitions booking from `pending` → `failed`.

### POST /api/bookings/:id/retry

Transitions booking from `failed` → `pending`. Clears `paidAt`.

---

## Booking Record Shape

Matches Stage 3 `BookingRecord` contract exactly:

```json
{
  "id": "string",
  "sectionId": "string",
  "studentId": "string",
  "status": "pending" | "paid" | "failed",
  "bookedAt": "ISO8601",
  "paidAt": "ISO8601 | null"
}
```

---

## Standard Error Format

All errors return structured JSON (never throw):

```json
{ "error": "descriptive message" }
```

Business-logic booking errors use HTTP 409 with structured body (see above).

---

## Jitsi JWT Format

Signed with HS256, keyed with `JITSI_APP_SECRET`.

```json
{
  "iss": "<JITSI_APP_ID>",
  "sub": "<JITSI_DOMAIN>",
  "aud": "jitsi",
  "room": "section-<sectionId>",
  "nbf": <unix>,
  "exp": <unix + 4h>,
  "context": {
    "user": {
      "id": "<userId>",
      "name": "<userName>",
      "role": "teacher" | "student"
    }
  }
}
```
