Stage: 4b
Domain: modules/desktop-app
Status: PENDING
Model: claude-opus-4-8

Workspace: branch from main (after Stage 1 and Stage 4a merged)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage 4b)
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md

Task:
Integrate the Wails app as a client of the sync service built in Stage 4a,
using its documented protocol. Make the whiteboard and document-highlight
features usable from within the Wails app.

Gate-In Verified: NO
Prior Gate-Out: tasks/state-1-desktop-app-gate-out.md, tasks/state-4a-sync-infra-gate-out.md (pending)
Prior Merge: tasks/state-1-desktop-app-merge-approval.md, tasks/state-4a-sync-infra-merge-approval.md (pending)

Constraints:
- Branch from main only — do NOT branch from feature/desktop-app
- STOP after assigned work is complete
- Do NOT merge to dev/main directly
- Create PR targeting main via feature/sync-integration
