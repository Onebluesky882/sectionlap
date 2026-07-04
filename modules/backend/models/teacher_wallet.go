package models

import (
	"time"

	"github.com/uptrace/bun"
)

type TeacherWallet struct {
	bun.BaseModel `bun:"table:teacher_wallets"`

	TeacherID         string    `json:"teacherId" bun:"column:teacher_id,pk"`
	QrCodeR2Key       string    `json:"qrCodeR2Key" bun:"column:qr_code_r2_key,notnull,default:''"`
	QrCodeURL         string    `json:"qrCodeUrl,omitempty" bun:"-"`
	BankAccountNameTH string    `json:"bankAccountNameTh" bun:"column:bank_account_name_th,notnull,default:''"`
	BankAccountNumber string    `json:"bankAccountNumber" bun:"column:bank_account_number,notnull,default:''"`
	UpdatedAt         time.Time `json:"updatedAt" bun:"column:updated_at,default:current_timestamp"`
}
