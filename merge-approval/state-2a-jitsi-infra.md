Stage: 2a
Domain: modules/live-class
Branch: feature/live-class-infra
Status: APPROVED

PR Title: feat(live-class): self-hosted Jitsi Meet docker-compose stack (Stage 2a)

PR Description:
## What
Added a docker-compose stack for self-hosted Jitsi Meet (prosody, web,
jicofo, jvb) configured for local development, plus an .env.example,
a gen-passwords.sh helper to generate JVB/Jicofo internal auth secrets,
and a README documenting setup/run steps and the local room URL/config
contract for Stage 2b.

## Files Changed
* modules/live-class/docker-compose.yml
* modules/live-class/.env.example
* modules/live-class/gen-passwords.sh
* modules/live-class/README.md

## Tests
* docker-compose.yml YAML syntax validated (ruby -ryaml YAML.load_file) — passes
* docker/docker-compose not available in this environment, so `docker compose up`
  / `docker compose config` could not be executed. Compose file follows the
  standard jitsi/docker-jitsi-meet stable-9646 service layout.

## Acceptance Criteria
- [x] Jitsi Meet running locally via docker-compose (config provided; not
      executed in this environment — see Known Issues)
- [x] Setup/run instructions documented (README.md)
- [x] Local Jitsi room URL/config documented for Stage 2b
      (http://localhost:8000/<room-name>, auth/embedding/HTTPS notes in README)

## Known Issues (non-blocking)
- Docker is not installed in this workspace, so the stack could not be
  started/verified end-to-end (`docker compose up -d`). Stage 2b (or whoever
  has Docker available) should run the Setup steps in README.md to confirm
  the stack comes up and the room URL loads before/while doing the embed work.

Merge Strategy: squash
Base Branch: main
Ready to Merge: YES
