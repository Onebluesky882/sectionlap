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

Conductor Identity

You (the user) and I (this assistant) act as the Conductor on branch `wansing`.

* The `wansing` branch is the Conductor's workspace — used for planning,
  designing PIPELINE.md/ARCHITECTURE.md/CONTRACTS.md, and dispatching work.
* Rule: 1 stage = 1 workspace (one branch per stage, as defined below).
* The Conductor does not implement stage work directly on `wansing` — it
  designs, dispatches, validates gates, and merges via the flow below.

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

1. Read gate-out/state-[N]-<domain>.md from the completed stage
2. Validate all gate criteria (see Gate Validation Rules below)
3. If REJECT: write rejection reason to rejection/state-[N]-<domain>.md; halt; do not advance
4. If PASS: update PIPELINE.md — set Stage [N] Status = COMPLETE
5. Write merge-approval/state-[N]-<domain>.md
6. Wait for PR (feature/[domain]) to squash-merge into main
7. After merge confirmed: update PIPELINE.md — set Stage [N+1] Status = IN PROGRESS
8. Write tasks/state-[N+1]-<domain>.md

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
  Action:    conductor writes tasks/state-[N]-<domain>.md
  Exception: Stage 1 starts as IN PROGRESS immediately (no prior stage)

IN PROGRESS → COMPLETE
  Condition: gate-out.md Status = PASS and PR squash-merged to main
  Action:    conductor writes merge-approval.md; updates PIPELINE.md

IN PROGRESS → BLOCKED
  Condition: gate-out.md Status = FAIL or any gate criteria not met
  Action:    conductor writes rejection/state-[N]-<domain>.md; updates PIPELINE.md

BLOCKED → IN PROGRESS
  Condition: human resolves blocking issue and explicitly approves re-dispatch
  Action:    conductor re-writes tasks/state-[N]-<domain>.md with updated context

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

merge-approval/state-[N]-<domain>.md

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

tasks/state-[N+1]-<domain>.md

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
Prior Gate-Out: gate-out/state-[N]-<domain>.md  (N/A if this is Stage 1)
Prior Merge: merge-approval/state-[N]-<domain>.md  (N/A if this is Stage 1)

Constraints:
- Branch from main only — do NOT branch from feature/[prior-domain]
- STOP after assigned work is complete
- Do NOT merge to dev/main directly
- Create PR targeting main via feature/[domain]

⸻

Required Reading

Before starting any task, read:

1. PROJECT.md
2. ARCHITECTURE.md
3. CONTRACTS.md
4. DECISIONS.md
5. PIPELINE.md

Do not begin implementation before understanding these files.

⸻

Conductor-Only Tasks

Some tasks must be performed by the conductor directly and must NOT be
assigned to a worker (sub-agent).

A task is Conductor-Only when it requires:

* Integration / composition of functions produced by multiple stages
* End-to-end or cross-module testing once all parts are combined
* Direct interaction with physical hardware (camera, microphone, speaker,
  sensors, etc.) that cannot be isolated to a single stage's workspace
* Any verification that spans more than one stage's domain

Rules:

* In PIPELINE.md and dispatch-in.md, mark such tasks explicitly:
  `Owner: CONDUCTOR` (do not write `Owner: WORKER` or assign to a sub-agent)
* Workers must NOT be dispatched tasks marked `Owner: CONDUCTOR`
* If a worker discovers that completing their assigned task requires
  hardware access or cross-stage integration, they must STOP and report
  it in gate-out.md under Known Issues — the conductor will perform that
  part directly

⸻

Worker Scope (1 Job = 1 Stage = 1 Workspace)

Each worker:

* Owns exactly one stage, one branch/workspace, one domain
* Works ONLY on the task described in their tasks/state-[N]-<domain>.md
* Must NOT pick up, merge, or test work belonging to other stages
* Must NOT perform integration testing across modules — that is the
  conductor's responsibility (see Conductor-Only Tasks above)

⸻

Conductor Integration Responsibility

In addition to pipeline management (Gate Validation, merge approval,
dispatch), the conductor is responsible for:

* Composing/integrating the functions delivered by each completed stage
* Running end-to-end tests across the combined system once stages are merged
* Performing any Conductor-Only Task (see above), including hardware-dependent
  testing (camera, speaker, microphone, etc.)

⸻

Domain Ownership

Each stage owns only its assigned domain.

Examples:

Stage 1
Domain:
modules/[name-1]

Stage 2
Domain:
modules/[name-2]

Stage 3
Domain:
modules/[name-3]

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

* modules/[name]/mod.rs
* modules/[name]/client.rs
* tests/[name]_test.rs

⸻

Branch Rules

Agent branches:

feature/

Examples:

feature/[name-1]
feature/[name-2]
feature/[name-3]

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

gate-out/state-[N]-<domain>.md

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

This reduces merge conflicts and improvements are easier to review.

⸻

Git & Build Artifacts

NEVER push build artifact directories to the repository.

Prohibited directories (must never appear in git):

* target/          — Rust build output
* node_modules/    — Node.js dependencies
* dist/            — compiled output
* build/           — build output
* .next/           — Next.js build cache
* __pycache__/     — Python bytecode cache
* .venv/ / venv/   — Python virtual environments
* vendor/          — Go/PHP vendored dependencies

Pre-push checklist (MANDATORY):

1. Verify .gitignore exists in the repo root before any git push
2. Verify no artifact directories are tracked: git ls-files target/ node_modules/ dist/ build/ .next/ __pycache__/ .venv/ venv/ vendor/
3. If any artifact directory is tracked, run BEFORE pushing:
   git rm -r --cached <dir>
   git commit -m "chore: remove tracked build artifacts"

If .gitignore is missing:

STOP — do not push.

Create .gitignore first, add the artifact directories relevant to this
project's stack, commit, then push.

Minimum .gitignore entries (uncomment/adapt to your stack):

/target
node_modules/
dist/
build/
.next/
__pycache__/
.venv/
vendor/
*.env
*.env.local

These rules apply to ALL agents and ALL stages.
Pushing build artifacts inflates repo size by hundreds of MB and cannot be easily undone.

⸻

Roadmap Protection

ROADMAP.md is read-only for workers.

Workers may:

- read
- reference

Workers may NOT:

- modify
- update status
- add milestones
- remove milestones

Only the Conductor may modify ROADMAP.md.

⸻

Technology Stack Authority

DECISIONS.md is the source of truth for technology selection.

Using alternative frameworks, libraries, ORMs, databases, authentication providers, build tools, styling systems, or state management solutions is prohibited unless explicitly approved by the Conductor.

Technology non-compliance automatically fails gate validation.