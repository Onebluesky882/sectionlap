package models

import (
	"time"

	"github.com/uptrace/bun"
)

type TeacherVerificationStatus string

const (
	VerificationPending  TeacherVerificationStatus = "pending"
	VerificationApproved TeacherVerificationStatus = "approved"
	VerificationRejected TeacherVerificationStatus = "rejected"
)

type TeacherProfile struct {
	bun.BaseModel `bun:"table:teacher_profiles"`

	TeacherID   string    `json:"teacherId" bun:"column:teacher_id,pk"`
	FullName    string    `json:"fullName" bun:"column:full_name,notnull"`
	IDCard      string    `json:"idCard" bun:"column:id_card,notnull"`
	Phone       string    `json:"phone" bun:"column:phone,notnull"`
	Expertise   string    `json:"expertise" bun:"column:expertise,notnull"`
	SubmittedAt time.Time `json:"submittedAt" bun:"column:submitted_at"`

	IdentityDocR2Key string                     `json:"identityDocR2Key" bun:"column:identity_doc_r2_key"`
	VerificationStatus TeacherVerificationStatus `json:"verificationStatus" bun:"column:verification_status,notnull,default:'pending'"`
	RejectionReason  *string                     `json:"rejectionReason,omitempty" bun:"column:rejection_reason"`

	AIExtractedName *string  `json:"aiExtractedName,omitempty" bun:"column:ai_extracted_name"`
	AIExtractedDOB  *string  `json:"aiExtractedDob,omitempty" bun:"column:ai_extracted_dob"`
	AIDocumentType  *string  `json:"aiDocumentType,omitempty" bun:"column:ai_document_type"`
	AIConfidence    *float64 `json:"aiConfidence,omitempty" bun:"column:ai_confidence"`
	AIVerdict       *string  `json:"aiVerdict,omitempty" bun:"column:ai_verdict"`
	AIRawResponse   *string  `json:"-" bun:"column:ai_raw_response"`

	ReviewedBy *string    `json:"reviewedBy,omitempty" bun:"column:reviewed_by"`
	ReviewedAt *time.Time `json:"reviewedAt,omitempty" bun:"column:reviewed_at"`

	// DocumentURL is a transient presigned GET URL, never persisted — populated
	// by controllers before returning the profile to a client that's allowed
	// to view the document (the teacher themselves, or an admin).
	DocumentURL string `json:"documentUrl,omitempty" bun:"-"`
}
