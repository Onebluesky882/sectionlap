package repositories

import (
	"context"

	"github.com/uptrace/bun"

	"sectionlap/backend/models"
)

type TeacherWalletRepository interface {
	Upsert(ctx context.Context, wallet *models.TeacherWallet) error
	GetByTeacherID(ctx context.Context, teacherID string) (*models.TeacherWallet, error)
}

type teacherWalletRepository struct {
	db *bun.DB
}

func NewTeacherWalletRepository(db *bun.DB) TeacherWalletRepository {
	return &teacherWalletRepository{db: db}
}

func (r *teacherWalletRepository) Upsert(ctx context.Context, wallet *models.TeacherWallet) error {
	_, err := r.db.NewInsert().Model(wallet).
		On("CONFLICT (teacher_id) DO UPDATE SET qr_code_r2_key = EXCLUDED.qr_code_r2_key, bank_account_name_th = EXCLUDED.bank_account_name_th, bank_account_number = EXCLUDED.bank_account_number, updated_at = EXCLUDED.updated_at").
		Exec(ctx)
	return err
}

func (r *teacherWalletRepository) GetByTeacherID(ctx context.Context, teacherID string) (*models.TeacherWallet, error) {
	var w models.TeacherWallet
	err := r.db.NewSelect().Model(&w).Where("teacher_id = ?", teacherID).Scan(ctx)
	if err != nil {
		return nil, err
	}
	return &w, nil
}
