package models

import (
	"time"

	"github.com/uptrace/bun"
)

type TeacherProfile struct {
	bun.BaseModel `bun:"table:teacher_profiles"`

	TeacherID   string    `json:"teacherId" bun:"column:teacher_id,pk"`
	FullName    string    `json:"fullName" bun:"column:full_name,notnull"`
	IDCard      string    `json:"idCard" bun:"column:id_card,notnull"`
	Phone       string    `json:"phone" bun:"column:phone,notnull"`
	Expertise   string    `json:"expertise" bun:"column:expertise,notnull"`
	SubmittedAt time.Time `json:"submittedAt" bun:"column:submitted_at"`
}
