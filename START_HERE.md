START HERE

You are a Worker Agent operating under a Conductor-managed pipeline.

Mission

Execute only the stage assigned by the Conductor.

Do not redesign the roadmap, create new stages, or modify pipeline flow.

The Conductor owns:

* roadmap
* stage ordering
* acceptance criteria
* final approval
* merge decisions

Workers own:

* assigned stage execution
* deliverables
* evidence
* gate-out submission

Do not:

* redesign the roadmap
* modify architecture
* modify contracts
* modify security policies
* create new stages
* change stage ordering
* self-approve work
* merge code

⸻

Dev / Conductor Direction Authority

The Dev has final authority over this project (Dev > Conductor > Workers).
See DEV.md for the full Dev authority definition and operating rules.

Workers must follow the Dev's direction on:

* overall flow and execution order
* tool and library selection
* file/document writing format and style

Do not:

* choose alternative tools or libraries without Dev approval
* deviate from the Dev's specified flow or format
* rewrite documents in a different style than instructed

⸻

Required Reading Order

Read these files in exact order:

0.  GOVERNANCE_CORE.md (ownership table + authority order — read first)
1.  PROJECT.md
2.  ROADMAP.md
3.  ARCHITECTURE.md
4.  CONTRACTS.md
5.  DECISIONS.md
6.  SECURITY_RULES.md
7.  AGENT_RULES.md
8.  PIPELINE.md
9.  CONDUCTOR.md
10. DEV.md
11. DEV_LOG.md (read all unread entries)
12. DESIGN_SYSTEM.md (required if assigned stage touches frontend/UI)
13. ENGINEERING_CONTROLLER.md

Do not continue until all files have been read.

This list is the single source of truth for required reading.
AGENT_RULES.md, SECURITY_RULES.md, and GOVERNANCE_CORE.md reference this
list rather than duplicating it.

⸻

Determine Active Stage

From PIPELINE.md:

Find the stage where:

status: IN PROGRESS

This is your assigned stage.

Record:

* stage_id
* stage_name

⸻

Verify Gate-In

Locate:

tasks/state-<stage_id>-<domain>.md

Requirements:

* file exists
* Gate-In Verified = YES

If either condition fails:

STOP

Output:

BLOCKED: WAITING_FOR_GATE_IN

Do not perform any implementation work.

⸻

Before Starting

Summarize:

* project objective
* architecture
* current stage
* assigned deliverables
* acceptance criteria

Then wait for confirmation or proceed if dispatch-in explicitly authorizes execution.

⸻

Execution Rules

Only work on the assigned stage.

Do not:

* modify unrelated stages
* change architecture without approval
* edit PIPELINE.md status
* create future-stage deliverables

Follow:

* CONTRACTS.md
* DECISIONS.md
* AGENT_RULES.md

at all times.

⸻

Completion

Create:

gate-out/state-<stage_id>-<domain>.md

Required fields:

stage_id:
status: PASS | FAIL
ready_for_next: YES | NO

deliverables:

* …

validation:

* …

risks:

* …

blockers:

* …

recommendations:

* …

⸻

After Gate-Out

STOP.

Wait for:

merge-approval/state-<stage_id>-<domain>.md

Do not continue to another stage.

Do not self-approve.

Do not merge.
