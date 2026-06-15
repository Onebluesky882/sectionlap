# CONTRACTS.md

## Purpose
<!-- Define the public interfaces between modules -->

⸻

## Module: [Name]

### Input
<!-- Type, format, required fields -->

### Output
<!-- Type, format, guaranteed fields -->

### Errors
<!-- Structured error format -->

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

⸻

<!-- Add one section per module -->
