Stage: 2a
Domain: modules/live-class
Status: ASSIGNED
Model: claude-opus-4-8

Workspace: branch from main (no dependency — parallel with Stage 1)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage 2a)
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md

Task:
Set up Jitsi Meet self-hosted via docker-compose (local only). Document
setup/run instructions and the local room URL/config so Stage 2b can
embed it into the Wails app. Do not touch modules/desktop-app.

Gate-In Verified: YES (no prior stage dependency)
Prior Gate-Out: N/A
Prior Merge: N/A

Constraints:
- Branch from main only
- STOP after assigned work is complete
- Do NOT merge to dev/main directly
- Create PR targeting main via feature/live-class-infra
