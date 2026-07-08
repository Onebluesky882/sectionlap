package repositories

import (
	"context"
	"time"

	"github.com/uptrace/bun"

	"sectionlap/backend/models"
)

type TeacherProfileRepository interface {
	Upsert(ctx context.Context, profile *models.TeacherProfile) error
	GetByTeacherID(ctx context.Context, teacherID string) (*models.TeacherProfile, error)
	ListAll(ctx context.Context) ([]models.TeacherProfile, error)
	UpdateVerificationStatus(ctx context.Context, teacherID string, status models.TeacherVerificationStatus, rejectionReason *string, reviewerID string) error
}

type teacherProfileRepository struct {
	db *bun.DB
}

func NewTeacherProfileRepository(db *bun.DB) TeacherProfileRepository {
	return &teacherProfileRepository{db: db}
}

func (r *teacherProfileRepository) Upsert(ctx context.Context, profile *models.TeacherProfile) error {
	_, err := r.db.NewInsert().Model(profile).
		On("CONFLICT (teacher_id) DO UPDATE SET "+
			"full_name = EXCLUDED.full_name, id_card = EXCLUDED.id_card, phone = EXCLUDED.phone, "+
			"expertise = EXCLUDED.expertise, submitted_at = EXCLUDED.submitted_at, "+
			"identity_doc_r2_key = EXCLUDED.identity_doc_r2_key, verification_status = EXCLUDED.verification_status, "+
			"rejection_reason = EXCLUDED.rejection_reason, ai_extracted_name = EXCLUDED.ai_extracted_name, "+
			"ai_extracted_dob = EXCLUDED.ai_extracted_dob, ai_document_type = EXCLUDED.ai_document_type, "+
			"ai_confidence = EXCLUDED.ai_confidence, ai_verdict = EXCLUDED.ai_verdict, "+
			"ai_raw_response = EXCLUDED.ai_raw_response, reviewed_by = EXCLUDED.reviewed_by, "+
			"reviewed_at = EXCLUDED.reviewed_at").
		Exec(ctx)
	return err
}

func (r *teacherProfileRepository) GetByTeacherID(ctx context.Context, teacherID string) (*models.TeacherProfile, error) {
	var p models.TeacherProfile
	err := r.db.NewSelect().Model(&p).Where("teacher_id = ?", teacherID).Scan(ctx)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *teacherProfileRepository) ListAll(ctx context.Context) ([]models.TeacherProfile, error) {
	var profiles []models.TeacherProfile
	err := r.db.NewSelect().Model(&profiles).OrderExpr("submitted_at DESC").Scan(ctx)
	return profiles, err
}

func (r *teacherProfileRepository) UpdateVerificationStatus(ctx context.Context, teacherID string, status models.TeacherVerificationStatus, rejectionReason *string, reviewerID string) error {
	now := time.Now()
	_, err := r.db.NewUpdate().Model((*models.TeacherProfile)(nil)).
		Set("verification_status = ?", status).
		Set("rejection_reason = ?", rejectionReason).
		Set("reviewed_by = ?", reviewerID).
		Set("reviewed_at = ?", now).
		Where("teacher_id = ?", teacherID).
		Exec(ctx)
	return err
}
