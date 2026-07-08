package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"sectionlap/backend/models"
	"sectionlap/backend/repositories"
)

type BookingError string

const (
	ErrAlreadyBooked BookingError = "ALREADY_BOOKED"
	ErrCapacityFull  BookingError = "CAPACITY_FULL"
)

type CreateBookingResult struct {
	Booking *models.Booking `json:"booking"`
	Error   *BookingError   `json:"error"`
}

type BookingService interface {
	Create(ctx context.Context, sectionID, studentID string, answers []string) (*CreateBookingResult, error)
	Pay(ctx context.Context, bookingID, studentID string) (*models.Booking, error)
	Fail(ctx context.Context, bookingID string) (*models.Booking, error)
	Retry(ctx context.Context, bookingID, studentID string) (*models.Booking, error)
	Cancel(ctx context.Context, bookingID, studentID string) (*models.Booking, error)
	ListByStudent(ctx context.Context, studentID string) ([]models.Booking, error)
	VerifySlip(ctx context.Context, bookingID, studentID, qrCode string, slipImageKey *string) (*models.Booking, error)
}

type bookingService struct {
	bookingRepo repositories.BookingRepository
	sectionRepo repositories.SectionRepository
	walletRepo  repositories.TeacherWalletRepository
	slip2go     *Slip2GoClient
}

func NewBookingService(
	bookingRepo repositories.BookingRepository,
	sectionRepo repositories.SectionRepository,
	walletRepo repositories.TeacherWalletRepository,
	slip2go *Slip2GoClient,
) BookingService {
	return &bookingService{
		bookingRepo: bookingRepo,
		sectionRepo: sectionRepo,
		walletRepo:  walletRepo,
		slip2go:     slip2go,
	}
}

func (s *bookingService) Create(ctx context.Context, sectionID, studentID string, answers []string) (*CreateBookingResult, error) {
	existing, err := s.bookingRepo.GetBySectionAndStudent(ctx, sectionID, studentID)
	if err == nil && existing != nil {
		e := ErrAlreadyBooked
		return &CreateBookingResult{Booking: existing, Error: &e}, nil
	}

	section, err := s.sectionRepo.GetByID(ctx, sectionID)
	if err != nil {
		return nil, fmt.Errorf("section not found: %w", err)
	}

	if len(section.Questions) > 0 {
		if len(answers) != len(section.Questions) {
			return nil, fmt.Errorf("must answer all %d questions", len(section.Questions))
		}
		for _, a := range answers {
			if len([]rune(a)) == 0 {
				return nil, fmt.Errorf("all answers must be non-empty")
			}
		}
	}

	activeCount, err := s.bookingRepo.CountActive(ctx, sectionID)
	if err != nil {
		return nil, err
	}
	if activeCount >= section.Capacity {
		e := ErrCapacityFull
		return &CreateBookingResult{Booking: nil, Error: &e}, nil
	}

	if answers == nil {
		answers = []string{}
	}

	booking := &models.Booking{
		ID:        uuid.New().String(),
		SectionID: sectionID,
		StudentID: studentID,
		Status:    models.PaymentPending,
		Answers:   answers,
		BookedAt:  time.Now().UTC(),
	}
	if err := s.bookingRepo.Create(ctx, booking); err != nil {
		return nil, err
	}
	return &CreateBookingResult{Booking: booking, Error: nil}, nil
}

func (s *bookingService) Pay(ctx context.Context, bookingID, studentID string) (*models.Booking, error) {
	booking, err := s.bookingRepo.GetByID(ctx, bookingID)
	if err != nil {
		return nil, fmt.Errorf("booking not found: %w", err)
	}
	if booking.StudentID != studentID {
		return nil, fmt.Errorf("forbidden")
	}
	if booking.Status != models.PaymentPending {
		return nil, fmt.Errorf("booking is not in pending state")
	}

	now := time.Now().UTC()
	booking.Status = models.PaymentPaid
	booking.PaidAt = &now

	if err := s.bookingRepo.Update(ctx, booking); err != nil {
		return nil, err
	}
	return booking, nil
}

func (s *bookingService) Fail(ctx context.Context, bookingID string) (*models.Booking, error) {
	booking, err := s.bookingRepo.GetByID(ctx, bookingID)
	if err != nil {
		return nil, fmt.Errorf("booking not found: %w", err)
	}
	if booking.Status != models.PaymentPending {
		return nil, fmt.Errorf("booking is not in pending state")
	}

	booking.Status = models.PaymentFailed
	if err := s.bookingRepo.Update(ctx, booking); err != nil {
		return nil, err
	}
	return booking, nil
}

func (s *bookingService) Retry(ctx context.Context, bookingID, studentID string) (*models.Booking, error) {
	booking, err := s.bookingRepo.GetByID(ctx, bookingID)
	if err != nil {
		return nil, fmt.Errorf("booking not found: %w", err)
	}
	if booking.StudentID != studentID {
		return nil, fmt.Errorf("forbidden")
	}
	if booking.Status != models.PaymentFailed {
		return nil, fmt.Errorf("booking is not in failed state")
	}

	booking.Status = models.PaymentPending
	booking.PaidAt = nil
	if err := s.bookingRepo.Update(ctx, booking); err != nil {
		return nil, err
	}
	return booking, nil
}

func (s *bookingService) Cancel(ctx context.Context, bookingID, studentID string) (*models.Booking, error) {
	booking, err := s.bookingRepo.GetByID(ctx, bookingID)
	if err != nil {
		return nil, fmt.Errorf("booking not found: %w", err)
	}
	if booking.StudentID != studentID {
		return nil, fmt.Errorf("forbidden")
	}
	if booking.Status == models.PaymentPaid {
		return nil, fmt.Errorf("cannot cancel a paid booking")
	}

	booking.Status = models.PaymentFailed
	if err := s.bookingRepo.Update(ctx, booking); err != nil {
		return nil, err
	}
	return booking, nil
}

func (s *bookingService) ListByStudent(ctx context.Context, studentID string) ([]models.Booking, error) {
	return s.bookingRepo.GetByStudentID(ctx, studentID)
}

func (s *bookingService) VerifySlip(ctx context.Context, bookingID, studentID, qrCode string, slipImageKey *string) (*models.Booking, error) {
	booking, err := s.bookingRepo.GetByID(ctx, bookingID)
	if err != nil {
		return nil, fmt.Errorf("booking not found: %w", err)
	}
	if booking.StudentID != studentID {
		return nil, fmt.Errorf("forbidden")
	}
	if booking.Status != models.PaymentPending {
		return nil, fmt.Errorf("booking is not in pending state")
	}

	section, err := s.sectionRepo.GetByID(ctx, booking.SectionID)
	if err != nil {
		return nil, fmt.Errorf("section not found: %w", err)
	}

	wallet, err := s.walletRepo.GetByTeacherID(ctx, section.TeacherID)
	if err != nil {
		return nil, fmt.Errorf("ครูยังไม่ได้ตั้งค่าช่องทางรับเงิน กรุณาลองใหม่ภายหลัง")
	}

	if s.slip2go == nil {
		return nil, fmt.Errorf("slip2go is not configured")
	}

	now := time.Now().UTC()
	booking.DeclaredAt = &now
	booking.PaymentSlipR2Key = slipImageKey

	// Slip2Go's own checkCondition matching doesn't reliably handle
	// PromptPay-proxy receivers or truncated names (see slip2go_client.go
	// comments) — decode the slip, then match name/last-4/amount ourselves.
	info, err := s.slip2go.GetSlipInfo(ctx, qrCode)
	if info != nil {
		raw := string(info.Raw)
		booking.SlipVerificationRaw = &raw
	}
	if err != nil {
		_ = s.bookingRepo.Update(ctx, booking)
		return nil, err
	}
	if !info.MatchesWallet(wallet.BankAccountNumber) {
		_ = s.bookingRepo.Update(ctx, booking)
		return nil, fmt.Errorf("เลขบัญชีผู้รับไม่ตรงกับครู")
	}
	if info.Amount != section.Price {
		_ = s.bookingRepo.Update(ctx, booking)
		return nil, fmt.Errorf("ยอดเงินไม่ตรง (โอน %.2f แต่ราคาคือ %.2f)", info.Amount, section.Price)
	}

	booking.Status = models.PaymentPaid
	booking.PaidAt = &now
	if err := s.bookingRepo.Update(ctx, booking); err != nil {
		return nil, err
	}
	return booking, nil
}
