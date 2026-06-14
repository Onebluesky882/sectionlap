Stage: 2b
Domain: modules/desktop-app
Status: PENDING
Model: claude-opus-4-8

Workspace: branch from main (after Stage 1 and Stage 2a merged)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage 2b)
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md

Task:
Add a "Live Class" screen to the Wails app that embeds the local Jitsi
room set up in Stage 2a (webview/iframe). Verify join/leave with mic/cam
from within the app.

Gate-In Verified: NO
Prior Gate-Out: tasks/stage-1-gate-out.md, tasks/stage-2a-gate-out.md (pending)
Prior Merge: tasks/stage-1-merge-approval.md, tasks/stage-2a-merge-approval.md (pending)

Constraints:
- Branch from main only — do NOT branch from feature/desktop-app
- STOP after assigned work is complete
- Do NOT merge to dev/main directly
- Create PR targeting main via feature/live-class-embed
