# PROJECT.md

## Project Name
SectionLap

## Goal
An online learning platform where courses are sold per-section instead of as a
single full course (e.g. a "Frontend" course split into HTML, CSS, JavaScript,
Deploy sections). Teachers post sections; students browse, book, and pay only
for the sections they're interested in — lowering cost and letting students
focus on what they need. Live classes run via self-hosted Jitsi Meet, with
shared real-time whiteboard and document-highlight tools across desktop and
mobile.

## Tech Stack
- **Desktop app:** Wails (Go + web frontend) — Windows, macOS
- **Mobile app:** Expo (React Native) — Android, iPad
- **Live video:** Jitsi Meet (self-hosted via docker-compose)
- **Real-time collaboration:** Yjs + y-websocket (whiteboard, document highlight)
- **Backend (Stage 6):** Go + Fiber v3 + PostgreSQL + Bun ORM + go-better-auth
  — API + DB to replace mock booking/payment/enrollment logic (see DECISIONS.md)
- **Payment (Stage 6):** TBD provider

## Team / Agents
- Conductor: user + assistant, branch `wansing`
- Stage agents: assigned per `tasks/state-[N]-<domain>.md` (see PIPELINE.md)

## Current Stage
Stage 4b — Sync Service Integration (Wails) / Stage 6a — Backend Core (active in parallel)

⸻

## Status
ACTIVE
