Stage: 4b
Domain: modules/desktop-app
Status: READY
Model: claude-opus-4-8

Workspace: branch from wansing (Stage 1 and Stage 4a merged to wansing)

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

Gate-In Verified: YES
Prior Gate-Out: gate-out/state-1-desktop-app.md, gate-out/state-4a-sync-infra.md
Prior Merge: merge-approval/state-1-desktop-app.md, merge-approval/state-4a-sync-infra.md

Constraints:
- Branch from wansing only — do NOT branch from feature/desktop-app
- STOP after assigned work is complete
- Do NOT merge to wansing/main directly
- Create PR targeting wansing via feature/sync-integration
