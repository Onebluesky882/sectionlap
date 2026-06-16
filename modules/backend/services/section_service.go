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
	List(ctx context.Context) ([]models.Section, error)
	GetByID(ctx context.Context, id string) (*models.Section, error)
	Create(ctx context.Context, teacherID, teacherName string, input CreateSectionInput) (*models.Section, error)
	Update(ctx context.Context, id, teacherID string, input UpdateSectionInput) (*models.Section, error)
}

type CreateSectionInput struct {
	Title           string  `json:"title"`
	Description     string  `json:"description"`
	Price           float64 `json:"price"`
	Category        string  `json:"category"`
	DurationMinutes int     `json:"durationMinutes"`
	Capacity        int     `json:"capacity"`
}

type UpdateSectionInput struct {
	Title           *string  `json:"title,omitempty"`
	Description     *string  `json:"description,omitempty"`
	Price           *float64 `json:"price,omitempty"`
	Category        *string  `json:"category,omitempty"`
	DurationMinutes *int     `json:"durationMinutes,omitempty"`
	Capacity        *int     `json:"capacity,omitempty"`
}

type sectionService struct {
	repo repositories.SectionRepository
}

func NewSectionService(repo repositories.SectionRepository) SectionService {
	return &sectionService{repo: repo}
}

func (s *sectionService) List(ctx context.Context) ([]models.Section, error) {
	return s.repo.GetAll(ctx)
}

func (s *sectionService) GetByID(ctx context.Context, id string) (*models.Section, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *sectionService) Create(ctx context.Context, teacherID, teacherName string, input CreateSectionInput) (*models.Section, error) {
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
		CreatedAt:       time.Now().UTC(),
		UpdatedAt:       time.Now().UTC(),
	}
	if err := s.repo.Create(ctx, section); err != nil {
		return nil, err
	}
	return section, nil
}

func (s *sectionService) Update(ctx context.Context, id, teacherID string, input UpdateSectionInput) (*models.Section, error) {
	section, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if section.TeacherID != teacherID {
		return nil, fmt.Errorf("forbidden")
	}

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
	section.UpdatedAt = time.Now().UTC()

	if err := s.repo.Update(ctx, section); err != nil {
		return nil, err
	}
	return section, nil
}
