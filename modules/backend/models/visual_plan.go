package models

import (
	"time"

	"github.com/uptrace/bun"
)

type VisualPlan struct {
	bun.BaseModel `bun:"table:visual_plans"`

	ID             string    `json:"id"             bun:"column:id,pk"`
	UserID         string    `json:"userId"         bun:"column:user_id,notnull"`
	Title          string    `json:"title"          bun:"column:title,notnull"`
	PromptText     string    `json:"promptText"     bun:"column:prompt_text,notnull"`
	StructuredJSON string    `json:"-"              bun:"column:structured_json,type:jsonb,notnull"`
	GifURL         string    `json:"gifUrl"         bun:"column:gif_url,notnull"`
	Mp4URL         string    `json:"mp4Url"         bun:"column:mp4_url,notnull"`
	R2KeyGif       string    `json:"-"              bun:"column:r2_key_gif,notnull"`
	R2KeyMp4       string    `json:"-"              bun:"column:r2_key_mp4,notnull"`
	CreatedAt      time.Time `json:"createdAt"      bun:"column:created_at,default:current_timestamp"`
}
