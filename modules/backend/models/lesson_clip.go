package models

import (
	"time"

	"github.com/uptrace/bun"
)

type LessonClip struct {
	bun.BaseModel `bun:"table:lesson_clips"`

	ID          string    `json:"id" bun:"column:id,pk"`
	LessonID    string    `json:"lessonId" bun:"column:lesson_id,notnull"`
	OrderIndex  int       `json:"orderIndex" bun:"column:order_index,notnull"`
	R2KeyPrefix string    `json:"r2KeyPrefix" bun:"column:r2_key_prefix,notnull"`
	ChunkCount  int       `json:"chunkCount" bun:"column:chunk_count,notnull,default:0"`
	Status      string    `json:"status" bun:"column:status,notnull,default:'ready'"`
	CreatedAt   time.Time `json:"createdAt" bun:"column:created_at,default:current_timestamp"`
	UpdatedAt   time.Time `json:"updatedAt" bun:"column:updated_at,default:current_timestamp"`
}
