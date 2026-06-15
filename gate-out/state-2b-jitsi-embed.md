Status:
PASS

Stage:
2b

Domain:
modules/desktop-app

Summary:
Added a "Live Class" screen to the Wails app that embeds the local
self-hosted Jitsi room from Stage 2a using the Jitsi IFrame API
(external_api.js). A "Join Live Class" button appears on the section
detail page once a section is enrolled (booking.status === "paid"),
linking to /sections/:sectionId/live-class. The page loads the IFrame
API script from the configured Jitsi base URL, mounts the conference
into a container div using the section id as the room name, and listens
for videoConferenceJoined / videoConferenceLeft events to show join/left
status.

Modified Files:
- modules/desktop-app/frontend/src/App.tsx
- modules/desktop-app/frontend/src/App.css
- modules/desktop-app/frontend/src/pages/SectionDetailPage.tsx
- modules/desktop-app/frontend/src/vite-env.d.ts

New Files:
- modules/desktop-app/frontend/src/config.ts (JITSI_BASE_URL, default
  http://localhost:8000, override via VITE_JITSI_BASE_URL)
- modules/desktop-app/frontend/src/hooks/useJitsiExternalApi.ts (loads
  external_api.js once and exposes ready/error state)
- modules/desktop-app/frontend/src/pages/LiveClassPage.tsx (Live Class
  screen; redirects to section detail if not enrolled)

Dependencies Added:
- none (Jitsi IFrame API loaded at runtime from the self-hosted instance,
  no npm package)

Tests:
- `npm install` + `npm run build` (tsc + vite build) — passes
- `npm run dev` — Vite dev server starts and serves the app

Acceptance Criteria:
- [x] "Live Class" screen in Wails app embeds local Jitsi room
      (webview/iframe via IFrame API)
- [ ] Join/leave room works with mic/cam from the Wails app — NOT
      verified end-to-end in this environment (see Known Issues)

Known Issues:
- Docker is not available in this workspace (same constraint as Stage
  2a's gate-out), so the modules/live-class docker-compose stack could
  not be started, and the embedded Jitsi room could not be exercised
  end-to-end (join/leave, mic/cam permissions inside the Wails webview).
  Build and dev server were verified to compile/run cleanly; the
  LiveClassPage correctly gates on enrollment and wires up the IFrame
  API per modules/live-class/README.md.
- The Wails webview's getUserMedia behavior with HTTPS vs HTTP
  (DISABLE_HTTPS in modules/live-class/.env) has not been verified. If
  mic/cam fail over plain HTTP in the native webview, switch the local
  Jitsi stack to DISABLE_HTTPS=0 per the Stage 2a README and update
  VITE_JITSI_BASE_URL accordingly.

Recommendations:
- A worker/environment with Docker should run modules/live-class's
  docker-compose stack alongside `wails dev` to confirm: room loads in
  the embedded webview, join/leave events fire, and mic/cam permission
  prompts work correctly.
- If HTTPS is required for getUserMedia in the Wails webview, set
  DISABLE_HTTPS=0 in modules/live-class/.env and
  VITE_JITSI_BASE_URL=https://localhost:8443 (self-signed cert; webview
  must trust it).

Risks:
- Acceptance criterion for join/leave with mic/cam is unverified pending
  Docker availability.

Blockers:
- None for code/PR; end-to-end media verification blocked on Docker.

Ready For Next Stage:
YES (pending end-to-end mic/cam verification with Docker available)
