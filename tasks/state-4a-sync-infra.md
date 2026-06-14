Stage: 4a
Domain: modules/sync-service
Status: ASSIGNED
Model: claude-opus-4-8

Workspace: branch from main (no dependency — parallel with Stage 1)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage 4a)
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md

Task:
Build the real-time sync service using Yjs + y-websocket:
- WebSocket server runnable locally
- Collaborative whiteboard: drawing surface synced in real-time across clients
- Document highlight: load PDF/image and sync annotation/highlight layers
  in real-time
- Document the shared protocol/contract for Wails (Stage 4b) and Expo
  (Stage 5) to reuse
- Document setup/run instructions

Do not touch modules/desktop-app or modules/mobile-app — this stage is
the standalone sync server only.

Gate-In Verified: YES (no prior stage dependency)
Prior Gate-Out: N/A
Prior Merge: N/A

Constraints:
- Branch from main only
- STOP after assigned work is complete
- Do NOT merge to dev/main directly
- Create PR targeting main via feature/sync-service-infra
