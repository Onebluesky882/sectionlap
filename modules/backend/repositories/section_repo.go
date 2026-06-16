package repositories

import (
	"context"

	"github.com/uptrace/bun"

	"sectionlap/backend/models"
)

type SectionRepository interface {
	GetAll(ctx context.Context) ([]models.Section, error)
	GetByID(ctx context.Context, id string) (*models.Section, error)
	GetByTeacherID(ctx context.Context, teacherID string) ([]models.Section, error)
	Create(ctx context.Context, section *models.Section) error
	Update(ctx context.Context, section *models.Section) error
}

type sectionRepository struct {
	db *bun.DB
}

func NewSectionRepository(db *bun.DB) SectionRepository {
	return &sectionRepository{db: db}
}

func (r *sectionRepository) GetAll(ctx context.Context) ([]models.Section, error) {
	var sections []models.Section
	err := r.db.NewSelect().Model(&sections).Scan(ctx)
	return sections, err
}

func (r *sectionRepository) GetByID(ctx context.Context, id string) (*models.Section, error) {
	var section models.Section
	err := r.db.NewSelect().Model(&section).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return nil, err
	}
	return &section, nil
}

func (r *sectionRepository) GetByTeacherID(ctx context.Context, teacherID string) ([]models.Section, error) {
	var sections []models.Section
	err := r.db.NewSelect().Model(&sections).Where("teacher_id = ?", teacherID).Scan(ctx)
	return sections, err
}

func (r *sectionRepository) Create(ctx context.Context, section *models.Section) error {
	_, err := r.db.NewInsert().Model(section).Exec(ctx)
	return err
}

func (r *sectionRepository) Update(ctx context.Context, section *models.Section) error {
	_, err := r.db.NewUpdate().Model(section).Where("id = ?", section.ID).Exec(ctx)
	return err
}
