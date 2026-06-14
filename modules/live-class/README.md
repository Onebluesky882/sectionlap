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

## Production Deployment

This setup is local-only (docker-compose on localhost). Any production
self-hosting decision (domain, TLS, scaling) must be recorded in
`DECISIONS.md` per `ARCHITECTURE.md` constraints before pursuing it.
