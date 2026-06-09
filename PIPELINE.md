# PIPELINE.md

## Stages

| Stage | Domain | Status |
|-------|--------|--------|
| 1 | [module name] | PENDING |
| 2 | [module name] | PENDING |

⸻

## Stage Detail

### Stage 1 — [Name]

**Domain:** modules/[name]
**Agent:** [assigned agent]
**Status:** PENDING | IN PROGRESS | COMPLETE | BLOCKED

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Gate-In Requirements:**
<!-- What must be true before this stage can start -->

**Dispatch-In:** `tasks/stage-1/dispatch-in.md`
<!-- Conductor writes this AFTER prior stage merges to main -->

**Gate-Out:** `tasks/stage-1/gate-out.md`
<!-- Agent writes this when stage is complete -->

**Merge-Approval:** `tasks/stage-1/merge-approval.md`
<!-- Conductor writes this after gate validation passes; triggers PR merge -->

⸻

<!-- Repeat for each stage -->
