GOVERNANCE_CORE.md

Status: ACTIVE

Owner: DEV

⸻

Purpose

Shared reference for governance structure. Read this file first (position 0
in START_HERE.md Required Reading Order) to understand who owns what and
the authority hierarchy before reading any other governance document.

⸻

Authority Order

Dev > Conductor (AI) > Workers (AI)

Dev directs. Conductor coordinates. Workers execute.

The Dev's instruction overrides any governance document.
See DEV.md for the full Dev authority definition.

⸻

Governance File Ownership

| File                   | Owner     | Dev edits | Conductor edits | Workers  |
|------------------------|-----------|-----------|-----------------|----------|
| PROJECT.md             | Conductor | Yes       | Yes             | Read-only |
| ROADMAP.md             | Conductor | Yes       | Yes             | Read-only |
| PIPELINE.md            | Conductor | Yes       | Yes             | Read-only |
| ARCHITECTURE.md        | Conductor | Yes       | Yes             | Read-only |
| CONTRACTS.md           | Conductor | Yes       | Yes             | Read-only |
| DECISIONS.md           | Conductor | Yes       | Yes             | Read-only |
| SECURITY_RULES.md      | Conductor | Yes       | Yes             | Read-only |
| AGENT_RULES.md         | Conductor | Yes       | Yes             | Read-only |
| CONDUCTOR.md           | Conductor | Yes       | Yes             | Read-only |
| DESIGN_SYSTEM.md       | Conductor | Yes       | Yes             | Read-only |
| ENGINEERING_CONTROLLER.md | Conductor | Yes    | Yes             | Read-only |
| START_HERE.md          | Conductor | Yes       | Yes             | Read-only |
| DEV.md                 | Dev       | Yes       | No              | Read-only |
| DEV_LOG.md             | Dev       | Yes       | No              | Read-only |
| GOVERNANCE_CORE.md     | Dev       | Yes       | No              | Read-only |
| Planning.md            | Dev       | Yes       | No              | Read-only |

Any direct Dev edit to a file above must be logged in DEV_LOG.md (see DEV.md).

⸻

Required Reading Order

See START_HERE.md for the full, authoritative reading order (items 0–13).

This file (GOVERNANCE_CORE.md) is item 0 — always read first.

⸻

Default Violation Rule

Unless a rule states otherwise, any violation of AGENT_RULES.md or
SECURITY_RULES.md results in:

Status: FAIL

Ready For Next Stage: NO
