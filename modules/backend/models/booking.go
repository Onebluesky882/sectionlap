package models

import (
	"time"

	"github.com/uptrace/bun"
)

type PaymentStatus string

const (
	PaymentPending PaymentStatus = "pending"
	PaymentPaid    PaymentStatus = "paid"
	PaymentFailed  PaymentStatus = "failed"
)

type Booking struct {
	bun.BaseModel `bun:"table:bookings"`

	ID        string        `json:"id" bun:"column:id,pk"`
	SectionID string        `json:"sectionId" bun:"column:section_id,notnull"`
	StudentID string        `json:"studentId" bun:"column:student_id,notnull"`
	Status    PaymentStatus `json:"status" bun:"column:status,notnull,default:'pending'"`
	BookedAt  time.Time     `json:"bookedAt" bun:"column:booked_at,notnull,default:current_timestamp"`
	PaidAt    *time.Time    `json:"paidAt,omitempty" bun:"column:paid_at"`
}
