# SectionLap Backend

Go API server — Fiber v3 · PostgreSQL · Bun ORM · go-better-auth (Authula)

## Requirements

- Go 1.26.4+
- PostgreSQL 16+

## Setup

```bash
# 1. Copy env template
cp .env.example .env

# 2. Edit .env — set DATABASE_URL, AUTH_SECRET, JITSI_APP_SECRET
nano .env

# 3. Create the database
psql -U postgres -c "CREATE DATABASE sectionlap;"

# 4. Run the server (runs migrations automatically on startup)
go run .
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | HTTP listen port |
| `DATABASE_URL` | `postgres://...@localhost/sectionlap` | PostgreSQL connection string |
| `AUTH_SECRET` | — | **Required.** HMAC secret for session signing (min 32 chars) |
| `SESSION_HOURS` | `24` | Session lifetime in hours |
| `JITSI_APP_ID` | `sectionlap` | Jitsi JWT app ID (must match Jitsi config) |
| `JITSI_APP_SECRET` | — | Jitsi JWT signing secret |
| `JITSI_DOMAIN` | `localhost` | Jitsi server domain |

## Database Migrations

Migrations run automatically when the server starts. Tables created:

- `users` — Authula user accounts
- `accounts` — Authula auth provider records (email/password)
- `sessions` — Authula session tokens
- `verifications` — Authula email verification tokens
- `sections` — course sections (posted by teachers)
- `bookings` — student bookings / payment state
- `user_roles` — teacher/student role per user

## API

All responses follow the standard envelope:
```json
{ "data": {...}, "error": null, "status": "success" }
```

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Register (name, email, password, role) |
| POST | `/api/auth/signin` | — | Sign in → returns session token |
| POST | `/api/auth/signout` | Bearer | Invalidate session |
| GET | `/api/auth/me` | Bearer | Current user + role |

**Signup body:**
```json
{ "name": "Alice", "email": "alice@example.com", "password": "securepass", "role": "teacher" }
```

**Signin/Signup response:**
```json
{ "data": { "token": "<session-token>", "user": { "id": "...", "name": "...", "email": "...", "role": "teacher" } } }
```

Pass the token in subsequent requests as `Authorization: Bearer <token>`.

### Sections

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/sections` | — | List all sections |
| GET | `/api/sections/:id` | — | Get section detail |
| POST | `/api/sections` | Bearer (teacher) | Create section |
| PUT | `/api/sections/:id` | Bearer (teacher, owner) | Update section |
| GET | `/api/sections/:id/jitsi-token` | Bearer (enrolled or teacher-owner) | Get Jitsi JWT |

**Create section body** (matches Stage 3 contract):
```json
{
  "title": "HTML Basics",
  "description": "...",
  "price": 29.99,
  "category": "Frontend",
  "durationMinutes": 90,
  "capacity": 20
}
```

### Bookings

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/bookings` | Bearer | Create booking `{ sectionId }` |
| GET | `/api/bookings` | Bearer | List my bookings |
| POST | `/api/bookings/:id/pay` | Bearer | Pay booking (pending→paid) |
| POST | `/api/bookings/:id/fail` | Bearer | Fail booking (pending→failed) |
| POST | `/api/bookings/:id/retry` | Bearer | Retry booking (failed→pending) |

**Create booking response:**
```json
{
  "data": {
    "booking": { "id": "...", "sectionId": "...", "studentId": "...", "status": "pending", "bookedAt": "..." },
    "error": null
  }
}
```

**Booking errors** (HTTP 409):
- `"ALREADY_BOOKED"` — active booking already exists
- `"CAPACITY_FULL"` — section at capacity

### Jitsi Token

```
GET /api/sections/:id/jitsi-token
Authorization: Bearer <token>
```

Response:
```json
{ "data": { "token": "<jitsi-jwt>", "roomId": "section-<sectionId>" } }
```

Access rules:
- Teacher: must own the section
- Student: must have a `paid` booking for the section

## Running Tests

```bash
go test ./... -v
```

## Build

```bash
go build -o backend .
./backend
```
