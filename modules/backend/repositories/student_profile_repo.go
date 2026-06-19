package repositories

import (
	"context"

	"github.com/uptrace/bun"

	"sectionlap/backend/models"
)

type StudentProfileRepository interface {
	Upsert(ctx context.Context, profile *models.StudentProfile) error
	GetByStudentID(ctx context.Context, studentID string) (*models.StudentProfile, error)
}

type studentProfileRepository struct {
	db *bun.DB
}

func NewStudentProfileRepository(db *bun.DB) StudentProfileRepository {
	return &studentProfileRepository{db: db}
}

func (r *studentProfileRepository) Upsert(ctx context.Context, profile *models.StudentProfile) error {
	_, err := r.db.NewInsert().Model(profile).
		On("CONFLICT (student_id) DO UPDATE SET nickname = EXCLUDED.nickname, age = EXCLUDED.age, interests = EXCLUDED.interests").
		Exec(ctx)
	return err
}

func (r *studentProfileRepository) GetByStudentID(ctx context.Context, studentID string) (*models.StudentProfile, error) {
	var p models.StudentProfile
	err := r.db.NewSelect().Model(&p).Where("student_id = ?", studentID).Scan(ctx)
	if err != nil {
		return nil, err
	}
	return &p, nil
}
