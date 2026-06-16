package services_test

import (
	"context"
	"testing"
	"time"

	"sectionlap/backend/models"
	"sectionlap/backend/services"
)

type mockSectionRepo struct {
	sections map[string]*models.Section
}

func (m *mockSectionRepo) GetAll(ctx context.Context) ([]models.Section, error) {
	result := make([]models.Section, 0, len(m.sections))
	for _, s := range m.sections {
		result = append(result, *s)
	}
	return result, nil
}

func (m *mockSectionRepo) GetByID(ctx context.Context, id string) (*models.Section, error) {
	if s, ok := m.sections[id]; ok {
		return s, nil
	}
	return nil, nil
}

func (m *mockSectionRepo) GetByTeacherID(ctx context.Context, teacherID string) ([]models.Section, error) {
	return nil, nil
}

func (m *mockSectionRepo) Create(ctx context.Context, section *models.Section) error {
	m.sections[section.ID] = section
	return nil
}

func (m *mockSectionRepo) Update(ctx context.Context, section *models.Section) error {
	m.sections[section.ID] = section
	return nil
}

type mockBookingRepo struct {
	bookings map[string]*models.Booking
}

func (m *mockBookingRepo) GetByID(ctx context.Context, id string) (*models.Booking, error) {
	if b, ok := m.bookings[id]; ok {
		return b, nil
	}
	return nil, nil
}

func (m *mockBookingRepo) GetByStudentID(ctx context.Context, studentID string) ([]models.Booking, error) {
	var result []models.Booking
	for _, b := range m.bookings {
		if b.StudentID == studentID {
			result = append(result, *b)
		}
	}
	return result, nil
}

func (m *mockBookingRepo) GetBySectionAndStudent(ctx context.Context, sectionID, studentID string) (*models.Booking, error) {
	for _, b := range m.bookings {
		if b.SectionID == sectionID && b.StudentID == studentID && b.Status != models.PaymentFailed {
			return b, nil
		}
	}
	return nil, nil
}

func (m *mockBookingRepo) CountActive(ctx context.Context, sectionID string) (int, error) {
	count := 0
	for _, b := range m.bookings {
		if b.SectionID == sectionID && b.Status != models.PaymentFailed {
			count++
		}
	}
	return count, nil
}

func (m *mockBookingRepo) Create(ctx context.Context, booking *models.Booking) error {
	m.bookings[booking.ID] = booking
	return nil
}

func (m *mockBookingRepo) Update(ctx context.Context, booking *models.Booking) error {
	m.bookings[booking.ID] = booking
	return nil
}

func (m *mockBookingRepo) IsEnrolled(ctx context.Context, sectionID, studentID string) (bool, error) {
	for _, b := range m.bookings {
		if b.SectionID == sectionID && b.StudentID == studentID && b.Status == models.PaymentPaid {
			return true, nil
		}
	}
	return false, nil
}

func newTestService() (services.BookingService, *mockBookingRepo, *mockSectionRepo) {
	sectionRepo := &mockSectionRepo{
		sections: map[string]*models.Section{
			"section-1": {
				ID:       "section-1",
				Capacity: 2,
			},
		},
	}
	bookingRepo := &mockBookingRepo{bookings: map[string]*models.Booking{}}
	svc := services.NewBookingService(bookingRepo, sectionRepo)
	return svc, bookingRepo, sectionRepo
}

func TestCreateBooking_Success(t *testing.T) {
	svc, _, _ := newTestService()
	ctx := context.Background()

	result, err := svc.Create(ctx, "section-1", "student-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Error != nil {
		t.Fatalf("expected no booking error, got %v", *result.Error)
	}
	if result.Booking == nil {
		t.Fatal("expected booking, got nil")
	}
	if result.Booking.Status != models.PaymentPending {
		t.Fatalf("expected pending, got %v", result.Booking.Status)
	}
}

func TestCreateBooking_AlreadyBooked(t *testing.T) {
	svc, bookingRepo, _ := newTestService()
	ctx := context.Background()

	bookingRepo.bookings["existing"] = &models.Booking{
		ID:        "existing",
		SectionID: "section-1",
		StudentID: "student-1",
		Status:    models.PaymentPending,
		BookedAt:  time.Now(),
	}

	result, err := svc.Create(ctx, "section-1", "student-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Error == nil {
		t.Fatal("expected ALREADY_BOOKED error")
	}
	if *result.Error != services.ErrAlreadyBooked {
		t.Fatalf("expected ALREADY_BOOKED, got %v", *result.Error)
	}
}

func TestCreateBooking_CapacityFull(t *testing.T) {
	svc, bookingRepo, _ := newTestService()
	ctx := context.Background()

	bookingRepo.bookings["b1"] = &models.Booking{ID: "b1", SectionID: "section-1", StudentID: "student-2", Status: models.PaymentPending, BookedAt: time.Now()}
	bookingRepo.bookings["b2"] = &models.Booking{ID: "b2", SectionID: "section-1", StudentID: "student-3", Status: models.PaymentPending, BookedAt: time.Now()}

	result, err := svc.Create(ctx, "section-1", "student-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Error == nil {
		t.Fatal("expected CAPACITY_FULL error")
	}
	if *result.Error != services.ErrCapacityFull {
		t.Fatalf("expected CAPACITY_FULL, got %v", *result.Error)
	}
}

func TestPayBooking(t *testing.T) {
	svc, bookingRepo, _ := newTestService()
	ctx := context.Background()

	bookingRepo.bookings["b1"] = &models.Booking{
		ID:        "b1",
		SectionID: "section-1",
		StudentID: "student-1",
		Status:    models.PaymentPending,
		BookedAt:  time.Now(),
	}

	booking, err := svc.Pay(ctx, "b1", "student-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if booking.Status != models.PaymentPaid {
		t.Fatalf("expected paid, got %v", booking.Status)
	}
	if booking.PaidAt == nil {
		t.Fatal("expected paidAt to be set")
	}
}

func TestFailBooking(t *testing.T) {
	svc, bookingRepo, _ := newTestService()
	ctx := context.Background()

	bookingRepo.bookings["b1"] = &models.Booking{
		ID:        "b1",
		SectionID: "section-1",
		StudentID: "student-1",
		Status:    models.PaymentPending,
		BookedAt:  time.Now(),
	}

	booking, err := svc.Fail(ctx, "b1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if booking.Status != models.PaymentFailed {
		t.Fatalf("expected failed, got %v", booking.Status)
	}
}

func TestRetryBooking(t *testing.T) {
	svc, bookingRepo, _ := newTestService()
	ctx := context.Background()

	now := time.Now()
	bookingRepo.bookings["b1"] = &models.Booking{
		ID:        "b1",
		SectionID: "section-1",
		StudentID: "student-1",
		Status:    models.PaymentFailed,
		BookedAt:  now,
		PaidAt:    &now,
	}

	booking, err := svc.Retry(ctx, "b1", "student-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if booking.Status != models.PaymentPending {
		t.Fatalf("expected pending, got %v", booking.Status)
	}
	if booking.PaidAt != nil {
		t.Fatal("expected paidAt to be cleared")
	}
}

func TestFailedBookingNotCountedInCapacity(t *testing.T) {
	svc, bookingRepo, _ := newTestService()
	ctx := context.Background()

	bookingRepo.bookings["b1"] = &models.Booking{ID: "b1", SectionID: "section-1", StudentID: "student-2", Status: models.PaymentFailed, BookedAt: time.Now()}
	bookingRepo.bookings["b2"] = &models.Booking{ID: "b2", SectionID: "section-1", StudentID: "student-3", Status: models.PaymentPending, BookedAt: time.Now()}

	result, err := svc.Create(ctx, "section-1", "student-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Error != nil {
		t.Fatalf("expected no error (failed booking should not count), got %v", *result.Error)
	}
}
