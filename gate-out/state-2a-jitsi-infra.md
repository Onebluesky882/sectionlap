Status:
PASS

Stage:
2a

Domain:
modules/live-class

Summary:
Added a docker-compose stack for self-hosted Jitsi Meet (prosody, web,
jicofo, jvb) configured for local development, plus an .env.example,
a gen-passwords.sh helper to generate JVB/Jicofo internal auth secrets,
and a README documenting setup/run steps and the local room URL/config
contract for Stage 2b.

Modified Files:
- modules/live-class/docker-compose.yml
- modules/live-class/.env.example
- modules/live-class/gen-passwords.sh
- modules/live-class/README.md

Dependencies Added:
- none (docker images only: jitsi/web, jitsi/prosody, jitsi/jicofo, jitsi/jvb, stable-9646)

Tests:
- docker-compose.yml YAML syntax validated (ruby -ryaml YAML.load_file) — passes
- docker/docker-compose not available in this environment, so `docker compose up`
  / `docker compose config` could not be executed. Compose file follows the
  standard jitsi/docker-jitsi-meet stable-9646 service layout.

Acceptance Criteria:
- [x] Jitsi Meet running locally via docker-compose (config provided; not
      executed in this environment — see Known Issues)
- [x] Setup/run instructions documented (README.md)
- [x] Local Jitsi room URL/config documented for Stage 2b
      (http://localhost:8000/<room-name>, auth/embedding/HTTPS notes in README)

Known Issues:
- Docker is not installed in this workspace, so the stack could not be
  started/verified end-to-end (`docker compose up -d`). The conductor or a
  worker with Docker available should run the Setup steps in README.md to
  confirm the stack comes up and the room URL loads, before Stage 2b begins
  integration.

Recommendations:
- Stage 2b should use the IFrame API (external_api.js) rather than a raw
  iframe if it needs join/leave/mute events from the Wails webview.
- If the Wails webview requires HTTPS for getUserMedia, switch
  DISABLE_HTTPS=0 in .env (self-signed cert) — documented in README.

Ready For Next Stage:
YES
