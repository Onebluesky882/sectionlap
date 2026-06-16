Stage: 2c
Domain: modules/live-class, modules/desktop-app
Status: IN PROGRESS
Model: claude-opus-4-8

Workspace: branch from wansing (Stage 2a and Stage 2b merged)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage 2c)
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md
- modules/live-class/docker-compose.yml  (existing Jitsi stack — DO NOT remove services)
- modules/live-class/.env.example
- modules/live-class/README.md
- gate-out/state-2a-jitsi-infra.md
- gate-out/state-2b-jitsi-embed.md

Gate-In Verified: YES
Prior Gate-Out: gate-out/state-2a-jitsi-infra.md, gate-out/state-2b-jitsi-embed.md
Prior Merge: merge-approval/state-2a-jitsi-infra.md, merge-approval/state-2b-jitsi-embed.md

Task:
Add Jibri (Jitsi Broadcasting Infrastructure) to the existing Jitsi stack
and wire a Start/Stop Live Stream button into the Wails Live Class screen.

Deliverable 1 — modules/live-class/docker-compose.yml
- Add jibri service (image: jitsi/jibri:stable-9646 — verify latest tag with
  `docker pull jitsi/jibri --dry-run` or check hub.docker.com/r/jitsi/jibri/tags)
- Jibri requires: /dev/snd device, SYS_ADMIN + NET_BIND_SERVICE caps,
  shm_size: 2gb
- Wire Jibri to the existing prosody service via XMPP (XMPP_SERVER, XMPP_DOMAIN,
  XMPP_AUTH_DOMAIN, XMPP_INTERNAL_MUC_DOMAIN, XMPP_RECORDER_DOMAIN,
  JIBRI_XMPP_USER, JIBRI_XMPP_PASSWORD, JIBRI_BREWERY_MUC)
- jicofo already references JIBRI_BREWERY_MUC and JIBRI_PENDING_TIMEOUT — ensure
  these are set in .env.example

Deliverable 2 — modules/live-class/.env.example
- Add all new Jibri env vars with safe placeholder values:
  JIBRI_XMPP_USER, JIBRI_XMPP_PASSWORD, JIBRI_BREWERY_MUC,
  JIBRI_PENDING_TIMEOUT, XMPP_RECORDER_DOMAIN

Deliverable 3 — modules/desktop-app/frontend (Live Class screen)
- Add "Start Live Stream" / "Stop Live Stream" button visible to teacher only
  (check role from Zustand store)
- Use the Jitsi IFrame API already embedded in Stage 2b:
    api.executeCommand('startRecording', { mode: 'stream', rtmpStreamKey: '<key>' })
    api.executeCommand('stopRecording', 'stream')
- RTMP URL/key: read from env var VITE_RTMP_STREAM_KEY (default empty — show
  input field if empty so teacher can paste key at runtime)
- Show stream status (idle / live) using the IFrame API event
  `recordingStatusChanged`

Deliverable 4 — modules/live-class/README.md
- Add "Live Streaming with Jibri" section:
  - Prerequisites (Docker with /dev/snd access, Linux host recommended)
  - New env vars to set before `docker compose up`
  - How to get an RTMP stream key from YouTube Live / local test with nginx-rtmp
  - Troubleshooting: Jibri health endpoint, common /dev/snd errors

Constraints:
- Do NOT remove or rename existing services in docker-compose.yml (prosody,
  web, jicofo, jvb)
- Do NOT modify Stage 2b's Jitsi embed wiring — only add the button and
  IFrame API calls
- Use same image tag (stable-9646) as existing services for consistency
- Branch from wansing only
- STOP after assigned work is complete
- Do NOT merge to wansing/main directly
- Create PR targeting wansing via feature/jitsi-livestream
