package models

import (
	"time"

	"github.com/uptrace/bun"
)

type Section struct {
	bun.BaseModel `bun:"table:sections"`

	ID              string     `json:"id" bun:"column:id,pk"`
	Title           string     `json:"title" bun:"column:title,notnull"`
	Description     string     `json:"description" bun:"column:description,notnull"`
	Price           float64    `json:"price" bun:"column:price,notnull"`
	Teacher         string     `json:"teacher" bun:"column:teacher,notnull"`
	TeacherID       string     `json:"teacherId" bun:"column:teacher_id,notnull"`
	Category        string     `json:"category" bun:"column:category,notnull"`
	DurationMinutes int        `json:"durationMinutes" bun:"column:duration_minutes,notnull"`
	Capacity        int        `json:"capacity" bun:"column:capacity,notnull"`
	Questions       []string   `json:"questions" bun:"column:questions,type:jsonb,default:'[]'"`
	Status          string     `json:"status" bun:"column:status,notnull,default:'pending'"`
	ScheduledAt     *time.Time `json:"scheduledAt,omitempty" bun:"column:scheduled_at"`
	CreatedAt       time.Time  `json:"createdAt" bun:"column:created_at,default:current_timestamp"`
	UpdatedAt       time.Time  `json:"updatedAt" bun:"column:updated_at,default:current_timestamp"`
}
