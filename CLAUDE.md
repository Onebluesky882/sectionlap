# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## modules/website (Next.js + Cloudflare Workers)

### Commands (run from `modules/website/`)
```bash
pnpm dev          # local dev server
pnpm build        # Next.js build (standard)
pnpm lint         # ESLint
pnpm test         # Playwright e2e
pnpm deploy       # opennextjs-cloudflare build + deploy to Cloudflare Workers
pnpm preview      # local Cloudflare Workers preview
```

### 3-Layer Page Pattern
Every route has three files — never skip a layer:
```
src/app/<name>/page.tsx          # Server Component — just re-exports from pages/
src/pages/<name>/page.tsx        # thin wrapper — just re-exports from preload/
src/preload/<name>/page.tsx      # "use client" — all logic + UI lives here
```
Dynamic routes follow the same pattern: `src/app/sections/[id]/page.tsx` → `src/pages/sections/[id]/page.tsx` → `src/preload/sections/[id]/page.tsx`.

### Data Flow
- **State:** Zustand stores in `src/store/use<Name>Store.ts` (persisted via `zustand/middleware` `persist`)
- **Hooks:** business logic in `src/hooks/use<Name>.ts` — call `authFetch` for authenticated requests
- **Auth:** `src/lib/authFetch.ts` reads token from `useAuthStore.getState().token` and injects `Authorization: Bearer`
- **Session restore:** `SessionProvider` calls `restoreSession()` on mount via `useAuth`

### API Proxy
Website calls its own Next.js API routes (`/api/...`) which proxy to the Go backend. Backend base URL is set via environment variable.

### Styling
Tailwind CSS v4. Design tokens: `#1A2332` (dark), `#6AA098` (teal/primary), `#DDE8E6` (border), `#64748B` (muted), `#F7FAFA` (surface).

---

# Agent Rules

## Before Starting Any Task

If you are a worker agent assigned to a PIPELINE.md stage:
1. Read START_HERE.md first
2. Read AGENT_RULES.md
3. Confirm your assigned stage's `tasks/stage-XX-<name>.md` has Status: READY/IN_PROGRESS before beginning work

## ADR Numbering

**MANDATORY — do this before creating any ADR, no exceptions:**

```bash
ls docs/adrs/ | sort | tail -3
```

Take the highest number shown, add 1, use that as your ADR number.

Rules:
- Never guess or assume the next number
- Never create a file without running the check above first
- File name: `NNN-short-slug.md` (zero-padded to 3 digits)
- Header inside the file must match the filename exactly:
  ```
  # ADR NNN — Title
  ```
- This rule applies in every worktree — the `docs/adrs/` directory is shared via git

## Package Manager Rules

- **website** (`modules/website/`) — use **pnpm** for all Node dependency installs and script runs
  - `pnpm install`, `pnpm add <pkg>`, `pnpm run dev`, etc.
  - Never use `npm` or `yarn` in this module
- All other Node modules follow their own lockfile convention (check for `pnpm-lock.yaml` vs `package-lock.json`)
