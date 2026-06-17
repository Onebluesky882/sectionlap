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
	Create(ctx context.Context, sectionID, studentID string) (*CreateBookingResult, error)
	Pay(ctx context.Context, bookingID, studentID string) (*models.Booking, error)
	Fail(ctx context.Context, bookingID string) (*models.Booking, error)
	Retry(ctx context.Context, bookingID, studentID string) (*models.Booking, error)
	Cancel(ctx context.Context, bookingID, studentID string) (*models.Booking, error)
	ListByStudent(ctx context.Context, studentID string) ([]models.Booking, error)
}

type bookingService struct {
	bookingRepo repositories.BookingRepository
	sectionRepo repositories.SectionRepository
}

func NewBookingService(bookingRepo repositories.BookingRepository, sectionRepo repositories.SectionRepository) BookingService {
	return &bookingService{bookingRepo: bookingRepo, sectionRepo: sectionRepo}
}

func (s *bookingService) Create(ctx context.Context, sectionID, studentID string) (*CreateBookingResult, error) {
	existing, err := s.bookingRepo.GetBySectionAndStudent(ctx, sectionID, studentID)
	if err == nil && existing != nil {
		e := ErrAlreadyBooked
		return &CreateBookingResult{Booking: existing, Error: &e}, nil
	}

	section, err := s.sectionRepo.GetByID(ctx, sectionID)
	if err != nil {
		return nil, fmt.Errorf("section not found: %w", err)
	}

	activeCount, err := s.bookingRepo.CountActive(ctx, sectionID)
	if err != nil {
		return nil, err
	}
	if activeCount >= section.Capacity {
		e := ErrCapacityFull
		return &CreateBookingResult{Booking: nil, Error: &e}, nil
	}

	booking := &models.Booking{
		ID:        uuid.New().String(),
		SectionID: sectionID,
		StudentID: studentID,
		Status:    models.PaymentPending,
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
