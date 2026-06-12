# Multi-Agent AI Template

A starter template for running a project with a **Conductor / Worker** multi-agent
workflow. The conductor (orchestrator) owns the roadmap and gates; each worker
agent owns exactly one pipeline stage, in its own branch, producing one PR.

## Files

| File | Owner | Purpose |
|------|-------|---------|
| `PROJECT.md` | Conductor | Project goal, tech stack, status |
| `ARCHITECTURE.md` | Conductor | System architecture, modules, constraints |
| `CONTRACTS.md` | Conductor | Public interfaces between modules |
| `DECISIONS.md` | Conductor | Authoritative architectural decisions |
| `PIPELINE.md` | Conductor | Stage list, status, acceptance criteria |
| `AGENT_RULES.md` | Conductor | Full workflow rules for all agents |
| `START_HERE.md` | Worker | Onboarding instructions for worker agents |
| `CLAUDE.md` | All agents | Project-level instructions loaded automatically |
| `tasks/stage-[N]/` | Conductor/Worker | Per-stage dispatch and gate artifacts |
| `docs/adrs/` | Conductor/Worker | Architecture Decision Records |

## Setup (before starting any stage)

1. Fill in `PROJECT.md` — name, goal, tech stack, status.
2. Fill in `ARCHITECTURE.md` — modules, data flow, constraints.
3. Fill in `CONTRACTS.md` — input/output contracts for each module.
4. Fill in `DECISIONS.md` — any decisions agents must follow (libraries, frameworks, etc.).
5. Define stages in `PIPELINE.md` — one row per stage, with domain and acceptance criteria.
6. Replace the `[name]` placeholders in `AGENT_RULES.md` (Domain Ownership,
   Branch Rules, File Ownership) with your actual module names.

## Running a stage (Conductor)

1. Write `tasks/stage-[N]/dispatch-in.md` with:
   - Stage number, domain, model
   - Context files to read
   - Task description
   - `Gate-In Verified: YES`
2. Set the stage's `Status: IN PROGRESS` in `PIPELINE.md`.
3. Dispatch the worker agent.

## Running a stage (Worker)

1. Read `START_HERE.md`.
2. Read, in order: `PROJECT.md` → `ARCHITECTURE.md` → `CONTRACTS.md` →
   `DECISIONS.md` → `PIPELINE.md` → `AGENT_RULES.md`.
3. Find your stage (`Status: IN PROGRESS`) and confirm `dispatch-in.md`
   exists with `Gate-In Verified: YES`. If not, STOP and report
   `BLOCKED: WAITING_FOR_GATE_IN`.
4. Implement only what's in your assigned domain. Create a branch
   `feature/[domain]`.
5. Run tests and build verification.
6. Write `tasks/stage-[N]/gate-out.md` with status, modified files,
   tests run, acceptance criteria, known issues, and
   `Ready For Next Stage: YES|NO`.
7. STOP. Do not merge, do not start the next stage.

## Gate validation (Conductor)

1. Read `tasks/stage-[N]/gate-out.md`.
2. PASS only if: `Status: PASS`, `Ready For Next Stage: YES`, all
   acceptance criteria checked, no blocking known issues.
3. On REJECT: write `tasks/stage-[N]/rejection.md` and halt.
4. On PASS:
   - Update `PIPELINE.md` — Stage `[N]` → `COMPLETE`.
   - Write `tasks/stage-[N]/merge-approval.md`.
   - After the PR is squash-merged to `main`, update `PIPELINE.md` —
     Stage `[N+1]` → `IN PROGRESS`.
   - Write `tasks/stage-[N+1]/dispatch-in.md`.

## Conductor-only work

Some tasks (cross-stage integration, end-to-end tests, hardware access)
must never be dispatched to a worker. Mark these `Owner: CONDUCTOR` in
`PIPELINE.md` and `dispatch-in.md` — see the "Conductor-Only Tasks" section
of `AGENT_RULES.md`.

## ADRs

Before creating a new ADR, run:

```bash
ls docs/adrs/ | sort | tail -3
```

Take the highest number, add 1, and name the file `NNN-short-slug.md`
with a matching `# ADR NNN — Title` header. See the "ADR Numbering"
section of `CLAUDE.md`.

## Key rules at a glance

- One stage = one branch = one PR = one merge into `main`.
- A `COMPLETE` stage is immutable — bugs become new stages, not edits.
- Workers never touch `PIPELINE.md`, `CONTRACTS.md`, `DECISIONS.md`, or
  `ARCHITECTURE.md`.
- Never push build artifact directories (`target/`, `node_modules/`,
  `dist/`, `build/`, `.next/`, `__pycache__/`, `.venv/`, `vendor/`, ...) —
  see `.gitignore` and the "Git & Build Artifacts" section of
  `AGENT_RULES.md`.

For the full rule set, read `AGENT_RULES.md`.
