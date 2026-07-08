---
name: ai-assisted-teacher-identity-verification
description: Document upload + AI-assisted auto-approval / manual-review status model for teacher identity verification
metadata:
  type: project
---

# ADR 003 — AI-Assisted Teacher Identity Verification

**Date:** 2026-07-08
**Status:** Accepted

## Context

Teachers (including foreign/adult applicants) must prove their identity before opening classes and earning on the platform. Previously, `/teacher-verify` only collected a free-text ID *number* — no document photo — and `user_roles.is_verified` was a flat boolean with no way to distinguish "not submitted" from "pending review" from "rejected." The frontend (`useTeacherVerify.ts`) also optimistically marked the user verified on submit regardless of actual backend state, which no longer matched the admin-approval-required backend behavior.

Requirements: teachers upload a passport or national ID photo; the system reads it, checks the extracted name against the registered name and confirms age ≥ 18; on a confident match it auto-approves immediately; otherwise it falls into the existing admin approval queue for manual review. Applies identically regardless of nationality — no separate work-permit/visa check.

## Decision 1 — Status model lives on `teacher_profiles`, not `user_roles`

`teacher_profiles.verification_status` (`pending | approved | rejected`, implicit "not submitted" when no row exists) is the source of truth for the richer state. `user_roles.is_verified` remains the single derived boolean it already was, kept in sync by the service layer on every submit/approve/reject.

Rejected alternative: widening `is_verified` itself into an enum. Rejected because it would ripple into `auth_controller.go`'s three response payloads (`SignUp`/`SignIn`/`Me`) and the desktop-app/mobile-app `User` type definitions, for no functional gain — only `/teacher-verify` itself needs the richer state, and it fetches that via `GET /api/teacher/profile`.

## Decision 2 — Synchronous AI check with auto-approve + manual-fallback

Verification runs synchronously inside `POST /api/teacher/profile` (same shape as `VisualPlanService.Generate` — no job queue exists anywhere in this repo). The AI extracts `{full_name, date_of_birth, document_type, confidence}` from the uploaded image. Auto-approval requires **all** of: document type is passport/national_id, name similarity ≥0.75 (or token-set match), age ≥18, confidence ≥0.7. Any failure, ambiguity, parse error, or missing `CLAUDE_API_KEY`/R2 config routes to `pending` — the existing admin queue — never to a hard failure. These thresholds are tunable constants (`services/name_match.go`, `services/teacher_verification_service.go`), expected to be retuned post-launch based on real submissions.

## Decision 3 — Reuse the existing raw-HTTP Claude pattern, no new SDK or key

`services/teacher_verification_service.go` mirrors `services/visual_plan_service.go`'s `parseWithClaude` exactly: same `https://api.anthropic.com/v1/messages` endpoint, same header pattern, same `claudeModel` constant (`claude-haiku-4-5-20251001`), extended with a multimodal image content block for vision input. Reuses the existing `CLAUDE_API_KEY` env var — no second key, no new Go dependency (base64/Levenshtein are stdlib).

## Decision 4 — Match logic stays in our own code, never delegated to the model's yes/no judgment

Mirrors `slip2go_client.go`'s stated rationale for `MatchesWallet`: providers' (and models') built-in matching has proven unreliable for this app's edge cases, so the Claude call only extracts structured fields — `services/name_match.go`'s `namesMatch` and `teacher_verification_service.go`'s `evaluateExtraction` make the actual approve/pending decision in auditable, independently-tunable Go code. The raw AI response is always persisted (`ai_raw_response`) before evaluating pass/fail, mirroring `booking_service.VerifySlip`'s "persist raw, then decide" ordering.

## Bundled fix — section-creation gate

`POST /api/sections` previously had no `is_verified` check at all (only role was checked), meaning an unverified teacher could already create sections — the entire premise of "verify before opening a class" was not enforced. `middlewares.Require()` now also sets `IsVerified` in request locals, and `SectionController.Create` returns 403 if unset. Bundled into this change since verification is otherwise cosmetic without it.

## DECISIONS.md

No new entry needed — DECISIONS.md item 011 (Dependency Governance) requires documentation for new *dependencies*; this feature adds none (reuses `CLAUDE_API_KEY`, the existing raw-HTTP Claude pattern, and stdlib only). DECISIONS.md is Conductor-owned and workers may not modify it directly; this ADR is the correct worker-writable artifact for the decision.
