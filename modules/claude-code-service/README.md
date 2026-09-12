# claude-code-service

Standalone HTTP wrapper around the **Claude Code CLI** running headless, used
by `modules/backend`'s Visual Plan feature to turn a free-text prompt into a
structured step-by-step plan — replaces the previous Groq call.

`CLAUDE_CODE_OAUTH_TOKEN` authenticates the CLI itself (a Node process), not
a plain HTTPS API, so this has to be a real long-running server with Node +
the CLI installed. It **cannot** run on a Cloudflare Worker (no subprocess
support) or in the Go backend's Alpine container (no Node runtime).

## Run locally

```bash
npm install -g @anthropic-ai/claude-code   # provides the `claude` binary
claude setup-token                          # writes a token to stdout — put it below

cp .env.example .env   # fill in CLAUDE_CODE_OAUTH_TOKEN and INTERNAL_SECRET
go run .
```

## Run in Docker

```bash
docker build -t claude-code-service .
docker run -p 9100:9100 --env-file .env claude-code-service
```

Deploy it anywhere that can run a long-lived container (the same place
`visual-plan-service` and `slip-verification-service` run) — not Cloudflare
Workers. Point the Go backend's `CLAUDE_CODE_SERVICE_URL` /
`CLAUDE_CODE_SERVICE_SECRET` at wherever it ends up.

## API

Every request except `/healthz` must include the shared secret:

```
X-Internal-Secret: <INTERNAL_SECRET>
```

### `GET /healthz`

No auth required. Returns `{"status": "ok"}`.

### `POST /v1/parse-plan`

Request body:

```json
{ "promptText": "Learn calculus: limits, derivatives, then integrals" }
```

Response `200`:

```json
{
  "title": "Intro to Calculus",
  "totalDays": 0,
  "steps": [
    { "label": "Limits", "sublabel": "", "milestone": true, "durationDays": null },
    { "label": "Derivatives", "sublabel": "", "milestone": false, "durationDays": null },
    { "label": "Integrals", "sublabel": "", "milestone": true, "durationDays": null }
  ]
}
```
