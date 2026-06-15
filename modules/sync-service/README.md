# sync-service

Real-time collaboration server for SectionLap, built on [Yjs](https://yjs.dev)
and [y-websocket](https://github.com/yjs/y-websocket). Provides the shared
sync backend for:

- **Whiteboard** — collaborative drawing surface
- **Document highlight** — annotation/highlight layer over a PDF/image

This is consumed by Stage 4b (Wails desktop-app) and Stage 5 (Expo mobile-app).

## Setup / Run

```bash
cd modules/sync-service
npm install
npm start
```

This starts a WebSocket server at `ws://localhost:1234`. Configure the port
with the `SYNC_PORT` environment variable (default `1234`).

A plain HTTP health check is also available at `http://localhost:1234/`
(returns `sync-service ok`).

## Demo clients

Two standalone HTML demos are included in `demo/` to exercise the protocol
without any client app:

- `demo/whiteboard.html` — collaborative drawing canvas
- `demo/highlight.html` — load an image/PDF page render and draw highlight
  strokes over it

Open either file directly in a browser (or serve the `demo/` directory with
any static file server) while the server is running. Open the same file in
two browser windows with the same room name to see real-time sync.

## Protocol / Contract (for Stage 4b and Stage 5)

### Connection

Connect using a `y-websocket` `WebsocketProvider`:

```js
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const doc = new Y.Doc()
const provider = new WebsocketProvider('ws://localhost:1234', roomName, doc)
```

`roomName` determines which Yjs document clients share — all clients
connecting with the same `roomName` are synced together. The server is
stateless beyond holding documents in memory per room (in-memory only;
no persistence in Stage 4a).

### Room naming convention

To avoid collisions between features sharing the sync server, prefix room
names by feature and scope to the live class session:

- Whiteboard: `whiteboard-<sectionSessionId>`
- Document highlight: `highlight-<sectionSessionId>`

`sectionSessionId` is a unique identifier for a given live class session
(e.g. section ID + scheduled date/time), provided by the booking/enrollment
logic (Stage 3) and shared by all participants of that session.

### Whiteboard shared data shape

`Y.Doc` for a `whiteboard-*` room exposes:

- `doc.getArray('strokes')` — array of stroke objects:
  ```ts
  type Stroke = {
    color: string   // e.g. "#000000"
    width: number   // line width in px
    points: { x: number, y: number }[]
  }
  ```
  Clients append a `Stroke` to the array when a pen stroke is completed.
  Coordinates are in canvas pixel space — clients are responsible for
  scaling to their own canvas size (recommend a fixed logical canvas size,
  e.g. 800x500, shared by all clients).

- To clear the board, clients call `strokes.delete(0, strokes.length)`.

### Document-highlight shared data shape

`Y.Doc` for a `highlight-*` room exposes:

- `doc.getMap('document')` — metadata about the document being viewed:
  ```ts
  {
    url: string   // URL/path of the image or rendered PDF page being annotated
  }
  ```
  Any client may set `url`; all clients should load/display it when changed.

- `doc.getArray('highlights')` — array of highlight stroke objects, same
  shape as `Stroke` above (`color`, `width`, `points`), drawn in the
  coordinate space of the loaded image at its natural (unscaled) size.

- To clear highlights, clients call `highlights.delete(0, highlights.length)`.

### Awareness (optional, for future use)

`y-websocket`'s built-in awareness protocol (cursor position, user presence)
is available via `provider.awareness` and may be used by Stage 4b/5 for
showing participant cursors, but is not required for the MVP.
