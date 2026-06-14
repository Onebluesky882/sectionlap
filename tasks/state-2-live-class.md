Stage: 2
Domain: modules/live-class
Status: PENDING
Model: claude-opus-4-8

Workspace: branch from main (after Stage 1 merged)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage 2)
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md

Task:
Set up Jitsi Meet self-hosted via docker-compose (local) and add a
"Live Class" screen to the Wails app that embeds a local Jitsi room
(webview/iframe). Verify join/leave with mic/cam from within the app.
Document setup/run instructions.

Gate-In Verified: NO
Prior Gate-Out: tasks/stage-1-gate-out.md (pending)
Prior Merge: tasks/stage-1-merge-approval.md (pending)

Constraints:
- Branch from main only — do NOT branch from feature/desktop-app
- STOP after assigned work is complete
- Do NOT merge to dev/main directly
- Create PR targeting main via feature/live-class
