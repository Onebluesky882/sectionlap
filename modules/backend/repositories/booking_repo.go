package repositories

import (
	"context"

	"github.com/uptrace/bun"

	"sectionlap/backend/models"
)

type BookingRepository interface {
	GetByID(ctx context.Context, id string) (*models.Booking, error)
	GetByStudentID(ctx context.Context, studentID string) ([]models.Booking, error)
	GetBySectionAndStudent(ctx context.Context, sectionID, studentID string) (*models.Booking, error)
	CountActive(ctx context.Context, sectionID string) (int, error)
	Create(ctx context.Context, booking *models.Booking) error
	Update(ctx context.Context, booking *models.Booking) error
	IsEnrolled(ctx context.Context, sectionID, studentID string) (bool, error)
}

type bookingRepository struct {
	db *bun.DB
}

func NewBookingRepository(db *bun.DB) BookingRepository {
	return &bookingRepository{db: db}
}

func (r *bookingRepository) GetByID(ctx context.Context, id string) (*models.Booking, error) {
	var b models.Booking
	err := r.db.NewSelect().Model(&b).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *bookingRepository) GetByStudentID(ctx context.Context, studentID string) ([]models.Booking, error) {
	var bookings []models.Booking
	err := r.db.NewSelect().Model(&bookings).Where("student_id = ?", studentID).Scan(ctx)
	return bookings, err
}

func (r *bookingRepository) GetBySectionAndStudent(ctx context.Context, sectionID, studentID string) (*models.Booking, error) {
	var b models.Booking
	err := r.db.NewSelect().Model(&b).
		Where("section_id = ? AND student_id = ? AND status != ?", sectionID, studentID, models.PaymentFailed).
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *bookingRepository) CountActive(ctx context.Context, sectionID string) (int, error) {
	count, err := r.db.NewSelect().Model((*models.Booking)(nil)).
		Where("section_id = ? AND status != ?", sectionID, models.PaymentFailed).
		Count(ctx)
	return count, err
}

func (r *bookingRepository) Create(ctx context.Context, booking *models.Booking) error {
	_, err := r.db.NewInsert().Model(booking).Exec(ctx)
	return err
}

func (r *bookingRepository) Update(ctx context.Context, booking *models.Booking) error {
	_, err := r.db.NewUpdate().Model(booking).Where("id = ?", booking.ID).Exec(ctx)
	return err
}

func (r *bookingRepository) IsEnrolled(ctx context.Context, sectionID, studentID string) (bool, error) {
	count, err := r.db.NewSelect().Model((*models.Booking)(nil)).
		Where("section_id = ? AND student_id = ? AND status = ?", sectionID, studentID, models.PaymentPaid).
		Count(ctx)
	return count > 0, err
}
