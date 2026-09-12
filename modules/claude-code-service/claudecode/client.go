// Package claudecode wraps the Claude Code CLI (`claude`) running headless,
// authenticated via CLAUDE_CODE_OAUTH_TOKEN (inherited from the process
// environment — the CLI reads it itself, nothing to pass explicitly). It
// exists because CLAUDE_CODE_OAUTH_TOKEN authenticates a real CLI process,
// not a plain HTTPS API, so it needs a long-running Node runtime to spawn
// that process from — something neither the Go backend's Alpine container
// nor a Cloudflare Worker can do.
package claudecode

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"
	"time"
)

const systemPrompt = `You are an expert educational flow-diagram designer. Given a user's text
description of a learning plan, roadmap, process, or concept (including a formula or
equation), break it down into a clear, logical sequence of steps a learner can follow
visually.

Return ONLY valid JSON with this exact shape (no markdown, no explanation):
{
  "title": "short title for the plan (max 40 chars)",
  "isCycle": <true if this is a natural repeating/circular cycle with no fixed start or
    end (e.g. a life cycle, the water cycle, a business/feedback cycle) — false for a
    linear plan/roadmap that has a clear beginning and finish (e.g. "learn calculus in
    30 days")>,
  "totalDays": <total number of days as integer, 0 if not time-based>,
  "steps": [
    {
      "label": "short step name (max 16 chars, 1-3 words)",
      "sublabel": "optional detail (max 30 chars, empty string if none)",
      "milestone": <true if this is a key milestone, false otherwise>,
      "durationDays": <days for this step as integer, or null if not time-based>,
      "imagePrompt": "a short (max 15 words) visual description for a simple flat-icon
        illustration of this specific step's concept — always required, every step
        gets an illustration regardless of isCycle"
    }
  ]
}

Rules:
- Maximum 12 steps for a linear plan; maximum 8 steps when isCycle is true (a
  ring diagram gets crowded past 8)
- Steps must flow logically, each one building on the last
- Keep labels very short and punchy — they render inside a small circle
- Mark 2-3 steps as milestones
- If the input is a formula or equation, break it into the concepts/terms a learner
  needs to understand it, in a sensible teaching order — not a literal restatement of
  the symbols`

type PlanStep struct {
	Label        string `json:"label"`
	Sublabel     string `json:"sublabel"`
	Milestone    bool   `json:"milestone"`
	DurationDays *int   `json:"durationDays"`
	ImagePrompt  string `json:"imagePrompt"`
}

type StructuredPlan struct {
	Title     string     `json:"title"`
	IsCycle   bool       `json:"isCycle"`
	Steps     []PlanStep `json:"steps"`
	TotalDays int        `json:"totalDays"`
}

// cliResult mirrors `claude -p --output-format json`'s envelope — only the
// fields this package needs.
type cliResult struct {
	IsError bool   `json:"is_error"`
	Result  string `json:"result"`
}

// stripMarkdownFence removes a ```json / ``` wrapper the model sometimes adds
// despite being told to return raw JSON.
func stripMarkdownFence(s string) string {
	s = strings.TrimSpace(s)
	if !strings.HasPrefix(s, "```") {
		return s
	}
	s = strings.TrimPrefix(s, "```json")
	s = strings.TrimPrefix(s, "```")
	s = strings.TrimSuffix(s, "```")
	return strings.TrimSpace(s)
}

type Client struct {
	model   string
	timeout time.Duration
}

func NewClient(model string) *Client {
	return &Client{model: model, timeout: 55 * time.Second}
}

// Parse runs promptText through the Claude Code CLI in single-turn, headless
// mode and decodes the model's reply into a StructuredPlan.
func (c *Client) Parse(ctx context.Context, promptText string) (*StructuredPlan, error) {
	ctx, cancel := context.WithTimeout(ctx, c.timeout)
	defer cancel()

	args := []string{
		"-p", promptText,
		"--append-system-prompt", systemPrompt,
		"--output-format", "json",
		"--max-turns", "1",
		"--model", c.model,
	}

	cmd := exec.CommandContext(ctx, "claude", args...)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("claude cli failed: %w (stderr: %s)", err, stderr.String())
	}

	var result cliResult
	if err := json.Unmarshal(stdout.Bytes(), &result); err != nil {
		return nil, fmt.Errorf("decode cli output: %w (stdout: %s)", err, stdout.String())
	}
	if result.IsError {
		return nil, fmt.Errorf("claude cli reported an error: %s", result.Result)
	}

	var plan StructuredPlan
	if err := json.Unmarshal([]byte(stripMarkdownFence(result.Result)), &plan); err != nil {
		return nil, fmt.Errorf("parse structured plan JSON: %w (result: %s)", err, result.Result)
	}
	return &plan, nil
}
