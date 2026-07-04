package models

import (
	"time"

	"github.com/uptrace/bun"
)

type Lesson struct {
	bun.BaseModel `bun:"table:lessons"`

	ID         string    `json:"id" bun:"column:id,pk"`
	SectionID  string    `json:"sectionId" bun:"column:section_id,notnull"`
	Title      string    `json:"title" bun:"column:title,notnull"`
	OrderIndex int       `json:"orderIndex" bun:"column:order_index,notnull"`
	CreatedAt  time.Time `json:"createdAt" bun:"column:created_at,default:current_timestamp"`
	UpdatedAt  time.Time `json:"updatedAt" bun:"column:updated_at,default:current_timestamp"`
}
