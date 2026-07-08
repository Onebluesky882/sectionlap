package services

import (
	"context"
	"testing"
	"time"

	"sectionlap/backend/models"
)

func TestAgeAtLeast(t *testing.T) {
	now := time.Now()

	adult := now.AddDate(-25, 0, 0).Format("2006-01-02")
	if ok, err := ageAtLeast(adult, 18); err != nil || !ok {
		t.Errorf("25-year-old should pass 18+, got ok=%v err=%v", ok, err)
	}

	minor := now.AddDate(-10, 0, 0).Format("2006-01-02")
	if ok, err := ageAtLeast(minor, 18); err != nil || ok {
		t.Errorf("10-year-old should fail 18+, got ok=%v err=%v", ok, err)
	}

	exactlyEighteen := now.AddDate(-18, 0, -1).Format("2006-01-02")
	if ok, err := ageAtLeast(exactlyEighteen, 18); err != nil || !ok {
		t.Errorf("just-turned-18 should pass, got ok=%v err=%v", ok, err)
	}

	if _, err := ageAtLeast("", 18); err == nil {
		t.Error("empty date of birth should error")
	}

	if _, err := ageAtLeast("not-a-date", 18); err == nil {
		t.Error("malformed date of birth should error")
	}
}

func TestEvaluateExtraction(t *testing.T) {
	adultDOB := time.Now().AddDate(-25, 0, 0).Format("2006-01-02")
	minorDOB := time.Now().AddDate(-10, 0, 0).Format("2006-01-02")

	cases := []struct {
		name           string
		registeredName string
		extraction     docExtraction
		wantStatus     models.TeacherVerificationStatus
		wantVerdict    string
	}{
		{
			name:           "all checks pass",
			registeredName: "John Smith",
			extraction:     docExtraction{FullName: "John Smith", DateOfBirth: adultDOB, DocumentType: "passport", Confidence: 0.95},
			wantStatus:     models.VerificationApproved,
			wantVerdict:    "auto_approved",
		},
		{
			name:           "national id also auto-approves",
			registeredName: "John Smith",
			extraction:     docExtraction{FullName: "John Smith", DateOfBirth: adultDOB, DocumentType: "national_id", Confidence: 0.9},
			wantStatus:     models.VerificationApproved,
			wantVerdict:    "auto_approved",
		},
		{
			name:           "name mismatch routes to pending",
			registeredName: "John Smith",
			extraction:     docExtraction{FullName: "Alice Johnson", DateOfBirth: adultDOB, DocumentType: "passport", Confidence: 0.95},
			wantStatus:     models.VerificationPending,
			wantVerdict:    "name_mismatch",
		},
		{
			name:           "underage routes to pending",
			registeredName: "John Smith",
			extraction:     docExtraction{FullName: "John Smith", DateOfBirth: minorDOB, DocumentType: "passport", Confidence: 0.95},
			wantStatus:     models.VerificationPending,
			wantVerdict:    "underage",
		},
		{
			name:           "low confidence routes to pending",
			registeredName: "John Smith",
			extraction:     docExtraction{FullName: "John Smith", DateOfBirth: adultDOB, DocumentType: "passport", Confidence: 0.3},
			wantStatus:     models.VerificationPending,
			wantVerdict:    "low_confidence",
		},
		{
			name:           "unreadable document type routes to pending",
			registeredName: "John Smith",
			extraction:     docExtraction{FullName: "John Smith", DateOfBirth: adultDOB, DocumentType: "unreadable", Confidence: 0},
			wantStatus:     models.VerificationPending,
			wantVerdict:    "unreadable",
		},
		{
			name:           "malformed date of birth routes to pending",
			registeredName: "John Smith",
			extraction:     docExtraction{FullName: "John Smith", DateOfBirth: "", DocumentType: "passport", Confidence: 0.95},
			wantStatus:     models.VerificationPending,
			wantVerdict:    "unreadable",
		},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			gotStatus, gotVerdict := evaluateExtraction(c.registeredName, c.extraction)
			if gotStatus != c.wantStatus {
				t.Errorf("status = %v, want %v", gotStatus, c.wantStatus)
			}
			if gotVerdict != c.wantVerdict {
				t.Errorf("verdict = %v, want %v", gotVerdict, c.wantVerdict)
			}
		})
	}
}

// ── Submit() fail-safe behavior with mocked repos ──────────────────────────

type mockTeacherProfileRepo struct {
	profiles map[string]*models.TeacherProfile
}

func (m *mockTeacherProfileRepo) Upsert(ctx context.Context, profile *models.TeacherProfile) error {
	m.profiles[profile.TeacherID] = profile
	return nil
}

func (m *mockTeacherProfileRepo) GetByTeacherID(ctx context.Context, teacherID string) (*models.TeacherProfile, error) {
	if p, ok := m.profiles[teacherID]; ok {
		return p, nil
	}
	return nil, context.Canceled
}

func (m *mockTeacherProfileRepo) ListAll(ctx context.Context) ([]models.TeacherProfile, error) {
	result := make([]models.TeacherProfile, 0, len(m.profiles))
	for _, p := range m.profiles {
		result = append(result, *p)
	}
	return result, nil
}

func (m *mockTeacherProfileRepo) UpdateVerificationStatus(ctx context.Context, teacherID string, status models.TeacherVerificationStatus, rejectionReason *string, reviewerID string) error {
	p, ok := m.profiles[teacherID]
	if !ok {
		return context.Canceled
	}
	p.VerificationStatus = status
	p.RejectionReason = rejectionReason
	p.ReviewedBy = &reviewerID
	return nil
}

type mockUserRoleRepo struct {
	roles map[string]*models.UserRole
}

func (m *mockUserRoleRepo) GetByUserID(ctx context.Context, userID string) (*models.UserRole, error) {
	if r, ok := m.roles[userID]; ok {
		return r, nil
	}
	return nil, context.Canceled
}

func (m *mockUserRoleRepo) Upsert(ctx context.Context, userRole *models.UserRole) error {
	m.roles[userRole.UserID] = userRole
	return nil
}

func (m *mockUserRoleRepo) SetVerified(ctx context.Context, userID string, verified bool) error {
	if r, ok := m.roles[userID]; ok {
		r.IsVerified = verified
		return nil
	}
	m.roles[userID] = &models.UserRole{UserID: userID, Role: models.RoleTeacher, IsVerified: verified}
	return nil
}

func (m *mockUserRoleRepo) ListByRole(ctx context.Context, role models.UserRoleType) ([]models.UserRole, error) {
	var result []models.UserRole
	for _, r := range m.roles {
		if r.Role == role {
			result = append(result, *r)
		}
	}
	return result, nil
}

func TestSubmit_AIUnconfiguredFailsSafeToPending(t *testing.T) {
	profileRepo := &mockTeacherProfileRepo{profiles: map[string]*models.TeacherProfile{}}
	roleRepo := &mockUserRoleRepo{roles: map[string]*models.UserRole{}}

	// No CLAUDE_API_KEY and no presigner — must never crash, never auto-approve.
	svc := NewTeacherVerificationService(profileRepo, roleRepo, "", nil)

	profile, err := svc.Submit(context.Background(), "teacher-1", SubmitInput{
		FullName: "John Smith", IDCard: "123", Phone: "0800000000", Expertise: "Math",
		DocumentKey: "identity/user-teacher-1-2026-07-08-id.jpg",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if profile.VerificationStatus != models.VerificationPending {
		t.Errorf("status = %v, want pending", profile.VerificationStatus)
	}
	if profile.AIVerdict == nil || *profile.AIVerdict != "ai_unconfigured" {
		t.Errorf("verdict = %v, want ai_unconfigured", profile.AIVerdict)
	}
	if roleRepo.roles["teacher-1"].IsVerified {
		t.Error("teacher should not be verified when AI is unconfigured")
	}
}

func TestReject_RequiresReason(t *testing.T) {
	profileRepo := &mockTeacherProfileRepo{profiles: map[string]*models.TeacherProfile{
		"teacher-1": {TeacherID: "teacher-1", VerificationStatus: models.VerificationPending},
	}}
	roleRepo := &mockUserRoleRepo{roles: map[string]*models.UserRole{}}
	svc := NewTeacherVerificationService(profileRepo, roleRepo, "", nil)

	if err := svc.Reject(context.Background(), "teacher-1", "admin-1", ""); err == nil {
		t.Error("expected error when rejection reason is empty")
	}
}

func TestApproveReject_SyncsIsVerified(t *testing.T) {
	profileRepo := &mockTeacherProfileRepo{profiles: map[string]*models.TeacherProfile{
		"teacher-1": {TeacherID: "teacher-1", VerificationStatus: models.VerificationPending},
	}}
	roleRepo := &mockUserRoleRepo{roles: map[string]*models.UserRole{
		"teacher-1": {UserID: "teacher-1", Role: models.RoleTeacher, IsVerified: false},
	}}
	svc := NewTeacherVerificationService(profileRepo, roleRepo, "", nil)
	ctx := context.Background()

	if err := svc.Approve(ctx, "teacher-1", "admin-1"); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !roleRepo.roles["teacher-1"].IsVerified {
		t.Error("expected IsVerified true after approve")
	}
	if profileRepo.profiles["teacher-1"].VerificationStatus != models.VerificationApproved {
		t.Error("expected profile status approved")
	}

	if err := svc.Reject(ctx, "teacher-1", "admin-1", "document blurry"); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if roleRepo.roles["teacher-1"].IsVerified {
		t.Error("expected IsVerified false after reject")
	}
	if profileRepo.profiles["teacher-1"].VerificationStatus != models.VerificationRejected {
		t.Error("expected profile status rejected")
	}
}
