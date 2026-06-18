package repositories

import (
	"context"

	"github.com/uptrace/bun"

	"sectionlap/backend/models"
)

type FeedbackRepository interface {
	Create(ctx context.Context, feedback *models.Feedback) error
	List(ctx context.Context) ([]models.Feedback, error)
}

type feedbackRepository struct {
	db *bun.DB
}

func NewFeedbackRepository(db *bun.DB) FeedbackRepository {
	return &feedbackRepository{db: db}
}

func (r *feedbackRepository) Create(ctx context.Context, feedback *models.Feedback) error {
	_, err := r.db.NewInsert().Model(feedback).Exec(ctx)
	return err
}

func (r *feedbackRepository) List(ctx context.Context) ([]models.Feedback, error) {
	var items []models.Feedback
	err := r.db.NewSelect().Model(&items).OrderExpr("created_at DESC").Scan(ctx)
	return items, err
}
