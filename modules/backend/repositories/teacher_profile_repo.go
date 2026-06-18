package repositories

import (
	"context"

	"github.com/uptrace/bun"

	"sectionlap/backend/models"
)

type TeacherProfileRepository interface {
	Upsert(ctx context.Context, profile *models.TeacherProfile) error
	GetByTeacherID(ctx context.Context, teacherID string) (*models.TeacherProfile, error)
}

type teacherProfileRepository struct {
	db *bun.DB
}

func NewTeacherProfileRepository(db *bun.DB) TeacherProfileRepository {
	return &teacherProfileRepository{db: db}
}

func (r *teacherProfileRepository) Upsert(ctx context.Context, profile *models.TeacherProfile) error {
	_, err := r.db.NewInsert().Model(profile).
		On("CONFLICT (teacher_id) DO UPDATE SET full_name = EXCLUDED.full_name, id_card = EXCLUDED.id_card, phone = EXCLUDED.phone, expertise = EXCLUDED.expertise, submitted_at = EXCLUDED.submitted_at").
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
