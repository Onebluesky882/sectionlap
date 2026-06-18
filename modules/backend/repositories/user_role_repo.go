package repositories

import (
	"context"

	"github.com/uptrace/bun"

	"sectionlap/backend/models"
)

type UserRoleRepository interface {
	GetByUserID(ctx context.Context, userID string) (*models.UserRole, error)
	Upsert(ctx context.Context, userRole *models.UserRole) error
	SetVerified(ctx context.Context, userID string, verified bool) error
}

type userRoleRepository struct {
	db *bun.DB
}

func NewUserRoleRepository(db *bun.DB) UserRoleRepository {
	return &userRoleRepository{db: db}
}

func (r *userRoleRepository) GetByUserID(ctx context.Context, userID string) (*models.UserRole, error) {
	var ur models.UserRole
	err := r.db.NewSelect().Model(&ur).Where("user_id = ?", userID).Scan(ctx)
	if err != nil {
		return nil, err
	}
	return &ur, nil
}

func (r *userRoleRepository) Upsert(ctx context.Context, userRole *models.UserRole) error {
	_, err := r.db.NewInsert().Model(userRole).
		On("CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role").
		Exec(ctx)
	return err
}

func (r *userRoleRepository) SetVerified(ctx context.Context, userID string, verified bool) error {
	_, err := r.db.NewUpdate().Model((*models.UserRole)(nil)).
		Set("is_verified = ?", verified).
		Where("user_id = ?", userID).
		Exec(ctx)
	return err
}
