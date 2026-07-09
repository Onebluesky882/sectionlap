package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"

	"sectionlap/backend/models"
	"sectionlap/backend/repositories"
)

type VisualPlanService struct {
	repo             *repositories.VisualPlanRepository
	groqAPIKey       string
	visualServiceURL string
	presigner        *R2Presigner
}

func NewVisualPlanService(
	repo *repositories.VisualPlanRepository,
	groqAPIKey string,
	visualServiceURL string,
	presigner *R2Presigner,
) *VisualPlanService {
	return &VisualPlanService{
		repo:             repo,
		groqAPIKey:       groqAPIKey,
		visualServiceURL: strings.TrimRight(visualServiceURL, "/"),
		presigner:        presigner,
	}
}

// presignURLs replaces gif_url/mp4_url with fresh presigned URLs derived from
// the stored r2_key_gif/r2_key_mp4 — stored URLs may be stale/expired, and
// this is a no-op when R2 isn't configured (presigner is nil).
func (s *VisualPlanService) presignURLs(ctx context.Context, plan *models.VisualPlan) {
	if s.presigner == nil {
		return
	}
	if url, err := s.presigner.PresignGetURL(ctx, plan.R2KeyGif); err == nil {
		plan.GifURL = url
	}
	if url, err := s.presigner.PresignGetURL(ctx, plan.R2KeyMp4); err == nil {
		plan.Mp4URL = url
	}
}

// ── Groq structured plan ──────────────────────────────────────────────────────

type planStep struct {
	Label        string `json:"label"`
	Sublabel     string `json:"sublabel"`
	Milestone    bool   `json:"milestone"`
	DurationDays *int   `json:"durationDays"`
}

type structuredPlan struct {
	Title     string     `json:"title"`
	Steps     []planStep `json:"steps"`
	TotalDays int        `json:"totalDays"`
}

// groqModel is a general-purpose, instruction-following model — good fit for
// this structured-JSON-extraction task. Not the vision model used by
// teacher_verification_service.go (which stays on Claude for now).
const groqModel = "openai/gpt-oss-20b"

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

// mockParse builds a naive structured plan without calling Groq — used when
// no GROQ_API_KEY is configured (e.g. local dev before an API subscription exists).
func mockParse(promptText string) *structuredPlan {
	lines := strings.Split(strings.TrimSpace(promptText), "\n")
	steps := make([]planStep, 0, len(lines))
	for i, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		if len(line) > 20 {
			line = line[:20]
		}
		steps = append(steps, planStep{
			Label:     line,
			Milestone: i == 0 || i == len(lines)-1,
		})
	}
	if len(steps) == 0 {
		steps = append(steps, planStep{Label: "Step 1", Milestone: true})
	}
	return &structuredPlan{
		Title:     "Untitled Plan (mock)",
		Steps:     steps,
		TotalDays: len(steps),
	}
}

func (s *VisualPlanService) parseWithGroq(ctx context.Context, promptText string) (*structuredPlan, error) {
	if s.groqAPIKey == "" {
		return mockParse(promptText), nil
	}

	systemPrompt := `You are an expert educational flow-diagram designer. Given a user's text
description of a learning plan, roadmap, process, or concept (including a formula or
equation), break it down into a clear, logical sequence of steps a learner can follow
visually.

Return ONLY valid JSON with this exact shape (no markdown, no explanation):
{
  "title": "short title for the plan (max 40 chars)",
  "totalDays": <total number of days as integer, 0 if not time-based>,
  "steps": [
    {
      "label": "short step name (max 16 chars, 1-3 words)",
      "sublabel": "optional detail (max 30 chars, empty string if none)",
      "milestone": <true if this is a key milestone, false otherwise>,
      "durationDays": <days for this step as integer, or null if not time-based>
    }
  ]
}

Rules:
- Maximum 12 steps
- Steps must flow logically, each one building on the last
- Keep labels very short and punchy — they render inside a small circle
- Mark 2-3 steps as milestones
- If the input is a formula or equation, break it into the concepts/terms a learner
  needs to understand it, in a sensible teaching order — not a literal restatement of
  the symbols`

	// Groq serves an OpenAI-compatible Chat Completions API — different
	// request/response shape than Anthropic's Messages API (messages array
	// carries the system role instead of a top-level "system" field, and the
	// response is choices[0].message.content instead of content[0].text).
	body, _ := json.Marshal(map[string]any{
		"model":                 groqModel,
		"max_completion_tokens": 1024,
		"temperature":           0.2,
		"response_format":       map[string]string{"type": "json_object"},
		"messages": []map[string]any{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": promptText},
		},
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		"https://api.groq.com/openai/v1/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.groqAPIKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("groq request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("groq error %d: %s", resp.StatusCode, b)
	}

	var groqResp struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&groqResp); err != nil {
		return nil, fmt.Errorf("decode groq response: %w", err)
	}

	if len(groqResp.Choices) == 0 {
		return nil, fmt.Errorf("groq returned no choices")
	}

	var plan structuredPlan
	if err := json.Unmarshal([]byte(stripMarkdownFence(groqResp.Choices[0].Message.Content)), &plan); err != nil {
		return nil, fmt.Errorf("parse structured plan JSON: %w", err)
	}
	return &plan, nil
}

// ── Python visual service ─────────────────────────────────────────────────────

type generateRequest struct {
	PlanID    string     `json:"planId"`
	UserID    string     `json:"userId"`
	Title     string     `json:"title"`
	Steps     []planStep `json:"steps"`
	TotalDays int        `json:"totalDays"`
}

type generateResponse struct {
	GifURL   string `json:"gifUrl"`
	Mp4URL   string `json:"mp4Url"`
	R2KeyGif string `json:"r2KeyGif"`
	R2KeyMp4 string `json:"r2KeyMp4"`
}

func (s *VisualPlanService) callVisualService(ctx context.Context, planID, userID string, plan *structuredPlan) (*generateResponse, error) {
	payload, _ := json.Marshal(generateRequest{
		PlanID:    planID,
		UserID:    userID,
		Title:     plan.Title,
		Steps:     plan.Steps,
		TotalDays: plan.TotalDays,
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		s.visualServiceURL+"/generate", bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("visual service request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("visual service error %d: %s", resp.StatusCode, b)
	}

	var result generateResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode visual service response: %w", err)
	}
	return &result, nil
}

// ── Public API ────────────────────────────────────────────────────────────────

func (s *VisualPlanService) Generate(ctx context.Context, userID, promptText string) (*models.VisualPlan, error) {
	plan, err := s.parseWithGroq(ctx, promptText)
	if err != nil {
		return nil, fmt.Errorf("AI parse failed: %w", err)
	}

	structuredJSON, _ := json.Marshal(plan)

	planID := uuid.New().String()

	result, err := s.callVisualService(ctx, planID, userID, plan)
	if err != nil {
		return nil, fmt.Errorf("render failed: %w", err)
	}

	record := &models.VisualPlan{
		ID:             planID,
		UserID:         userID,
		Title:          plan.Title,
		PromptText:     promptText,
		StructuredJSON: string(structuredJSON),
		GifURL:         result.GifURL,
		Mp4URL:         result.Mp4URL,
		R2KeyGif:       result.R2KeyGif,
		R2KeyMp4:       result.R2KeyMp4,
	}
	if err := s.repo.Create(ctx, record); err != nil {
		return nil, fmt.Errorf("save to DB failed: %w", err)
	}
	s.presignURLs(ctx, record)
	return record, nil
}

func (s *VisualPlanService) List(ctx context.Context, userID string) ([]models.VisualPlan, error) {
	plans, err := s.repo.ListByUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	for i := range plans {
		s.presignURLs(ctx, &plans[i])
	}
	return plans, nil
}

func (s *VisualPlanService) GetByID(ctx context.Context, id string) (*models.VisualPlan, error) {
	plan, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	s.presignURLs(ctx, plan)
	return plan, nil
}

func (s *VisualPlanService) Delete(ctx context.Context, id, userID string) error {
	return s.repo.Delete(ctx, id, userID)
}
