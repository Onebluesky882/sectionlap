DEV_LOG_ARCHIVE.md

Status: ARCHIVE

Owner: DEV

⸻

Purpose

Archived entries from DEV_LOG.md. These entries were moved here on 2026-06-16
when DEV_LOG.md was reset to reduce token cost.

Workers do NOT need to read this file unless investigating past decisions.
Active entries are in DEV_LOG.md only.

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
  Conductor-specific addition.

Impact on workers:

* No rule changed — only removed duplication.
* Model selection: see CONDUCTOR.md "Model Selection Policy".

⸻

2026-06-15 (9)

Files changed:

* ROADMAP.md

What changed:

* Merged "Governance" and "Change Management" into one section.
* Condensed "Relationship To Other Documents" to a one-line summary.
* Merged "Notes" and "Final Statement" into one shorter section.
  298 → 248 lines (~17% reduction).

Why:

Continuation of the governance refactor. ROADMAP.md had prose redundancy
duplicating AGENT_RULES.md and restating other files' purposes at length.

Impact on workers:

* No rule changed. Re-read ROADMAP.md; it is shorter.
* This concludes the governance refactor pass 1.

⸻

2026-06-16 (10)

Files changed:

* DEV.md (new)
* GOVERNANCE_CORE.md (new)
* START_HERE.md

What changed:

* DEV.md (new): defines the Dev's role, authority, and operating rules.
* GOVERNANCE_CORE.md (new): slim shared reference — Authority Order,
  Governance File Ownership table, pointer to START_HERE.md.
* START_HERE.md: extended reading order from 12 to 14 items (0–13);
  added GOVERNANCE_CORE.md at position 0 and DEV.md at position 10.

Impact on workers:

* Read GOVERNANCE_CORE.md first (item 0), then DEV.md (item 10).
* No existing rules changed.

⸻

2026-06-16 (11)

Files changed:

* AGENT_RULES.md
* CONDUCTOR.md

What changed:

* AGENT_RULES.md: second refactor pass. 700 → 388 lines (~45% reduction).
  Removed conductor-internal content (8-step flow, full output templates);
  kept worker-facing gate validation rules only.
* CONDUCTOR.md: 599 → 570 lines. Replaced verbose sections with pointers
  to GOVERNANCE_CORE.md and DEV.md.

Impact on workers:

* Same worker rules apply. Re-read AGENT_RULES.md; it is substantially shorter.

⸻

2026-06-16 (12)

Files changed:

* GOVERNANCE_CORE.md
* DEV_LOG.md

What changed:

* GOVERNANCE_CORE.md: Added Planning.md to the Governance File Ownership
  table as Dev-owned, read-only for Conductor and Workers.

Impact on workers:

* Planning.md is read-only for AI agents. Do not write to it.

⸻

2026-06-16 (13)

Files changed:

* modules/desktop-app/frontend/src/pages/AuthPage.tsx

What changed:

* AuthPage.tsx: Dev manually formatted and cleaned up template class string
  indentations and syntax inside JSX elements.

Impact on workers:

* No functional changes. Code behavior unchanged.
