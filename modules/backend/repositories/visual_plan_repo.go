package repositories

import (
	"context"

	"github.com/uptrace/bun"

	"sectionlap/backend/models"
)

type VisualPlanRepository struct {
	db *bun.DB
}

func NewVisualPlanRepository(db *bun.DB) *VisualPlanRepository {
	return &VisualPlanRepository{db: db}
}

func (r *VisualPlanRepository) Create(ctx context.Context, plan *models.VisualPlan) error {
	_, err := r.db.NewInsert().Model(plan).Exec(ctx)
	return err
}

func (r *VisualPlanRepository) ListByUser(ctx context.Context, userID string) ([]models.VisualPlan, error) {
	var plans []models.VisualPlan
	err := r.db.NewSelect().
		Model(&plans).
		Where("user_id = ?", userID).
		OrderExpr("created_at DESC").
		Scan(ctx)
	return plans, err
}

func (r *VisualPlanRepository) GetByID(ctx context.Context, id string) (*models.VisualPlan, error) {
	plan := &models.VisualPlan{}
	err := r.db.NewSelect().Model(plan).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return nil, err
	}
	return plan, nil
}

func (r *VisualPlanRepository) Delete(ctx context.Context, id, userID string) error {
	_, err := r.db.NewDelete().
		Model((*models.VisualPlan)(nil)).
		Where("id = ? AND user_id = ?", id, userID).
		Exec(ctx)
	return err
}
