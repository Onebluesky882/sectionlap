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
	repo                    *repositories.VisualPlanRepository
	claudeCodeServiceURL    string
	claudeCodeServiceSecret string
	visualServiceURL        string
	presigner               *R2Presigner
}

func NewVisualPlanService(
	repo *repositories.VisualPlanRepository,
	claudeCodeServiceURL string,
	claudeCodeServiceSecret string,
	visualServiceURL string,
	presigner *R2Presigner,
) *VisualPlanService {
	return &VisualPlanService{
		repo:                    repo,
		claudeCodeServiceURL:    strings.TrimRight(claudeCodeServiceURL, "/"),
		claudeCodeServiceSecret: claudeCodeServiceSecret,
		visualServiceURL:        strings.TrimRight(visualServiceURL, "/"),
		presigner:               presigner,
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

// ── Claude Code structured plan ─────────────────────────────────────────────

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

// mockParse builds a naive structured plan without calling the AI parser —
// used when no CLAUDE_CODE_SERVICE_URL is reachable (e.g. local dev before
// the sidecar is running).
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

// parseWithClaudeCode asks the claude-code-service sidecar (a small Node
// process that shells out to the Claude Code CLI, authenticated via
// CLAUDE_CODE_OAUTH_TOKEN) to turn promptText into a structuredPlan. The
// sidecar owns the system prompt and CLI invocation — this is a plain HTTP
// call, same shape as callVisualService below.
func (s *VisualPlanService) parseWithClaudeCode(ctx context.Context, promptText string) (*structuredPlan, error) {
	if s.claudeCodeServiceURL == "" {
		return mockParse(promptText), nil
	}

	body, _ := json.Marshal(map[string]string{"promptText": promptText})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		s.claudeCodeServiceURL+"/v1/parse-plan", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Secret", s.claudeCodeServiceSecret)

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("claude-code-service request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("claude-code-service error %d: %s", resp.StatusCode, b)
	}

	var plan structuredPlan
	if err := json.NewDecoder(resp.Body).Decode(&plan); err != nil {
		return nil, fmt.Errorf("decode claude-code-service response: %w", err)
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
	plan, err := s.parseWithClaudeCode(ctx, promptText)
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
