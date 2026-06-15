# CONTRACTS.md

## Purpose
Define the public interfaces between modules. Stage 3 (mock booking /
payment / enrollment logic, implemented as a Zustand store in
`modules/desktop-app/frontend/src/store/useAppStore.ts`) is the source of
truth for the shapes below. Stage 6 (backend) MUST implement an API that
satisfies these same input/output shapes so the desktop and mobile clients
can swap the mock store for real API calls without UI changes.

⸻

## Module: Booking / Payment / Enrollment Logic

Source (Stage 3, mock): `modules/desktop-app/frontend/src/store/useAppStore.ts`
Types: `modules/desktop-app/frontend/src/types.ts`

### Entities

```ts
type UserRole = "teacher" | "student";

interface User {
  id: string;
  name: string;
  role: UserRole;
}

interface Section {
  id: string;
  title: string;
  description: string;
  price: number;
  teacher: string;     // display name
  teacherId: string;   // owner — used for role-based filtering
  category: string;
  durationMinutes: number;
  capacity: number;    // max active (non-failed) bookings
}

type PaymentStatus = "pending" | "paid" | "failed";

interface BookingRecord {
  id: string;
  sectionId: string;
  studentId: string;
  status: PaymentStatus;
  bookedAt: string;   // ISO timestamp
  paidAt?: string;    // ISO timestamp, set when status becomes "paid"
}
```

### Operation: Create Booking

**Input:** `sectionId: string` (acting user = `currentUser`, read from auth
context / session in Stage 6)

**Output:**
```ts
interface CreateBookingResult {
  booking: BookingRecord | null;
  error: BookingError | null;
}

type BookingError = "ALREADY_BOOKED" | "CAPACITY_FULL";
```

**Behavior (booking logic):**
- If the acting student already has an active (`pending` or `paid`) booking
  for this section, return that existing booking with `error:
  "ALREADY_BOOKED"` — do not create a duplicate (prevents double-booking).
- Active booking count for a section = bookings with `status !== "failed"`.
  If `activeCount >= section.capacity`, return `{ booking: null, error:
  "CAPACITY_FULL" }` — no booking is created (enforces section capacity).
- Otherwise create a new `BookingRecord` with `status: "pending"`,
  `bookedAt: now`, and return `{ booking, error: null }`.

### Operation: Pay Booking (simulated)

**Input:** `bookingId: string`

**Output:** updated `BookingRecord` with `status: "paid"`, `paidAt: now`.

**Behavior (payment logic):** transitions a booking from `pending` →
`paid`. In Stage 6 this is where a real payment provider charge would be
confirmed before transitioning state.

### Operation: Fail Booking (simulated)

**Input:** `bookingId: string`

**Output:** updated `BookingRecord` with `status: "failed"`.

**Behavior:** transitions `pending` → `failed`. A `failed` booking does not
count toward `capacity` (frees the seat for retry or for another student).

### Operation: Retry Booking

**Input:** `bookingId: string`

**Output:** updated `BookingRecord` with `status: "pending"`, `paidAt`
cleared.

**Behavior:** only valid when current `status === "failed"`. Resets the
booking to `pending` so the student can attempt payment again.

### Operation: Enrollment (derived, no separate state)

A student is **enrolled** in a section iff there exists a `BookingRecord`
with `sectionId`, `studentId === currentUser.id`, and `status === "paid"`.

Enrollment unlocks:
- Section content (full detail view — "enrolled" banner)
- "Join Live Class" action (`/sections/:sectionId/live-class`)

### Operation: Role-based Section Visibility

- **Teacher** (`currentUser.role === "teacher"`): Teacher Dashboard shows
  only `sections.filter(s => s.teacherId === currentUser.id)`.
- **Student** (`currentUser.role === "student"`): "My Enrollments" shows
  only sections with a `paid` booking for `currentUser.id` (see Enrollment
  above). The "Browse Sections" list remains visible to all roles so
  students can discover and book new sections.

### Errors

```ts
{ "error": "ALREADY_BOOKED" }   // booking already exists for this student+section
{ "error": "CAPACITY_FULL" }    // section has no remaining seats
```

Stage 6 should return these as structured error responses (e.g. HTTP 409)
rather than throwing.

### Persistence (Stage 3)

All state (`sections`, `bookings`, `currentUser`) is persisted to
`localStorage` via Zustand's `persist` middleware under key
`sectionlap-store` (version `2`). Stage 6 replaces this local persistence
with real API calls against the same shapes; the store interface
(`createBooking`, `payBooking`, `failBooking`, `retryBooking`,
`addSection`, `updateSection`, `switchRole`) is the seam to swap.

⸻

## Module: sync-service (Stage 4a)

See `modules/sync-service/README.md` for full protocol documentation.
Summary for consumers (Stage 4b desktop-app, Stage 5 mobile-app):

### Connection
- WebSocket server: `ws://localhost:1234` (configurable via `SYNC_PORT`)
- Connect with `y-websocket`'s `WebsocketProvider(url, roomName, ydoc)`
- Room naming: `whiteboard-<sectionSessionId>`, `highlight-<sectionSessionId>`

### Whiteboard room — shared shape
- `doc.getArray('strokes')`: `{ color: string, width: number, points: {x,y}[] }[]`
- Clear: `strokes.delete(0, strokes.length)`

### Document-highlight room — shared shape
- `doc.getMap('document')`: `{ url: string }` (image/PDF page being viewed)
- `doc.getArray('highlights')`: same `Stroke` shape as whiteboard, coords in
  the document's natural image size
- Clear: `highlights.delete(0, highlights.length)`

### Errors
- No structured errors — connection failures are standard WebSocket close/error
  events from `y-websocket`'s `WebsocketProvider`. Server is in-memory only
  (no persistence in Stage 4a); document state is lost when the server
  restarts or all clients for a room disconnect.

