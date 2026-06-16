AGENT_RULES.md

Purpose

This repository uses a multi-agent workflow.

Every agent is a worker, not the owner of the project.

Governance files are controlled exclusively by the Conductor and Dev.
See GOVERNANCE_CORE.md for the full ownership table.

Agents implement assigned work only.

⸻

Conductor Identity

The Dev and Conductor AI act together on branch `wansing`.

* `wansing` = Conductor's workspace (planning, architecture, dispatch)
* 1 stage = 1 workspace (branch) = 1 PR
* Conductor does not implement stage work on `wansing`

See CONDUCTOR.md for the full orchestration behavior definition.
See DEV.md for Dev authority and override rules.

⸻

Conductor / Orchestrator

Model Configuration

See CONDUCTOR.md → "Model Selection Policy" for Conductor and worker model
configuration. Workers may not change model selection.

⸻

Conductor Flow

The Conductor validates gate-out, updates PIPELINE.md, writes
merge-approval, waits for PR merge, then dispatches the next stage.

See CONDUCTOR.md → "Dispatch Procedure" and "Gate Validation" for the
full Conductor-side process.

Gate Validation Rules (worker perspective)

A stage PASSES when ALL are true:

* gate-out.md Status = PASS
* gate-out.md Ready For Next Stage = YES
* All acceptance criteria in PIPELINE.md checked off
* No Known Issues blocking the next stage

If any check fails → Status = REJECT. Do not advance.

⸻

Pipeline State Rules

Valid stage states:

PENDING       Waiting for prior stage to complete
IN PROGRESS   Dispatch-in written — worker actively working
COMPLETE      Gate-out PASS + PR merged — immutable
BLOCKED       Gate-out FAIL or validation rejected

Only the Conductor may update stage Status in PIPELINE.md.
Workers must NOT write to PIPELINE.md.

State Transitions

PENDING → IN PROGRESS   Conductor writes tasks/state-[N]-<domain>.md
IN PROGRESS → COMPLETE  Gate-out PASS + PR squash-merged to main
IN PROGRESS → BLOCKED   Gate-out FAIL or gate criteria not met
BLOCKED → IN PROGRESS   Dev resolves issue; Conductor re-dispatches

COMPLETE stages are immutable. No agent may modify a COMPLETE stage's
domain files or revert its status. If a bug is found: create a new stage.

Gate Artifact → State Mapping

dispatch-in written      →  IN PROGRESS
gate-out Status = PASS   →  eligible for COMPLETE
gate-out Status = FAIL   →  BLOCKED
merge-approval written   →  PR ready to merge
PR merged to main        →  COMPLETE confirmed

⸻

Conductor Output Formats

See CONDUCTOR.md → "Dispatch Procedure" for the dispatch-in.md format
(conductor writes, workers receive).

merge-approval/state-[N]-<domain>.md format (conductor writes):

Stage: [N]
Domain: [module/domain]
Branch: feature/[domain]
Status: APPROVED
PR Title: feat([domain]): [one-line description]
Merge Strategy: squash
Base Branch: main
Ready to Merge: YES

⸻

Required Reading

See START_HERE.md → "Required Reading Order" for the full, authoritative
list and order of files to read before starting any task.

Do not begin implementation before understanding these files.

⸻

Conductor-Only Tasks

Some tasks must never be assigned to a worker:

* integration / composition across multiple stages
* end-to-end or cross-module testing
* direct interaction with physical hardware (camera, mic, speaker, sensors)
* any verification spanning more than one stage's domain

Mark such tasks in PIPELINE.md and dispatch-in.md as `Owner: CONDUCTOR`.
Never dispatch `Owner: CONDUCTOR` tasks to workers.

If a worker discovers their task requires hardware or cross-stage
integration: STOP and report it in gate-out.md → Known Issues.

The Conductor also owns: integration tests, workflow validation, release
validation, and system verification.

⸻

Worker Scope (1 Job = 1 Stage = 1 Workspace)

Each worker:

* Owns exactly one stage, one branch/workspace, one domain
* Works ONLY on the task in tasks/state-[N]-<domain>.md
* Must NOT pick up or test work belonging to other stages
* Must NOT perform integration testing across modules

⸻

Domain Ownership

Each stage owns only its assigned domain (modules/[assigned-name]).

Do not modify another stage's domain.

⸻

Allowed Changes

You may:

* Create files inside your assigned domain
* Modify files inside your assigned domain
* Add tests for your assigned domain
* Update documentation for your assigned domain

You may NOT:

* Modify completed stages
* Rewrite architecture
* Change contracts
* Change database schema without explicit instruction
* Change public APIs without approval

⸻

Contract Compliance

CONTRACTS.md is the source of truth.

Input and output types must match contracts exactly.

If a contract appears incorrect: STOP. Report the issue. Do not invent a
new contract.

⸻

Dependency Rules

Prefer existing dependencies.

Do not add new dependencies unless required.

If adding a dependency, document in gate-out.md:

* package name
* version
* reason

See DECISIONS.md 011 for the full dependency governance rule.

⸻

File Ownership

Agent must report all modified files in gate-out.md.

⸻

Branch Rules

Agent branches must use the prefix:

feature/[domain]

Never merge directly into: dev / main / wansing

Create PR only.

⸻

Main Branch Merge Authority

Only the Dev may execute the PR merge into `main`.

Agents may: create PRs, validate gates, write merge-approval marking "Ready
to Merge: YES".

Agents may NOT: run `git merge`/`git push` to `main`, or create/rename/
delete/re-point the `main` branch.

See DEV.md → "Branch Authority" for the full rule.

⸻

Testing Rules

Run relevant tests before completion.

Required:

* unit tests
* build verification

If tests cannot run: explain why. Never claim tests passed without execution.

⸻

Error Handling

Never panic intentionally.

Return structured errors:

{ "error": "descriptive message" }

Applications must fail gracefully.

⸻

Architecture Rules

Follow ARCHITECTURE.md.

Do not move modules, rename domains, or redesign workflows unless
explicitly instructed.

⸻

Decision Rules

DECISIONS.md is authoritative and binding for all technology choices.

Do not substitute or replace any approved technology without explicit
Conductor approval. See DECISIONS.md for the full approved/prohibited list.

⸻

Stage Completion

When work is complete, create:

gate-out/state-[N]-<domain>.md

Format:

Status: PASS | FAIL
Stage:
Domain:
Summary:
Modified Files:
* file1
* file2
Dependencies Added:
* none | package@version — reason
Tests:
* test_a
Known Issues:
* none
Recommendations:
* optional
Ready For Next Stage: YES | NO

⸻

Stop Condition

After completing assigned work: STOP.

Do not continue to the next stage.

Do not implement future stages.

Wait for Conductor confirmation.

⸻

Multi-Model Compatibility

Write code and documentation that is deterministic, explicit, easy to
merge, and easy to review. Avoid hidden assumptions. Future contributors
may be GPT, Gemini, Codex, or other agents.

⸻

Merge Optimization

Prefer small focused commits. One stage = one logical PR. Keep changes
isolated to the assigned domain.

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

1. Verify .gitignore exists in the repo root
2. Run: git ls-files target/ node_modules/ dist/ build/ .next/ __pycache__/ .venv/ venv/ vendor/
   If any are tracked, remove before pushing:
   git rm -r --cached <dir> && git commit -m "chore: remove tracked build artifacts"
3. If .gitignore is missing: STOP. Create it first, then push.

⸻

Roadmap Protection

ROADMAP.md is read-only for workers. Do not modify, update status, add or
remove milestones. Only the Conductor may modify ROADMAP.md.

⸻

Technology Stack Authority

DECISIONS.md is the authoritative source for all technology decisions.
Workers must follow all approved technologies. Any deviation fails gate
validation (Status: FAIL / Ready For Next Stage: NO).

If a required technology is not defined in DECISIONS.md: STOP and request
Conductor clarification before implementation.

⸻

Technology Freshness Compliance

Use the latest stable version of all approved technologies unless
DECISIONS.md explicitly specifies a required version.

Do not use deprecated, unsupported, end-of-life, or archived releases.

When bootstrapping a new project, use the latest official generator/scaffold.

If the latest stable version is incompatible with an approved dependency:
STOP. Report as "Version Conflict" and wait for Conductor guidance.

Technology freshness non-compliance fails gate validation (Status: FAIL /
Ready For Next Stage: NO).
