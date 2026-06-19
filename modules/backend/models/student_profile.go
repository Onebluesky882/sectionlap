package models

import "github.com/uptrace/bun"

type StudentProfile struct {
	bun.BaseModel `bun:"table:student_profiles"`

	StudentID string   `json:"studentId" bun:"column:student_id,pk"`
	Nickname  string   `json:"nickname" bun:"column:nickname,notnull"`
	Age       int      `json:"age" bun:"column:age,notnull"`
	Interests []string `json:"interests" bun:"column:interests,array"`
}
