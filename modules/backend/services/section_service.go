package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"sectionlap/backend/models"
	"sectionlap/backend/repositories"
)

type SectionService interface {
	List(ctx context.Context, category string) ([]models.Section, error)
	GetByID(ctx context.Context, id string) (*models.Section, error)
	Create(ctx context.Context, teacherID, teacherName string, input CreateSectionInput) (*models.Section, error)
	Update(ctx context.Context, id, teacherID string, input UpdateSectionInput) (*models.Section, error)
	// AdminUpdate updates any section regardless of ownership (admin/supervisor/dev).
	AdminUpdate(ctx context.Context, id string, input UpdateSectionInput) (*models.Section, error)
	// Delete removes a section. Fails if active bookings exist (FK RESTRICT).
	Delete(ctx context.Context, id string) error
}

type CreateSectionInput struct {
	Title           string     `json:"title"`
	Description     string     `json:"description"`
	Price           float64    `json:"price"`
	Category        string     `json:"category"`
	DurationMinutes int        `json:"durationMinutes"`
	Capacity        int        `json:"capacity"`
	Questions       []string   `json:"questions"`
	ScheduledAt     *time.Time `json:"scheduledAt,omitempty"`
}

type UpdateSectionInput struct {
	Title           *string    `json:"title,omitempty"`
	Description     *string    `json:"description,omitempty"`
	Price           *float64   `json:"price,omitempty"`
	Category        *string    `json:"category,omitempty"`
	DurationMinutes *int       `json:"durationMinutes,omitempty"`
	Capacity        *int       `json:"capacity,omitempty"`
	Questions       []string   `json:"questions,omitempty"`
	ScheduledAt     *time.Time `json:"scheduledAt,omitempty"`
}

type sectionService struct {
	repo repositories.SectionRepository
}

func NewSectionService(repo repositories.SectionRepository) SectionService {
	return &sectionService{repo: repo}
}

func (s *sectionService) List(ctx context.Context, category string) ([]models.Section, error) {
	return s.repo.GetAll(ctx, category)
}

func (s *sectionService) GetByID(ctx context.Context, id string) (*models.Section, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *sectionService) Create(ctx context.Context, teacherID, teacherName string, input CreateSectionInput) (*models.Section, error) {
	questions := input.Questions
	if questions == nil {
		questions = []string{}
	}

	section := &models.Section{
		ID:              uuid.New().String(),
		Title:           input.Title,
		Description:     input.Description,
		Price:           input.Price,
		Teacher:         teacherName,
		TeacherID:       teacherID,
		Category:        input.Category,
		DurationMinutes: input.DurationMinutes,
		Capacity:        input.Capacity,
		Questions:       questions,
		ScheduledAt:     input.ScheduledAt,
		CreatedAt:       time.Now().UTC(),
		UpdatedAt:       time.Now().UTC(),
	}
	if err := s.repo.Create(ctx, section); err != nil {
		return nil, err
	}
	return section, nil
}

func (s *sectionService) AdminUpdate(ctx context.Context, id string, input UpdateSectionInput) (*models.Section, error) {
	section, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("section not found: %w", err)
	}
	return s.applyUpdate(ctx, section, input)
}

func (s *sectionService) Delete(ctx context.Context, id string) error {
	if _, err := s.repo.GetByID(ctx, id); err != nil {
		return fmt.Errorf("section not found: %w", err)
	}
	return s.repo.Delete(ctx, id)
}

func (s *sectionService) Update(ctx context.Context, id, teacherID string, input UpdateSectionInput) (*models.Section, error) {
	section, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if section.TeacherID != teacherID {
		return nil, fmt.Errorf("forbidden")
	}
	return s.applyUpdate(ctx, section, input)
}

func (s *sectionService) applyUpdate(ctx context.Context, section *models.Section, input UpdateSectionInput) (*models.Section, error) {
	if input.Title != nil {
		section.Title = *input.Title
	}
	if input.Description != nil {
		section.Description = *input.Description
	}
	if input.Price != nil {
		section.Price = *input.Price
	}
	if input.Category != nil {
		section.Category = *input.Category
	}
	if input.DurationMinutes != nil {
		section.DurationMinutes = *input.DurationMinutes
	}
	if input.Capacity != nil {
		section.Capacity = *input.Capacity
	}
	if input.ScheduledAt != nil {
		section.ScheduledAt = input.ScheduledAt
	}
	if input.Questions != nil {
		section.Questions = input.Questions
	}
	section.UpdatedAt = time.Now().UTC()

	if err := s.repo.Update(ctx, section); err != nil {
		return nil, err
	}
	return section, nil
}
