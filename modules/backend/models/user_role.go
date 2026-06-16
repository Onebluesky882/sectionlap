package models

import (
	"github.com/uptrace/bun"
)

type UserRoleType string

const (
	RoleTeacher UserRoleType = "teacher"
	RoleStudent UserRoleType = "student"
)

type UserRole struct {
	bun.BaseModel `bun:"table:user_roles"`

	UserID string       `json:"userId" bun:"column:user_id,pk"`
	Role   UserRoleType `json:"role" bun:"column:role,notnull"`
}
