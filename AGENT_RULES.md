AGENT_RULES.md

Purpose

This repository uses a multi-agent workflow.

Every agent is a worker, not the owner of the project.

The orchestrator controls:

* PROJECT.md
* PIPELINE.md
* DECISIONS.md
* ARCHITECTURE.md
* CONTRACTS.md

Agents implement assigned work only.

⸻

Conductor / Orchestrator

Model Configuration

```
Model:         claude-opus-4-8
thinking:      { type: "adaptive" }
output_config: { effort: "xhigh" }
```

Use xhigh effort for planning and gate validation decisions.
Use adaptive thinking — the conductor must reason about pipeline state.

Sub-Agent Model Configuration (default)

```
Model:         claude-opus-4-8
thinking:      { type: "adaptive" }
output_config: { effort: "high" }
```

Downgrade to claude-sonnet-4-6 + effort: "high" only for simple,
well-scoped tasks that require no architectural judgment.

⸻

Conductor Flow

Each stage = one workspace (branch) = one PR = one merge into main.

The next stage MUST NOT start until the previous stage is merged into main.
This guarantees each workspace starts clean from main.

Steps:

1. Read tasks/stage-[N]/gate-out.md from the completed stage
2. Validate all gate criteria (see Gate Validation Rules below)
3. If REJECT: write rejection reason to tasks/stage-[N]/rejection.md; halt; do not advance
4. If PASS: update PIPELINE.md — set Stage [N] Status = COMPLETE
5. Write tasks/stage-[N]/merge-approval.md
6. Wait for PR (feature/[domain]) to squash-merge into main
7. After merge confirmed: update PIPELINE.md — set Stage [N+1] Status = IN PROGRESS
8. Write tasks/stage-[N+1]/dispatch-in.md

Gate Validation Rules

PASS only when ALL of the following are true:

* gate-out.md Status = PASS
* gate-out.md Ready For Next Stage = YES
* All acceptance criteria in PIPELINE.md are checked off
* No Known Issues that block the next stage

If any check fails → Status = REJECT. Do not advance.

⸻

Pipeline State Rules

Valid stage states:

PENDING       Stage not yet reached — waiting for prior stage to complete
IN PROGRESS   dispatch-in.md written — sub-agent is actively working
COMPLETE      gate-out PASS + PR merged to main — immutable
BLOCKED       gate-out FAIL or validation rejected — requires resolution

State Transitions

Only the conductor may update stage Status in PIPELINE.md.
Sub-agents must NOT write to PIPELINE.md.

PENDING → IN PROGRESS
  Condition: prior stage Status = COMPLETE and PR merged to main
  Action:    conductor writes tasks/stage-[N]/dispatch-in.md
  Exception: Stage 1 starts as IN PROGRESS immediately (no prior stage)

IN PROGRESS → COMPLETE
  Condition: gate-out.md Status = PASS and PR squash-merged to main
  Action:    conductor writes merge-approval.md; updates PIPELINE.md

IN PROGRESS → BLOCKED
  Condition: gate-out.md Status = FAIL or any gate criteria not met
  Action:    conductor writes tasks/stage-[N]/rejection.md; updates PIPELINE.md

BLOCKED → IN PROGRESS
  Condition: human resolves blocking issue and explicitly approves re-dispatch
  Action:    conductor re-writes tasks/stage-[N]/dispatch-in.md with updated context

Immutability Rules

COMPLETE stages are immutable.

Once a stage is COMPLETE:
* No agent may modify files in that stage's domain
* No agent may re-open or re-run that stage
* PIPELINE.md Status must remain COMPLETE

If a bug is found in a completed stage:
* Create a new stage entry in PIPELINE.md
* Do not revert the COMPLETE status

Gate Artifact → State Mapping

dispatch-in.md written     →  stage becomes IN PROGRESS
gate-out.md Status = PASS  →  stage eligible for COMPLETE
gate-out.md Status = FAIL  →  stage becomes BLOCKED
merge-approval.md written  →  PR ready to merge
PR merged to main          →  stage confirmed COMPLETE

⸻

Conductor Output — merge-approval.md

After gate validation passes, write:

tasks/stage-[N]/merge-approval.md

Format:

Stage: [N]
Domain: [module/domain]
Branch: feature/[domain]
Status: APPROVED

PR Title: feat([domain]): [one-line description]

PR Description:
## What
[What was implemented — from gate-out.md Summary]

## Files Changed
[List from gate-out.md Modified Files]

## Tests
[List from gate-out.md Tests]

## Acceptance Criteria
[Checked list from PIPELINE.md — all must be checked]

Merge Strategy: squash
Base Branch: main
Ready to Merge: YES

⸻

Conductor Output — dispatch-in.md

Only after merge-approval.md is confirmed merged, create:

tasks/stage-[N+1]/dispatch-in.md

Format:

Stage: [N+1]
Domain: [module/domain]
Status: ASSIGNED
Model: claude-opus-4-8

Workspace: branch from main (after stage-[N] merged)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage [N+1])
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md

Task:
[Clear description of what the agent must implement]

Gate-In Verified: YES
Prior Gate-Out: tasks/stage-[N]/gate-out.md  (N/A if this is Stage 1)
Prior Merge: tasks/stage-[N]/merge-approval.md  (N/A if this is Stage 1)

Constraints:
- Branch from main only — do NOT branch from feature/[prior-domain]
- STOP after assigned work is complete
- Do NOT merge to dev/main directly
- Create PR targeting main via feature/[domain]

⸻

Required Reading

Before starting any task, read:

1. PROJECT.md
2. PIPELINE.md
3. ARCHITECTURE.md
4. CONTRACTS.md
5. DECISIONS.md

Do not begin implementation before understanding these files.

⸻

Domain Ownership

Each stage owns only its assigned domain.

Examples:

Stage 1
Domain:
modules/hotkey

Stage 2
Domain:
modules/audio

Stage 3
Domain:
modules/vad

Stage 4
Domain:
modules/transcribe

Stage 5
Domain:
modules/clipboard

Do not modify another stage’s implementation.

⸻

Allowed Changes

You may:

* Create files inside your assigned domain
* Modify files inside your assigned domain
* Add tests for your assigned domain
* Update documentation for your assigned domain

You may NOT:

* Modify confirmed stages
* Rewrite architecture
* Change contracts
* Change database schema without explicit instruction
* Change public APIs without approval

⸻

Contract Compliance

CONTRACTS.md is the source of truth.

Input types and output types must match contracts exactly.

If a contract appears incorrect:

STOP

Report the issue.

Do not invent a new contract.

⸻

Dependency Rules

Prefer existing dependencies.

Do not add new dependencies unless required.

If adding a dependency:

Document:

* package name
* version
* reason

inside gate-out.md

⸻

File Ownership

Agent must report all modified files.

Example:

Modified Files:

* modules/transcribe/mod.rs
* modules/transcribe/client.rs
* tests/transcribe_test.rs

⸻

Branch Rules

Agent branches:

feature/

Examples:

feature/hotkey
feature/audio
feature/vad
feature/transcribe
feature/clipboard

Never merge directly into:

* dev
* main

Create PR only.

⸻

Testing Rules

Run relevant tests before completion.

Required:

* unit tests
* build verification

If tests cannot run:

Explain why.

Never claim tests passed without execution.

⸻

Error Handling

Never panic intentionally.

Return structured errors.

Example:

{
“error”: “timeout contacting whisper api”
}

Applications must fail gracefully.

⸻

Architecture Rules

Follow ARCHITECTURE.md.

Do not:

* move modules
* rename domains
* redesign workflow

unless explicitly instructed.

⸻

Decision Rules

DECISIONS.md is authoritative.

If DECISIONS.md says:

Use Drizzle

Do not switch to Prisma.

If DECISIONS.md says:

Use Better Auth

Do not switch to Auth.js.

⸻

Stage Completion

When work is complete, create:

tasks/stage-[N]/gate-out.md

Replace [N] with your assigned stage number from dispatch-in.md.

Format:

Status:
PASS | FAIL

Stage:
Domain:
Summary:
Modified Files:

* file1
* file2

Dependencies Added:

* none

Tests:

* test_a
* test_b

Acceptance Criteria:

* Requirement 1
* Requirement 2

Known Issues:

* none

Recommendations:

* optional

Ready For Next Stage:
YES | NO

⸻

Stop Condition

After completing assigned work:

STOP

Do not continue to the next stage.

Do not implement future stages.

Wait for orchestrator confirmation.

⸻

Multi-Model Compatibility

Assume future contributors may include:

* GPT
* Claude
* Gemini
* Codex
* Other agents

Write code and documentation that is:

* deterministic
* explicit
* easy to merge
* easy to review

Avoid hidden assumptions.

⸻

Merge Optimization

Prefer:

small focused commits

Avoid:

large refactors

One stage should produce one logical PR.

Keep changes isolated to the assigned domain.

This reduces merge conflicts and imp