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
	claudeAPIKey     string
	visualServiceURL string
	presigner        *R2Presigner
}

func NewVisualPlanService(
	repo *repositories.VisualPlanRepository,
	claudeAPIKey string,
	visualServiceURL string,
	presigner *R2Presigner,
) *VisualPlanService {
	return &VisualPlanService{
		repo:             repo,
		claudeAPIKey:     claudeAPIKey,
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

// ── Claude structured plan ────────────────────────────────────────────────────

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

const claudeModel = "claude-haiku-4-5-20251001"

// mockParse builds a naive structured plan without calling Claude — used when
// no CLAUDE_API_KEY is configured (e.g. local dev before an API subscription exists).
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

func (s *VisualPlanService) parseWithClaude(ctx context.Context, promptText string) (*structuredPlan, error) {
	if s.claudeAPIKey == "" {
		return mockParse(promptText), nil
	}

	systemPrompt := `You are a learning plan parser. Given a user's text description of a learning plan or roadmap, extract it into structured JSON.

Return ONLY valid JSON with this exact shape (no markdown, no explanation):
{
  "title": "short title for the plan (max 40 chars)",
  "totalDays": <total number of days as integer>,
  "steps": [
    {
      "label": "short step name (max 20 chars)",
      "sublabel": "optional detail (max 30 chars, empty string if none)",
      "milestone": <true if this is a key milestone, false otherwise>,
      "durationDays": <days for this step as integer, or null>
    }
  ]
}

Rules:
- Maximum 12 steps
- Steps must flow logically
- Keep labels concise
- Mark 2-3 steps as milestones`

	body, _ := json.Marshal(map[string]any{
		"model":       claudeModel,
		"max_tokens":  1024,
		"temperature": 0.2,
		"system":      systemPrompt,
		"messages": []map[string]any{
			{"role": "user", "content": promptText},
		},
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		"https://api.anthropic.com/v1/messages", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", s.claudeAPIKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("claude request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("claude error %d: %s", resp.StatusCode, b)
	}

	var claudeResp struct {
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&claudeResp); err != nil {
		return nil, fmt.Errorf("decode claude response: %w", err)
	}

	if len(claudeResp.Content) == 0 {
		return nil, fmt.Errorf("claude returned empty content")
	}

	var plan structuredPlan
	if err := json.Unmarshal([]byte(claudeResp.Content[0].Text), &plan); err != nil {
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
	plan, err := s.parseWithClaude(ctx, promptText)
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
