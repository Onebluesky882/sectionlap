package repositories

import (
	"context"

	"github.com/uptrace/bun"

	"sectionlap/backend/models"
)

type LessonRepository interface {
	GetBySectionID(ctx context.Context, sectionID string) ([]models.Lesson, error)
	GetByID(ctx context.Context, id string) (*models.Lesson, error)
	Create(ctx context.Context, lesson *models.Lesson) error
	Update(ctx context.Context, lesson *models.Lesson) error
	Delete(ctx context.Context, id string) error
	UpdateOrder(ctx context.Context, orderedIDs []string) error
}

type lessonRepository struct {
	db *bun.DB
}

func NewLessonRepository(db *bun.DB) LessonRepository {
	return &lessonRepository{db: db}
}

func (r *lessonRepository) GetBySectionID(ctx context.Context, sectionID string) ([]models.Lesson, error) {
	var lessons []models.Lesson
	err := r.db.NewSelect().Model(&lessons).Where("section_id = ?", sectionID).OrderExpr("order_index ASC").Scan(ctx)
	return lessons, err
}

func (r *lessonRepository) GetByID(ctx context.Context, id string) (*models.Lesson, error) {
	var lesson models.Lesson
	err := r.db.NewSelect().Model(&lesson).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return nil, err
	}
	return &lesson, nil
}

func (r *lessonRepository) Create(ctx context.Context, lesson *models.Lesson) error {
	_, err := r.db.NewInsert().Model(lesson).Exec(ctx)
	return err
}

func (r *lessonRepository) Update(ctx context.Context, lesson *models.Lesson) error {
	_, err := r.db.NewUpdate().Model(lesson).Where("id = ?", lesson.ID).Exec(ctx)
	return err
}

func (r *lessonRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.NewDelete().TableExpr("lessons").Where("id = ?", id).Exec(ctx)
	return err
}

func (r *lessonRepository) UpdateOrder(ctx context.Context, orderedIDs []string) error {
	for i, id := range orderedIDs {
		if _, err := r.db.NewUpdate().TableExpr("lessons").
			Set("order_index = ?", i).
			Set("updated_at = current_timestamp").
			Where("id = ?", id).
			Exec(ctx); err != nil {
			return err
		}
	}
	return nil
}
