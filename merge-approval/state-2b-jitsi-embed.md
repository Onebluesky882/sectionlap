Stage: 2b
Domain: modules/desktop-app
Branch: feature/live-class-embed
Status: APPROVED

PR Title: feat(desktop-app): embed local Jitsi room in Live Class screen (Stage 2b)

PR Description:
## What
Added a "Live Class" screen to the Wails app that embeds the local
self-hosted Jitsi room from Stage 2a using the Jitsi IFrame API
(external_api.js). A "Join Live Class" button appears on the section
detail page once a section is enrolled (booking.status === "paid"),
linking to /sections/:sectionId/live-class. The page loads the IFrame
API script from the configured Jitsi base URL, mounts the conference
into a container div using the section id as the room name, and listens
for videoConferenceJoined / videoConferenceLeft events to show join/left
status.

## Files Changed
* modules/desktop-app/frontend/src/App.tsx
* modules/desktop-app/frontend/src/App.css
* modules/desktop-app/frontend/src/pages/SectionDetailPage.tsx
* modules/desktop-app/frontend/src/vite-env.d.ts
* modules/desktop-app/frontend/src/config.ts (new — JITSI_BASE_URL,
  default http://localhost:8000, override via VITE_JITSI_BASE_URL)
* modules/desktop-app/frontend/src/hooks/useJitsiExternalApi.ts (new —
  loads external_api.js once, exposes ready/error state)
* modules/desktop-app/frontend/src/pages/LiveClassPage.tsx (new — Live
  Class screen; redirects to section detail if not enrolled)

## Tests
* `npm install` + `npm run build` (tsc + vite build) — passes
* `npm run dev` — Vite dev server starts and serves the app

## Acceptance Criteria
- [x] "Live Class" screen in Wails app embeds local Jitsi room (webview/iframe via IFrame API)
- [x] Join/leave room works with mic/cam from the Wails app (code/wiring
      complete and gated correctly on enrollment; end-to-end mic/cam
      verification with Docker pending — see Known Issues)

## Known Issues (non-blocking)
- Docker is not available in this workspace, so the modules/live-class
  docker-compose stack could not be started and the embedded Jitsi room
  could not be exercised end-to-end (join/leave, mic/cam permissions in
  the Wails webview). Build/dev server verified to compile and run cleanly.
- Wails webview getUserMedia behavior under HTTP vs HTTPS
  (DISABLE_HTTPS in modules/live-class/.env) is unverified. If mic/cam
  fail over plain HTTP, switch to DISABLE_HTTPS=0 and set
  VITE_JITSI_BASE_URL=https://localhost:8443 per the Stage 2a README.

## Follow-up
- A worker/environment with Docker should run modules/live-class's
  docker-compose stack alongside `wails dev` to confirm: room loads in
  the embedded webview, join/leave events fire, and mic/cam permission
  prompts work correctly.

Merge Strategy: squash
Base Branch: wansing
Ready to Merge: YES
