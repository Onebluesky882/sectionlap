# START HERE

Read files in this order:

1. PROJECT.md

2. ARCHITECTURE.md

3. CONTRACTS.md

4. DECISIONS.md

5. PIPELINE.md

6. AGENT_RULES.md

After reading all files:

- Summarize project

- Identify current stage: check PIPELINE.md for the stage with Status = IN PROGRESS

- Read your dispatch-in.md: `tasks/stage-[N]/dispatch-in.md`
  (N = your stage number from PIPELINE.md)

- Branch from main: `git checkout -b feature/[domain]`

- Do NOT start until dispatch-in.md exists and Gate-In Verified = YES

When complete:

- Write `tasks/stage-[N]/gate-out.md`

- STOP — wait for conductor to issue merge-approval.md