Stage: 4a
Domain: modules/sync-service
Branch: feature/sync-service-infra
Status: APPROVED

PR Title: feat(sync-service): Yjs + y-websocket sync server (Stage 4a)

PR Description:
## What
Built the real-time sync service using Yjs + y-websocket:
- y-websocket WebSocket server (ws://localhost:1234, configurable via
  SYNC_PORT) with an HTTP health check at /
- Standalone collaborative whiteboard demo (Y.Array of strokes)
- Standalone document-highlight demo (Y.Map document + Y.Array highlights)
- README documenting setup/run instructions and the full shared
  protocol/contract for Stage 4b and Stage 5

## Files Changed
* modules/sync-service/package.json (new — yjs, y-websocket, ws)
* modules/sync-service/server/index.js (new)
* modules/sync-service/demo/whiteboard.html (new)
* modules/sync-service/demo/highlight.html (new)
* modules/sync-service/README.md (new)
* CONTRACTS.md (added "Module: sync-service (Stage 4a)" section)
* PIPELINE.md (Stage 4a acceptance criteria checked off)

## Tests
* `npm install` completes cleanly (0 vulnerabilities)
* `npm start` launches the y-websocket server on ws://localhost:1234,
  HTTP health check returns "sync-service ok"
* End-to-end sync verified programmatically: two Y.Doc clients connected
  to the same `whiteboard-test` room via WebsocketProvider; a stroke
  pushed by client 1 appeared in client 2's `strokes` array in real time
* demo/whiteboard.html and demo/highlight.html implement the documented
  protocol (Y.Array('strokes'), Y.Map('document') + Y.Array('highlights'))

## Acceptance Criteria
- [x] WebSocket sync server running locally (Yjs + y-websocket)
- [x] Whiteboard: collaborative drawing surface, real-time sync across connected clients
- [x] Document highlight: load PDF/image, draw/highlight annotations synced in real-time
- [x] Shared protocol/contract documented for Wails (Stage 4b) and Expo (Stage 5) to reuse
- [x] Setup/run instructions documented

## Known Issues (non-blocking)
- Server is in-memory only — no persistence; document state is lost on
  restart or when all clients for a room disconnect (by design for 4a).
- Demo HTML files load Yjs/y-websocket from esm.sh CDN — Stage 4b/5 should
  bundle these as npm dependencies in their own apps.

## Follow-up
- Stage 4b/5 should add `yjs` and `y-websocket` as dependencies and follow
  the room-naming convention (`whiteboard-<sectionSessionId>`,
  `highlight-<sectionSessionId>`) documented in
  modules/sync-service/README.md.
- Consider documenting `sectionSessionId` generation as part of Stage 3's
  booking/enrollment contract, since both Stage 4b and Stage 5 need it.

Merge Strategy: squash
Base Branch: wansing
Ready to Merge: YES
