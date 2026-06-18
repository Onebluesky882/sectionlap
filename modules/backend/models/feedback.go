package models

import "time"

type FeedbackCategory string

const (
	FeedbackGeneral     FeedbackCategory = "general"
	FeedbackBug         FeedbackCategory = "bug"
	FeedbackSuggestion  FeedbackCategory = "suggestion"
	FeedbackPerformance FeedbackCategory = "performance"
)

type Feedback struct {
	ID        string           `json:"id" bun:"column:id,pk"`
	UserID    string           `json:"userId" bun:"column:user_id,notnull"`
	Platform  string           `json:"platform" bun:"column:platform,notnull"`
	Category  FeedbackCategory `json:"category" bun:"column:category,notnull,default:'general'"`
	Rating    int              `json:"rating" bun:"column:rating,notnull"`
	Message   string           `json:"message" bun:"column:message,notnull"`
	CreatedAt time.Time        `json:"createdAt" bun:"column:created_at,notnull,default:current_timestamp"`
}
