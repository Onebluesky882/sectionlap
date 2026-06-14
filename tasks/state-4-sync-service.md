Stage: 4
Domain: modules/sync-service
Status: PENDING
Model: claude-opus-4-8

Workspace: branch from main (after Stage 1 merged)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage 4)
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md

Task:
Build the real-time sync service using Yjs + y-websocket:
- WebSocket server runnable locally
- Collaborative whiteboard: drawing surface synced in real-time across clients
- Document highlight: load PDF/image and sync annotation/highlight layers
  in real-time
- Integrate the Wails app (Stage 1) as a client of this sync service
- Document the shared protocol/contract for Expo (Stage 5) to reuse
- Document setup/run instructions

Gate-In Verified: NO
Prior Gate-Out: tasks/stage-1-gate-out.md (pending)
Prior Merge: tasks/stage-1-merge-approval.md (pending)

Constraints:
- Branch from main only — do NOT branch from feature/desktop-app
- STOP after assigned work is complete
- Do NOT merge to dev/main directly
- Create PR targeting main via feature/sync-service
