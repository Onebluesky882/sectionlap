Stage: 4b
Domain: modules/desktop-app
Branch: feature/sync-integration
Status: APPROVED

PR Title: feat(desktop-app): sync-service client — whiteboard & document highlight (Stage 4b)

PR Description:
## What
Integrated the Wails desktop app as a client of the sync-service (Stage 4a,
Yjs + y-websocket). The Live Class screen gains two new tabs — Whiteboard and
Document Highlight — that connect to the sync-service via WebSocket and sync
state in real time using Yjs CRDTs. The existing Video Call tab (Jitsi embed)
is unchanged.

Room naming follows `whiteboard-<sectionId>` / `highlight-<sectionId>`, using
`sectionId` as `sectionSessionId` per the current Stage 3 contract (no
scheduled session concept exists yet — see Known Issues).

A reusable `SyncCanvas` component and `useSyncRoom` hook encapsulate all
Yjs/WebSocket lifecycle management.

## Files Changed
* modules/desktop-app/frontend/package.json
* modules/desktop-app/frontend/package-lock.json
* modules/desktop-app/frontend/src/config.ts
* modules/desktop-app/frontend/src/types.ts
* modules/desktop-app/frontend/src/App.css
* modules/desktop-app/frontend/src/pages/LiveClassPage.tsx
* modules/desktop-app/frontend/src/hooks/useSyncRoom.ts (new)
* modules/desktop-app/frontend/src/components/SyncCanvas.tsx (new)
* modules/desktop-app/frontend/src/components/WhiteboardPanel.tsx (new)
* modules/desktop-app/frontend/src/components/DocumentHighlightPanel.tsx (new)

## Dependencies Added
* yjs ^13.6.31 — shared CRDT document, required by sync-service protocol
* y-websocket ^3.0.0 — WebSocket provider/client for Yjs

## Tests
* `npx tsc --noEmit` — passes, no type errors
* `npm run build` (Vite production build) — succeeds
* Manual sync verification (headless Chromium):
  - Whiteboard: stroke drawn in one context appeared in second context in
    real time, confirming Y.Array sync through the sync-service
  - Document Highlight: URL update propagates via doc.getMap('document');
    highlight overlay renders on loaded image
  - Video Call tab: Jitsi embed unchanged and functional

## Acceptance Criteria
- [x] Wails app integrated as a client connecting to the sync service
- [x] Whiteboard usable from within the Wails app with real-time sync
- [x] Document Highlight usable from within the Wails app with real-time sync

## Known Issues
* sync-service (Stage 4a) is in-memory only — state lost on restart (Stage 4a
  limitation, not Stage 4b).
* `sectionSessionId` is `section.id` — if a future stage introduces scheduled
  session instances, room names must be updated to
  `whiteboard-<sectionId>-<sessionId>`.

Merge Strategy: squash
Base Branch: wansing
Ready to Merge: YES
