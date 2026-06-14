Stage: 1
Domain: modules/desktop-app
Status: ASSIGNED
Model: claude-opus-4-8

Workspace: branch from main (Stage 1 starts immediately, no prior stage)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage 1)
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md

Task:
Build the Wails desktop app shell (Windows + macOS) for SectionLap using
local mock JSON data only — no backend/db, no API calls.

Screens required:
1. Section list — browse available sections (mock list of sections, each
   with title, description, price, teacher name)
2. Section detail — view full info for one section
3. Booking/checkout screen — UI only, simulate "Book" / "Pay" action
   (no real payment processing)
4. Teacher dashboard — list/post/edit sections (writes to local mock data)

All data must live in local mock JSON / in-memory state. Do not implement
booking/payment/enrollment business logic yet (that is Stage 3) — this
stage is UI/UX scaffolding only.

Gate-In Verified: YES
Prior Gate-Out: N/A (Stage 1)
Prior Merge: N/A (Stage 1)

Constraints:
- Branch from main only
- STOP after assigned work is complete
- Do NOT merge to dev/main directly
- Create PR targeting main via feature/desktop-app
