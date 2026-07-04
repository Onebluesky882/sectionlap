# modules/live-class — Jitsi Meet (self-hosted, local dev)

Self-hosted Jitsi Meet stack via docker-compose, for local development only.
Stage 2b (Wails embed) and Stage 5 (Expo / Jitsi React Native SDK) consume
this instance.

## Prerequisites

- Docker + Docker Compose
- `openssl` (used by `gen-passwords.sh`)

## Setup

```bash
cd modules/live-class

# 1. Create your local env file
cp .env.example .env

# 2. Generate random internal auth secrets (JVB/Jicofo)
./gen-passwords.sh

# 3. Create the config directory referenced by CONFIG in .env
#    (default: ~/.jitsi-meet-cfg)
mkdir -p ~/.jitsi-meet-cfg/{web,web/letsencrypt,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb}
```

## Run

```bash
docker compose up -d
```

First start may take a minute while Prosody/Jicofo/JVB initialize.

Check status:

```bash
docker compose ps
docker compose logs -f web
```

## Stop / Reset

```bash
docker compose down

# Full reset (also wipes generated XMPP config):
docker compose down
rm -rf ~/.jitsi-meet-cfg
```

## Local Room URL / Config (for Stage 2b)

With the defaults in `.env.example`, the Jitsi web UI is served at:

```
http://localhost:8000
```

A meeting room is just a path on that base URL — any room name works
(no pre-provisioning needed):

```
http://localhost:8000/<room-name>
```

Example, for a SectionLap section with id `section-123`:

```
http://localhost:8000/section-123
```

### Config notes for Stage 2b (Wails embed)

- **Base URL:** `PUBLIC_URL` / `HTTP_PORT` in `.env` — defaults to
  `http://localhost:8000`. Override these in `.env` if port 8000 conflicts
  with another local service.
- **Auth:** `ENABLE_AUTH=0` / `ENABLE_GUESTS=1` — local dev instance has no
  login; anyone with the room URL can join. Do not change this for local
  dev without updating this doc.
- **Embedding:** the web UI can be loaded directly in a webview/iframe at
  the room URL above. The official `lib-jitsi-meet` / IFrame API
  (`https://localhost:8000/external_api.js`) is also available if Stage 2b
  needs programmatic control (mute, join/leave events, etc.) instead of a
  plain iframe.
- **HTTPS:** disabled by default (`DISABLE_HTTPS=1`) for local dev to avoid
  self-signed certificate issues in the embedded webview. If Stage 2b's
  webview requires HTTPS (e.g. for `getUserMedia` permissions), set
  `DISABLE_HTTPS=0` and `ENABLE_LETSENCRYPT=0` — Jitsi will fall back to a
  self-signed cert at `https://localhost:8443`, which will require the OS
  webview to trust/accept the certificate.

## Live Streaming with Jibri

Jibri (Jitsi Broadcasting Infrastructure) captures the Jitsi conference and pushes an
RTMP stream to an external endpoint (YouTube Live, Twitch, a local nginx-rtmp server, etc.).

### Prerequisites

- Linux host (or Docker Desktop on macOS — `/dev/snd` passthrough required; may not work on
  macOS without additional setup)
- Docker with `/dev/snd` device access enabled
- A running Jitsi stack (`docker compose up -d`)

### New env vars

Set these in `.env` before running `docker compose up`:

| Variable | Description | Default |
|---|---|---|
| `JIBRI_XMPP_USER` | Jibri's XMPP service-account username | `jibri` |
| `JIBRI_XMPP_PASSWORD` | Jibri's XMPP password (generate with `./gen-passwords.sh`) | *(empty — must set)* |
| `JIBRI_BREWERY_MUC` | Internal MUC where Jibri registers with Jicofo | `jibribrewery` |
| `JIBRI_PENDING_TIMEOUT` | Seconds Jicofo waits for Jibri before failing | `90` |
| `XMPP_RECORDER_DOMAIN` | XMPP domain Jibri uses to join as a recorder | `recorder.meet.jitsi` |

All are in `.env.example`. Copy `.env.example` → `.env` and set `JIBRI_XMPP_PASSWORD` before
starting the stack.

### Getting an RTMP stream key

**YouTube Live:**
1. Go to YouTube Studio → Go Live → Stream settings.
2. Copy the *Stream key* shown on the page.
3. Paste it into the "RTMP stream key" field in the Wails Live Class screen, then click
   **Start Live Stream**.

**Local test with nginx-rtmp:**
1. Run a local RTMP server:
   ```bash
   docker run -d -p 1935:1935 alfg/nginx-rtmp
   ```
2. Use `rtmp://localhost/live/test` as the RTMP URL (configured via `VITE_RTMP_STREAM_KEY` or
   pasted at runtime in the teacher UI).
3. Play back with VLC: `vlc rtmp://localhost/live/test`.

### Starting a live stream

1. Ensure the Jitsi stack including Jibri is up (`docker compose ps` — all services healthy).
2. Open the Wails desktop app as a teacher and join a Live Class.
3. In the **Live Stream** panel (teacher-only), paste your RTMP stream key.
4. Click **Start Live Stream**. The status indicator changes to **● LIVE** once Jibri
   connects and begins streaming.
5. Click **Stop Live Stream** to end the broadcast.

### Troubleshooting

**Jibri health endpoint:**
```bash
curl http://localhost:2222/jibri/api/v1.0/health
# Healthy response: {"status":{"busyStatus":"IDLE",...}}
```

**/dev/snd errors:**
- On Linux: ensure the Docker daemon can access `/dev/snd`. Add your user to the `audio`
  group (`sudo usermod -aG audio $USER`) and restart Docker.

## Auto-Record → Lesson Clip

In addition to RTMP streaming, Jibri can record a live class to a local file. When recording
finishes, a finalize script uploads it to R2 and auto-attaches it as a `LessonClip` (see
`modules/backend`'s lesson/lesson-clip feature) under a dedicated, auto-created lesson titled
"การบันทึกสด" (Live Recordings) — one per section, every recording appended to it as a new clip.
No manual download/upload step.

### Setup

1. Copy `modules/live-class/jibri/finalize.sh` to `${CONFIG}/jibri/finalize.sh` and make it
   executable (`chmod +x`) — `docker-compose.yml` bind-mounts that path into the Jibri container.
2. Set in `.env`:

   | Variable | Description |
   |---|---|
   | `BACKEND_URL` | Reachable from inside the Jibri container, e.g. `http://host.docker.internal:8080` for a locally-running backend |
   | `INTERNAL_INGEST_SECRET` | Must match the backend's own `INTERNAL_INGEST_SECRET` env var exactly |

3. Restart the stack (`docker compose up -d`) so Jibri picks up `JIBRI_RECORDING_DIR` /
   `JIBRI_FINALIZE_RECORDING_SCRIPT_PATH`.

### How it works

Jitsi's room name is deterministically `section-<sectionId>` (set by the backend when issuing the
Jitsi JWT). Jibri names its recording output directory after the room, so `finalize.sh` recovers
the section id straight from that directory name, then:
1. `POST /api/internal/recordings/presign` — backend finds/creates the "การบันทึกสด" lesson for
   that section, creates a pending `LessonClip`, returns a presigned R2 upload URL.
2. `curl -T <file> <presigned-url>` — uploads the recording directly to R2.
3. `POST /api/internal/recordings/:clipId/complete` — marks the clip `ready`.

These endpoints are gated by a shared-secret header (`X-Internal-Secret`), not a user session —
there's no logged-in teacher in this flow, only Jibri itself.

### Starting a recording

In the Wails Live Class screen, use the separate **Record** toggle next to the RTMP stream
controls (independent of streaming — starting one doesn't require the other).

### Troubleshooting

- Check Jibri logs for `finalize.sh` output: `docker compose logs jibri | grep finalize.sh`.
- If nothing gets uploaded, confirm the recording directory name actually matches
  `section-<uuid>_<timestamp>` — Jibri's naming convention has changed across versions before.
- Whether Jitsi/Jibri support streaming and file-recording simultaneously on the same session
  hasn't been verified here — treat them as mutually exclusive until confirmed otherwise.
- On macOS / Docker Desktop: `/dev/snd` passthrough is not supported. Jibri requires a
  real Linux kernel for ALSA. Use a Linux VM or a remote Linux Docker host for live
  streaming in development.

**Jibri stays in BUSY state after stream ends:**
```bash
docker compose restart jibri
```

**Stream never starts (Jicofo timeout):**
- Check Jibri logs: `docker compose logs -f jibri`
- Verify `JIBRI_XMPP_USER` / `JIBRI_XMPP_PASSWORD` match in `.env` and that Prosody is
  running (`docker compose ps prosody`).

## Production Deployment

This setup is local-only (docker-compose on localhost). Any production
self-hosting decision (domain, TLS, scaling) must be recorded in
`DECISIONS.md` per `ARCHITECTURE.md` constraints before pursuing it.
