DEV.md

Status: ACTIVE

Owner: DEV

⸻

Purpose

This document defines the Dev's role, authority, and operating rules within
this project. The Dev is the human who owns the project and has final
authority over all decisions, directions, and branch operations.

⸻

Dev Identity

The Dev operates on the `wansing` branch as the Conductor.

The Dev is a human — not an AI agent.

⸻

Authority Order

Dev > Conductor (AI) > Workers (AI)

The Dev's direction overrides any Conductor or Worker decision.

If a governance document conflicts with a direct Dev instruction:

The Dev's instruction wins.

The governance document must be updated to match.

⸻

Dev Capabilities

The Dev may:

* edit any governance file directly (PROJECT.md, ROADMAP.md, PIPELINE.md,
  ARCHITECTURE.md, CONTRACTS.md, DECISIONS.md, SECURITY_RULES.md,
  AGENT_RULES.md, CONDUCTOR.md, DESIGN_SYSTEM.md, ENGINEERING_CONTROLLER.md,
  START_HERE.md, DEV.md, DEV_LOG.md, GOVERNANCE_CORE.md)
* override any Conductor or Worker decision
* determine overall flow, execution order, tool/library selection, and
  document format/style
* dispatch or cancel stages
* approve or reject PRs
* perform the final merge into `main`

The Dev is the only person who may merge into `main`.

⸻

Dev Direct Edit Rule

Any direct Dev edit to a governance file must be logged in DEV_LOG.md.

Required log fields:

* date
* file(s) changed
* what changed
* why
* impact on workers (if any)

Workers must read DEV_LOG.md for unread entries before starting assigned work.

DEV_LOG.md is append-only. Past entries must never be edited or removed.

⸻

Dev Direction Authority

Workers and the Conductor AI must follow the Dev's direction on:

* overall flow and execution order
* tool and library selection
* file/document writing format and style
* stage scope and acceptance criteria

Do not:

* choose alternative tools or libraries without Dev approval
* deviate from the Dev's specified flow or format
* rewrite documents in a different style than instructed

⸻

Branch Authority

The Dev owns the `wansing` branch — the Conductor's planning and
integration workspace.

Only the Dev may merge `wansing` into `main`.

Agents may create PRs targeting `main` and mark them "Ready to Merge: YES".
The Dev performs the actual merge.

Agents may NOT create, rename, delete, or re-point the `main` branch.

See AGENT_RULES.md "Main Branch Merge Authority" for the full worker-facing rule.

⸻

Final Authority

The Dev is the ultimate authority for this project.

No governance document, Conductor decision, or pipeline rule overrides a
direct Dev instruction.

If the Dev's direction is unclear: the Conductor AI must ask before
proceeding. Do not assume.
