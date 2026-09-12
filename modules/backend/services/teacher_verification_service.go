package services

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"sectionlap/backend/models"
	"sectionlap/backend/repositories"
)

// Tunable thresholds for the AI extraction verdict — kept alongside the name
// thresholds in name_match.go as the pieces most likely to need retuning.
const (
	aiConfidenceThreshold = 0.7
	minVerificationAge    = 18
)

type TeacherVerificationService struct {
	profileRepo  repositories.TeacherProfileRepository
	userRoleRepo repositories.UserRoleRepository
	claudeAPIKey string
	presigner    *R2Presigner
}

func NewTeacherVerificationService(
	profileRepo repositories.TeacherProfileRepository,
	userRoleRepo repositories.UserRoleRepository,
	claudeAPIKey string,
	presigner *R2Presigner,
) *TeacherVerificationService {
	return &TeacherVerificationService{
		profileRepo:  profileRepo,
		userRoleRepo: userRoleRepo,
		claudeAPIKey: claudeAPIKey,
		presigner:    presigner,
	}
}

type SubmitInput struct {
	FullName    string
	IDCard      string
	Phone       string
	Expertise   string
	DocumentKey string
}

// docExtraction is the structured JSON we ask Claude to return from the
// identity-document image.
type docExtraction struct {
	FullName     string  `json:"full_name"`
	DateOfBirth  string  `json:"date_of_birth"`
	DocumentType string  `json:"document_type"`
	Confidence   float64 `json:"confidence"`
}

// Submit stores the teacher's submission and runs identity verification
// synchronously (same shape as VisualPlanService.Generate — no job queue
// exists anywhere in this repo). It always succeeds and saves a profile;
// verification failures/ambiguity route to "pending" for manual admin
// review rather than blocking the submission.
func (s *TeacherVerificationService) Submit(ctx context.Context, teacherID string, input SubmitInput) (*models.TeacherProfile, error) {
	profile := &models.TeacherProfile{
		TeacherID:          teacherID,
		FullName:           input.FullName,
		IDCard:             input.IDCard,
		Phone:              input.Phone,
		Expertise:          input.Expertise,
		SubmittedAt:        time.Now(),
		IdentityDocR2Key:   input.DocumentKey,
		VerificationStatus: models.VerificationPending,
	}

	s.runVerification(ctx, profile)

	if err := s.profileRepo.Upsert(ctx, profile); err != nil {
		return nil, fmt.Errorf("save profile: %w", err)
	}

	verified := profile.VerificationStatus == models.VerificationApproved
	if err := s.userRoleRepo.SetVerified(ctx, teacherID, verified); err != nil {
		return nil, fmt.Errorf("sync verified flag: %w", err)
	}

	return profile, nil
}

// runVerification mutates profile in place with the AI extraction result and
// the resulting verification_status/ai_verdict. Fails safe to "pending" on
// any error, ambiguity, or missing configuration — it never auto-approves
// unless every check explicitly passes.
func (s *TeacherVerificationService) runVerification(ctx context.Context, profile *models.TeacherProfile) {
	if s.claudeAPIKey == "" || s.presigner == nil {
		profile.AIVerdict = new("ai_unconfigured")
		return
	}

	docURL, err := s.presigner.PresignGetURL(ctx, profile.IdentityDocR2Key)
	if err != nil {
		profile.AIVerdict = new("unreadable")
		return
	}

	imgBytes, mimeType, err := fetchImage(ctx, docURL)
	if err != nil {
		profile.AIVerdict = new("unreadable")
		return
	}

	extraction, raw, err := s.extractWithClaude(ctx, imgBytes, mimeType)
	// Always persist the raw response for audit, even on failure — mirrors
	// booking_service.VerifySlip's "persist raw, then decide" ordering.
	if raw != "" {
		profile.AIRawResponse = new(raw)
	}
	if err != nil || extraction == nil {
		profile.AIVerdict = new("unreadable")
		return
	}

	profile.AIExtractedName = new(extraction.FullName)
	profile.AIExtractedDOB = new(extraction.DateOfBirth)
	profile.AIDocumentType = new(extraction.DocumentType)
	profile.AIConfidence = &extraction.Confidence

	status, verdict := evaluateExtraction(profile.FullName, *extraction)
	profile.VerificationStatus = status
	profile.AIVerdict = &verdict
}

// evaluateExtraction applies our own business rules to an AI extraction
// result — never delegated to the model's own yes/no judgment, mirroring the
// Slip2Go precedent (auditability, tunable tolerance independent of the
// provider). Pure function, kept separate from I/O so the decision matrix is
// unit-testable without a live Claude call.
func evaluateExtraction(registeredName string, extraction docExtraction) (models.TeacherVerificationStatus, string) {
	docTypeOK := extraction.DocumentType == "passport" || extraction.DocumentType == "national_id"
	confidenceOK := extraction.Confidence >= aiConfidenceThreshold
	nameOK := namesMatch(registeredName, extraction.FullName)
	ageOK, ageErr := ageAtLeast(extraction.DateOfBirth, minVerificationAge)

	switch {
	case !docTypeOK || ageErr != nil:
		return models.VerificationPending, "unreadable"
	case !nameOK:
		return models.VerificationPending, "name_mismatch"
	case !ageOK:
		return models.VerificationPending, "underage"
	case !confidenceOK:
		return models.VerificationPending, "low_confidence"
	default:
		return models.VerificationApproved, "auto_approved"
	}
}

// ageAtLeast reports whether a "YYYY-MM-DD" date of birth is at least
// minYears years in the past, as of now.
func ageAtLeast(dob string, minYears int) (bool, error) {
	if dob == "" {
		return false, fmt.Errorf("empty date of birth")
	}
	birth, err := time.Parse("2006-01-02", dob)
	if err != nil {
		return false, err
	}
	cutoff := time.Now().AddDate(-minYears, 0, 0)
	return !birth.After(cutoff), nil
}

func fetchImage(ctx context.Context, url string) ([]byte, string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, "", err
	}
	client := &http.Client{Timeout: 20 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, "", fmt.Errorf("fetch document failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("fetch document error %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", fmt.Errorf("read document body: %w", err)
	}

	mimeType := resp.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "image/jpeg"
	}
	return body, mimeType, nil
}

const extractionPrompt = `You are an identity-document verification assistant. The attached image is a
photo of a passport or national ID card. Extract the visible information and
return ONLY valid JSON with this exact shape (no markdown, no explanation):
{
  "full_name": "the full name exactly as printed on the document, empty string if not legible",
  "date_of_birth": "YYYY-MM-DD, empty string if not legible or not present",
  "document_type": "passport" | "national_id" | "other" | "unreadable",
  "confidence": <0.0-1.0, your confidence that the extraction above is accurate>
}

Rules:
- If the image is not a passport or ID card (blank, unrelated photo, too blurry to read), set document_type to "unreadable" and confidence to 0.
- Do not guess a name or date if it is not clearly legible — leave the field empty and lower confidence instead.`

// claudeModel stays on the Anthropic Messages API directly (vision) — this
// pipeline gates auto-approval of teacher identity documents, so a plain
// HTTPS call is the right fit. visual_plan_service.go's text-only parsing
// goes through claude-code-service (CLAUDE_CODE_OAUTH_TOKEN) instead.
const claudeModel = "claude-haiku-4-5-20251001"

// extractWithClaude calls Anthropic's Messages API directly via net/http,
// with an image content block for vision input. Returns the parsed
// extraction plus the raw response body (for audit) even when parsing
// ultimately fails.
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

func (s *TeacherVerificationService) extractWithClaude(ctx context.Context, imgBytes []byte, mimeType string) (*docExtraction, string, error) {
	b64 := base64.StdEncoding.EncodeToString(imgBytes)

	body, _ := json.Marshal(map[string]any{
		"model":       claudeModel,
		"max_tokens":  512,
		"temperature": 0,
		"messages": []map[string]any{
			{
				"role": "user",
				"content": []map[string]any{
					{
						"type": "image",
						"source": map[string]any{
							"type":       "base64",
							"media_type": mimeType,
							"data":       b64,
						},
					},
					{"type": "text", "text": extractionPrompt},
				},
			},
		},
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		"https://api.anthropic.com/v1/messages", bytes.NewReader(body))
	if err != nil {
		return nil, "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", s.claudeAPIKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, "", fmt.Errorf("claude request failed: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", fmt.Errorf("read claude response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, string(raw), fmt.Errorf("claude error %d: %s", resp.StatusCode, raw)
	}

	var claudeResp struct {
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
	}
	if err := json.Unmarshal(raw, &claudeResp); err != nil {
		return nil, string(raw), fmt.Errorf("decode claude response: %w", err)
	}
	if len(claudeResp.Content) == 0 {
		return nil, string(raw), fmt.Errorf("claude returned empty content")
	}

	var extraction docExtraction
	if err := json.Unmarshal([]byte(stripMarkdownFence(claudeResp.Content[0].Text)), &extraction); err != nil {
		return nil, string(raw), fmt.Errorf("parse extraction JSON: %w", err)
	}
	return &extraction, string(raw), nil
}

// Approve marks a teacher's profile approved via admin review (used for
// cases the AI routed to manual review, or when an admin overrides).
func (s *TeacherVerificationService) Approve(ctx context.Context, teacherID, reviewerID string) error {
	if err := s.profileRepo.UpdateVerificationStatus(ctx, teacherID, models.VerificationApproved, nil, reviewerID); err != nil {
		return err
	}
	return s.userRoleRepo.SetVerified(ctx, teacherID, true)
}

// Reject marks a teacher's profile rejected with a reason visible to the
// teacher, who can then resubmit a new document via the same submit flow.
func (s *TeacherVerificationService) Reject(ctx context.Context, teacherID, reviewerID, reason string) error {
	if reason == "" {
		return fmt.Errorf("rejection reason is required")
	}
	if err := s.profileRepo.UpdateVerificationStatus(ctx, teacherID, models.VerificationRejected, &reason, reviewerID); err != nil {
		return err
	}
	return s.userRoleRepo.SetVerified(ctx, teacherID, false)
}
