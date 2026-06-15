# ARCHITECTURE.md

## Overview
SectionLap is a multi-client learning platform (Wails desktop + Expo mobile)
built around per-section courses. Early stages run entirely against local mock
data so UI/UX and interaction logic can be validated before any backend exists.
Live classes use a self-hosted Jitsi Meet instance; a separate real-time sync
service (Yjs) powers collaborative whiteboard and document-highlight features
shared by both clients.

## Modules / Components

### modules/desktop-app
- Wails app (Windows, macOS)
- Section list, section detail, booking/checkout UI, teacher dashboard
- Stage 1: mock JSON data only
- Stage 3: adds booking/payment/enrollment logic on top of mock data (local
  storage), with documented input/output contracts for future backend
- Stage 6: switches from mock logic to real backend API

### modules/live-class
- Self-hosted Jitsi Meet (docker-compose, local)
- Embedded in desktop-app via webview/iframe ("Live Class" screen)
- Mobile equivalent in modules/mobile-app uses Jitsi React Native SDK (Stage 5)

### modules/sync-service
- WebSocket server using Yjs + y-websocket
- Provides real-time collaborative whiteboard and document-highlight
  (annotation over PDF/image) sync
- Single shared protocol consumed by both desktop-app (Stage 4) and
  mobile-app (Stage 5)

### modules/mobile-app
- Expo app (Android, iPad)
- Mirrors desktop-app's student/teacher flows using the same mock logic
  contracts from Stage 3
- Connects to the same sync-service instance as desktop-app
- Live class via Jitsi React Native SDK

### modules/backend
- Stage 6a — replaces mock booking/payment/enrollment with real API + DB
- Tech stack: Fiber v3 (Go web framework), PostgreSQL, Bun ORM
  (uptrace/bun — https://bun.uptrace.dev/)
- Auth: github.com/m-t-a97/go-better-auth (teacher/student roles)
- Implements the contracts defined during Stage 3 (see CONTRACTS.md)
- Ties Jitsi room access to enrollment status (paid students only)
- Stage 6b (desktop-app) and Stage 6c (mobile-app) integrate independently
  against this backend's API — see ADR 001

## Data Flow

**Stages 1–5 (mock-data phase):**
1. Teacher posts a section (mock data, local storage)
2. Student browses sections, books, "pays" (simulated transaction state)
3. On "paid", enrollment unlocks section content + "Join Live Class"
4. Student/teacher join Jitsi room (live-class module)
5. During class, both clients connect to sync-service for whiteboard /
   document-highlight, synced in real-time via Yjs

**Stage 6 (backend phase):**
1. desktop-app and mobile-app call backend API instead of local mock logic
2. Backend persists sections, bookings, payments, enrollments in DB
3. Backend provisions/authorizes Jitsi room access based on enrollment
4. sync-service and live-class flows remain unchanged from Stage 4/5

## External Dependencies
- Jitsi Meet (self-hosted, docker-compose)
- Yjs / y-websocket
- Jitsi React Native SDK (mobile)
- Payment provider — TBD, introduced in Stage 6

⸻

## Constraints
- Stages 1–5 must not depend on a real backend or external DB — all
  booking/payment/enrollment state is local/mock until Stage 6
- desktop-app and mobile-app must consume the same sync-service protocol
  (single source of truth defined in Stage 4)
- Stage 6 must implement contracts as defined by Stage 3's mock logic —
  do not redesign booking/payment/enrollment shapes without updating
  CONTRACTS.md and DECISIONS.md first
- Jitsi self-hosting stays local (docker-compose) until a production
  deployment decision is recorded in DECISIONS.md
