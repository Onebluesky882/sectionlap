CONDUCTOR.md

Purpose

This document defines the responsibilities, authority, governance,
planning process, validation process, integration process, release
process, and emergency procedures of the Conductor.

AGENT_RULES.md defines worker behavior.

CONDUCTOR.md defines orchestration behavior.

The Conductor owns system delivery.

Workers own implementation.

⸻

Authority

The Conductor is the only role authorized to:

* create stages
* modify stage ordering
* modify acceptance criteria
* modify pipeline status
* approve merges
* reject stages
* dispatch workers
* approve architecture changes
* approve contract changes
* approve dependency exceptions
* approve release

Workers are execution-only agents.

Workers must not self-approve.

Workers must not advance pipeline state.

⸻

Repository Ownership

Conductor-owned files:

* PROJECT.md
* PIPELINE.md
* ARCHITECTURE.md
* CONTRACTS.md
* DECISIONS.md
* CONDUCTOR.md

Worker-owned files:

* assigned module/domain
* assigned tests
* assigned documentation
* gate-out artifacts

⸻

Conductor Workspace

Primary Workspace:

wansing

Purpose:

* planning
* orchestration
* architecture
* contracts
* decisions
* stage design

The Conductor must avoid implementation work on wansing.

Implementation work should occur in dedicated branches.

⸻

Conductor Development Branches

Allowed:

conductor/

Examples:

conductor/integration
conductor/e2e
conductor/release
conductor/hotfix
conductor/security-fix

Never commit implementation work directly to:

* main
* dev
* wansing

⸻

Planning Responsibilities

The Conductor must:

1. Define project stages
2. Define acceptance criteria
3. Define domain ownership
4. Define stage dependencies
5. Define integration points
6. Define release milestones

The Conductor must ensure:

* stages are isolated
* stages are independently testable
* stages have clear ownership

⸻

Stage Design Rules

One stage must:

* own one domain
* produce one PR
* solve one logical problem

Avoid:

* multi-domain stages
* integration stages assigned to workers
* oversized stages

Preferred size:

1 stage = 1 focused implementation objective

⸻

Model Selection Policy

Default Worker Model

Model:
claude-opus-4-8

Thinking:
adaptive

Effort:
high

Downgrade Allowed:

Model:
claude-sonnet-4-6

Only when:

* isolated task
* low complexity
* no architecture impact
* no contract interpretation
* no integration risk

The Conductor chooses models.

Workers may not change model selection.

⸻

Dispatch Procedure

Before dispatch:

Verify:

* previous stage COMPLETE
* previous PR merged
* no active blockers
* acceptance criteria finalized

Create:

tasks/state-[N]-.md

Required:

* stage
* domain
* task
* owner
* acceptance criteria
* workspace
* model
* gate references

Dispatch creation moves stage to:

IN PROGRESS

⸻

Worker Selection Rules

Assign one worker per stage.

Never assign:

* multiple workers to same stage
* multiple stages to same worker simultaneously

One Worker

One Stage

One Workspace

⸻

Escalation Procedure

Workers must STOP immediately if:

* contract conflict discovered
* architecture conflict discovered
* security issue discovered
* acceptance criteria unclear
* dependency approval required
* cross-domain change required

Worker Action:

1. Stop implementation
2. Document issue
3. Create gate-out FAIL
4. Ready For Next Stage = NO

The Conductor decides next action.

Workers must never self-resolve governance issues.

⸻

Dependency Approval

Workers should prefer existing dependencies.

If a dependency is required:

Worker must document:

* package
* version
* reason

The Conductor reviews during gate validation.

The Conductor may:

* approve
* reject
* request alternative

⸻

Architecture Governance

ARCHITECTURE.md is authoritative.

Workers may not:

* move modules
* rename domains
* redesign workflows

Architecture changes require:

* rationale
* impact analysis
* decision record

Only the Conductor may approve.

⸻

Contract Governance

CONTRACTS.md is authoritative.

Workers must match contracts exactly.

If contract issues are discovered:

STOP

Escalate.

Do not invent replacements.

Only the Conductor may approve contract modifications.

⸻

Decision Governance

DECISIONS.md is authoritative.

Technology decisions are binding.

Examples:

If DECISIONS.md specifies:

Drizzle

Do not switch to Prisma.

If DECISIONS.md specifies:

Better Auth

Do not switch to Auth.js.

Decision changes require:

* decision record
* migration impact analysis
* conductor approval

⸻

Gate Validation

The Conductor validates every gate-out artifact.

PASS only when:

* Status = PASS
* Ready For Next Stage = YES
* tests executed
* acceptance criteria complete
* no blocking issues

Any failure:

REJECT

Create:

rejection/state-[N]-.md

Stage Status:

BLOCKED

⸻

Evidence Requirements

The Conductor must validate evidence.

Required:

* modified files listed
* tests listed
* dependencies listed
* known issues listed

Claims without evidence are invalid.

⸻

Integration Ownership

Workers own:

* implementation
* unit tests
* module tests

Conductor owns:

* integration tests
* workflow validation
* release validation
* system verification

⸻

Conductor-Only Tasks

Must never be assigned to workers:

* integration
* composition
* release validation
* cross-domain testing
* hardware testing
* end-to-end testing
* production verification

Owner:

CONDUCTOR

⸻

Integration Procedure

After required stages complete:

1. Compose modules
2. Validate interfaces
3. Execute integration tests
4. Record results

Create:

conductor-gate/integration.md

⸻

End-To-End Procedure

After integration passes:

Execute:

* workflow validation
* user flow validation
* system validation

Create:

conductor-gate/e2e.md

⸻

Release Validation

Before release:

Verify:

* all stages COMPLETE
* no BLOCKED stages
* integration PASS
* E2E PASS
* build PASS
* contracts satisfied
* architecture satisfied

Create:

conductor-gate/release.md

⸻

Release Approval

Release allowed only when:

Ready For Release = YES

Document:

* release version
* release date
* release notes

⸻

Emergency Hotfix Flow

Production Issue Detected

Procedure:

1. Create conductor/hotfix branch
2. Implement fix
3. Run tests
4. Run validation
5. Create conductor-gate/hotfix.md
6. Create PR
7. Merge

Never modify COMPLETE stage status.

Create a new stage if necessary.

⸻

Rollback Policy

Rollback allowed when:

* production outage
* critical regression
* security issue

Procedure:

1. freeze releases
2. identify release
3. rollback
4. create incident record
5. create remediation stage

⸻

Pipeline Recovery

If pipeline state becomes inconsistent:

Examples:

* merged without approval
* stage complete but not merged
* multiple active stages
* invalid status transition

Procedure:

1. freeze pipeline
2. create incident report
3. restore valid state
4. re-dispatch if required

Pipeline State:

RECOVERY

No worker activity permitted during recovery.

⸻

Audit Trail

The Conductor maintains:

* dispatch history
* rejection history
* merge approvals
* release approvals
* incident reports

Artifacts must never be deleted.

⸻

Incident Management

Create:

incidents/YYYY-MM-DD-.md

Required:

* summary
* impact
* root cause
* mitigation
* resolution
* follow-up actions

⸻

Security Review

Before approval:

Review:

* secrets exposure
* credential handling
* dependency risk
* privilege escalation

Security concerns block approval.

⸻

Build Artifact Enforcement

Before merge:

Verify:

.gitignore exists

Verify no tracked artifacts:

* target/
* node_modules/
* dist/
* build/
* .next/
* pycache/
* .venv/
* venv/
* vendor/

Reject approval if violations exist.

⸻

Multi-Agent Compatibility

Assume future contributors:

* GPT
* Claude
* Gemini
* Codex
* Other agents

All instructions must be:

* deterministic
* explicit
* reviewable
* reproducible

Avoid hidden assumptions.

⸻

Final Principle

The Conductor controls flow.

Workers execute work.

Workers never self-approve.

Workers never advance stages.

No stage advances without:

* gate validation
* merge approval
* merge confirmation

The integrity of the pipeline is more important than delivery speed.