FROM golang:1.26-alpine AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/claude-code-service .

# Final stage needs Node — the Claude Code CLI is a Node package, and
# CLAUDE_CODE_OAUTH_TOKEN authenticates that CLI, not a plain HTTPS API.
# This is the reason this service can't be a static-binary Alpine image
# like the Go backend, and can't be a Cloudflare Worker either.
FROM node:20-alpine
RUN apk add --no-cache ca-certificates && \
    npm install -g @anthropic-ai/claude-code
WORKDIR /app
COPY --from=builder /out/claude-code-service ./claude-code-service

EXPOSE 9100
CMD ["./claude-code-service"]
