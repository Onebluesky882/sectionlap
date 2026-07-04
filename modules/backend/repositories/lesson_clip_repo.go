package repositories

import (
	"context"

	"github.com/uptrace/bun"

	"sectionlap/backend/models"
)

type LessonClipRepository interface {
	GetByLessonID(ctx context.Context, lessonID string) ([]models.LessonClip, error)
	GetByID(ctx context.Context, id string) (*models.LessonClip, error)
	Create(ctx context.Context, clip *models.LessonClip) error
	Update(ctx context.Context, clip *models.LessonClip) error
	Delete(ctx context.Context, id string) error
}

type lessonClipRepository struct {
	db *bun.DB
}

func NewLessonClipRepository(db *bun.DB) LessonClipRepository {
	return &lessonClipRepository{db: db}
}

func (r *lessonClipRepository) GetByLessonID(ctx context.Context, lessonID string) ([]models.LessonClip, error) {
	var clips []models.LessonClip
	err := r.db.NewSelect().Model(&clips).Where("lesson_id = ?", lessonID).OrderExpr("order_index ASC").Scan(ctx)
	return clips, err
}

func (r *lessonClipRepository) GetByID(ctx context.Context, id string) (*models.LessonClip, error) {
	var clip models.LessonClip
	err := r.db.NewSelect().Model(&clip).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return nil, err
	}
	return &clip, nil
}

func (r *lessonClipRepository) Create(ctx context.Context, clip *models.LessonClip) error {
	_, err := r.db.NewInsert().Model(clip).Exec(ctx)
	return err
}

func (r *lessonClipRepository) Update(ctx context.Context, clip *models.LessonClip) error {
	_, err := r.db.NewUpdate().Model(clip).Where("id = ?", clip.ID).Exec(ctx)
	return err
}

func (r *lessonClipRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.NewDelete().TableExpr("lesson_clips").Where("id = ?", id).Exec(ctx)
	return err
}
