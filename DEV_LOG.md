DEV_LOG.md

Status: ACTIVE

Owner: CONDUCTOR

⸻

Purpose

This document records direct changes made by the dev (acting as Conductor)
on the `wansing` branch to governance/direction documents.

It exists so workers can quickly see what the dev changed and why, without
diffing every governance file.

This log is append-only — do not edit or remove past entries.

Workers must read all unread entries before starting assigned work.

⸻

2026-06-15

Files changed:

* DESIGN_SYSTEM.md
* ENGINEERING_CONTROLLER.md
* START_HERE.md
* ROADMAP.md
* PROJECT.md
* CONDUCTOR.md
* DEV_LOG.md (new)

What changed:

* DESIGN_SYSTEM.md: translated Purpose section to English and reformatted
  to match the multi-agent `.md` convention (plain title, Status/Owner/Scope
  block, `⸻` separators, `*` bullets). Rules unchanged.
* ENGINEERING_CONTROLLER.md: fixed wording inconsistency in Final Authority
  ("Only Conductor" → "Only the Conductor").
* START_HERE.md: added "Dev / Conductor Direction Authority" section —
  dev determines flow, tool/library selection, and writing format; workers
  must follow. Also fixed stale paths (`tasks/<stage_id>/...` →
  `tasks/state-<stage_id>-<domain>.md`, etc.), `IN_PROGRESS` → `IN PROGRESS`,
  and minor formatting issues.
* ROADMAP.md: filled in project-specific content (vision, goals, objectives,
  scope) and added a new "Current Progress (Task Overview)" section
  (Done / In Progress / Next Up) based on PIPELINE.md stage status.
* PROJECT.md: updated "Current Stage" from Stage 1 to Stage 4b to match
  PIPELINE.md.
* CONDUCTOR.md: fixed `tasks/state-[N]-.md` and `rejection/state-[N]-.md`
  to include `<domain>` placeholder; added this "Dev Direct Change Log"
  section requiring DEV_LOG.md.

Why:

Bring governance docs up to date with actual project status (Stage 4b
in progress) and align formatting/paths across all `.md` files per the
multi-agent convention. Establish a single place workers can check for
dev-made changes to direction/format.

Impact on workers:

* No change to assigned stage work or acceptance criteria.
* Workers should follow the dev's direction on flow/tools/format as stated
  in START_HERE.md.
* Use updated path conventions (`tasks/state-N-<domain>.md`,
  `gate-out/state-N-<domain>.md`, `merge-approval/state-N-<domain>.md`)
  if referencing these in gate artifacts.

⸻

2026-06-15 (2)

Files changed:

* START_HERE.md
* AGENT_RULES.md

What changed:

* START_HERE.md "Required Reading Order" extended from 9 to 12 items:
  added DEV_LOG.md (read unread entries), DESIGN_SYSTEM.md (required for
  frontend/UI stages), and ENGINEERING_CONTROLLER.md. Marked this list as
  the single source of truth.
* AGENT_RULES.md "Required Reading" section (previously a separate,
  shorter 5-item list) now points to START_HERE.md instead of duplicating
  the list.

Why:

The two files had diverging "required reading" lists — AGENT_RULES.md's
5-item list omitted ROADMAP.md, SECURITY_RULES.md, and CONDUCTOR.md, and
neither list referenced DESIGN_SYSTEM.md/ENGINEERING_CONTROLLER.md or the
newly added DEV_LOG.md. This created a risk that workers following
AGENT_RULES.md alone would skip security/roadmap/design-system context.

Impact on workers:

* Before starting any assigned task, read all 12 items in START_HERE.md's
  Required Reading Order, including DEV_LOG.md and (if the stage touches
  frontend/UI) DESIGN_SYSTEM.md and ENGINEERING_CONTROLLER.md.
* AGENT_RULES.md no longer lists files itself — refer to START_HERE.md.

⸻

2026-06-15 (3)

Files changed:

* DECISIONS.md
* SECURITY_RULES.md
* CONTRACTS.md

What changed:

* DECISIONS.md Decision 004 (Backend Stack): approved HTTP framework
  changed from `net/http` + `chi` to **Fiber v3**. `net/http` (standalone)
  and `chi` moved to Prohibited Alternatives.
* DECISIONS.md Decision 007 (Authentication): changed from **Authula** to
  **go-better-auth** (github.com/m-t-a97/go-better-auth, teacher/student
  roles). Authula moved to Prohibited Alternatives, "Better Auth" removed
  from Prohibited Alternatives.
* SECURITY_RULES.md "Required Reading Order" (its own 8-item list) now
  points to START_HERE.md instead of duplicating it.
* CONTRACTS.md: removed leftover `<!-- Add one section per module -->`
  template comment at end of file.

Why:

DECISIONS.md previously conflicted with ARCHITECTURE.md and PIPELINE.md,
which already specify Fiber v3 and go-better-auth for Stage 6a/6b/6c. Under
the existing Technology Compliance rule, this conflict would have made
Stage 6a automatically FAIL gate validation (go-better-auth was explicitly
prohibited). Resolved by aligning DECISIONS.md to match
ARCHITECTURE.md/PIPELINE.md, which reflect the actual planned
implementation.

The SECURITY_RULES.md reading list was a third diverging "required reading"
list (different from START_HERE.md's 12-item list) — same drift issue
addressed in entry (2).

Impact on workers:

* Stage 6a (Backend Core) must use Fiber v3 + go-better-auth — this was
  already the direction in ARCHITECTURE.md/PIPELINE.md, now DECISIONS.md
  is consistent and Technology Compliance will not block it.
* Do not introduce Authula or plain net/http+chi for the backend.

⸻

2026-06-15 (4)

Files changed:

* PIPELINE.md
* AGENT_RULES.md

What changed:

* PIPELINE.md: replaced all 11 occurrences of the unresolved placeholder
  `<conductor-branch>` with `wansing`. Every stage's Gate-In Requirements
  and the Dispatch-In note now read "Stage X merged to wansing".
* AGENT_RULES.md "Branch Rules": added `wansing` to the list of branches
  agents may never merge directly into. Added new section "Main Branch
  Merge Authority" — only the dev (human Conductor) may execute the PR
  merge into `main`; agents (including the Conductor AI) create PRs and
  mark them "Ready to Merge: YES" but never run the merge themselves.

Why:

`<conductor-branch>` was an unresolved template placeholder. Per dev
clarification, stage PRs integrate into `wansing` (the Conductor's
workspace branch) — `wansing` itself is then merged into `main` only by
the dev. This also clarifies that no AI/agent action ever performs the
final merge into `main`, addressing a concern raised about merge authority.

Impact on workers:

* Gate-In Requirements now reference `wansing` as the integration branch
  for prior-stage PRs.
* Workers/agents must never merge anything into `main` (or `wansing`)
  themselves — only create PRs. Only the dev merges into `main`.

⸻

2026-06-15 (5)

Files changed:

* AGENT_RULES.md

What changed:

* "Main Branch Merge Authority" section: added that agents may NOT create,
  rename, delete, or re-point the `main` branch — `main` is owned
  exclusively by the dev.

Why:

Follow-up clarification: confirmed `main` already exists on origin and
agents have no authority over its lifecycle, only the dev.

Impact on workers:

* No branch-management actions on `main` of any kind — read-only as a
  PR target.

⸻

2026-06-15 (6)

Files changed:

* DECISIONS.md

What changed:

* Rewrote DECISIONS.md from verbose per-decision blocks (Context / Decision
  / Approved Stack / Prohibited Alternatives / Consequences, ~50-60 lines
  each) into a compact "Approved / Prohibited" bullet format per decision.
  658 lines → 138 lines (~79% reduction). All 11 decisions, Technology
  Compliance, Decision Change Process, and Final Authority sections
  preserved with no content loss (the Fiber v3 / go-better-auth values
  from entry (3) are retained).

Why:

Part of a governance refactor to reduce token cost — START_HERE.md
requires every worker to read DECISIONS.md before starting any task, and
the original repetitive structure (Context paragraphs were generic
boilerplate, low information density) made this expensive on every dispatch.

Impact on workers:

* Same approved/prohibited technologies as before — only the format
  changed. Re-read DECISIONS.md; it is now much shorter.
* This is part 1 of a multi-step governance refactor (SECURITY_RULES.md
  and AGENT_RULES.md/CONDUCTOR.md de-duplication planned next).

⸻

2026-06-15 (7)

Files changed:

* SECURITY_RULES.md

What changed:

* Rewrote SECURITY_RULES.md, consolidating ~30 narrow "Workers may NOT"
  subsections into 13 thematic sections (Trust Policy & Prompt Injection,
  Secrets & Sensitive Data, Access Control & API Surface, Dependencies &
  Supply Chain, Infrastructure/Data & Destructive Actions, Auditability &
  Incident Reporting, Security Gate, etc.). 602 lines → 203 lines (~66%
  reduction). All substantive rules preserved; its own "Required Reading"
  list (already pointed to START_HERE.md per entry (3)) is unchanged.

Why:

Continuation of the token-reduction governance refactor — SECURITY_RULES.md
is in every worker's required reading and had heavy repetition across many
small sections covering overlapping concerns (secrets, env files, logging,
crypto were 4 separate sections covering one theme, etc.).

Impact on workers:

* Same security rules apply — only the structure changed. Re-read
  SECURITY_RULES.md; it is now much shorter.
* Part 2 of the multi-step governance refactor (part 1 = DECISIONS.md).
  AGENT_RULES.md/CONDUCTOR.md de-duplication planned next.

⸻

2026-06-15 (8)

Files changed:

* AGENT_RULES.md
* CONDUCTOR.md

What changed:

* AGENT_RULES.md: collapsed the duplicated "Conductor/Orchestrator Model
  Configuration" + "Sub-Agent Model Configuration" blocks into a one-line
  pointer to CONDUCTOR.md → "Model Selection Policy" (the two files had
  near-identical model config tables).
* CONDUCTOR.md: trimmed six sections that restated rules already defined in
  AGENT_RULES.md, replacing each with a short cross-reference plus any
  Conductor-specific addition:
  - "Dependency Approval" → points to AGENT_RULES.md "Dependency Rules" /
    DECISIONS.md 011; kept the Conductor's approve/reject/alternative role.
  - "Architecture Governance" → points to AGENT_RULES.md "Architecture
    Rules"; kept the change-approval requirement.
  - "Decision Governance" → points to AGENT_RULES.md "Decision Rules"; kept
    the change-approval requirement.
  - "Conductor-Only Tasks" → points to AGENT_RULES.md's fuller "Conductor-
    Only Tasks" section (which has the complete definition and rules).
  - "Build Artifact Enforcement" → points to AGENT_RULES.md "Git & Build
    Artifacts" for the full checklist/prohibited-directory list.
  - "Multi-Agent Compatibility" → points to AGENT_RULES.md "Multi-Model
    Compatibility" (identical content, two names).
  CONDUCTOR.md: 676 → 599 lines. AGENT_RULES.md: 718 → 700 lines.
  Combined: 1394 → 1299 lines (~7% reduction).

Why:

Continuation of the token-reduction governance refactor (part 3, after
DECISIONS.md and SECURITY_RULES.md). AGENT_RULES.md and CONDUCTOR.md
restated the same worker-facing rules from two angles (worker prohibition
vs. conductor enforcement), which workers had to read in full from both
files per START_HERE.md's Required Reading Order.

Impact on workers:

* No rule changed — only removed duplication. Where CONDUCTOR.md previously
  restated a rule, it now cross-references AGENT_RULES.md, which remains
  the canonical worker-facing statement of that rule.
* Model selection: see CONDUCTOR.md "Model Selection Policy" (was
  previously duplicated in AGENT_RULES.md).

⸻

2026-06-15 (9)

Files changed:

* ROADMAP.md

What changed:

* Merged "Governance" and "Change Management" into one "Governance & Change
  Management" section, cross-referencing AGENT_RULES.md "Roadmap
  Protection" instead of restating the read-only file list.
* Condensed "Relationship To Other Documents" from a per-file
  heading+paragraph list to a single one-line summary (same style used in
  SECURITY_RULES.md entry (3)).
* Merged "Notes" and "Final Statement" into one shorter "Final Statement"
  section.
  298 → 248 lines (~17% reduction).

Why:

Continuation of the governance refactor. Reviewed all remaining governance
files for refactor potential: DESIGN_SYSTEM.md, ENGINEERING_CONTROLLER.md,
CONTRACTS.md, START_HERE.md, PIPELINE.md, PROJECT.md, and ARCHITECTURE.md
are already dense/content-focused with little repeated prose — PIPELINE.md's
per-stage repetition (Dispatch-In/Gate-Out/Merge-Approval paths) is
structural data, not boilerplate, so it was left as-is. ROADMAP.md was the
remaining file with prose redundancy (governance/file-relationship sections
duplicating AGENT_RULES.md and restating other files' purposes at length).

Impact on workers:

* No rule changed — ROADMAP.md remains read-only for workers per
  AGENT_RULES.md "Roadmap Protection". Re-read ROADMAP.md; it is shorter.
* This concludes the current governance refactor pass (DECISIONS.md,
  SECURITY_RULES.md, AGENT_RULES.md/CONDUCTOR.md, ROADMAP.md).
