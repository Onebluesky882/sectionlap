package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"sectionlap/backend/models"
	"sectionlap/backend/repositories"
)

// LessonWithClips flattens a Lesson with its ordered clips for API responses.
type LessonWithClips struct {
	models.Lesson
	Clips []models.LessonClip `json:"clips"`
}

type LessonService interface {
	ListBySection(ctx context.Context, sectionID string) ([]LessonWithClips, error)
	Create(ctx context.Context, sectionID, teacherID, title string) (*models.Lesson, error)
	Update(ctx context.Context, lessonID, teacherID, title string) (*models.Lesson, error)
	Delete(ctx context.Context, lessonID, teacherID string) error
	Reorder(ctx context.Context, sectionID, teacherID string, orderedIDs []string) error
	// GetOrCreateLiveRecordingsLesson is used by the internal recording-ingest
	// path (see internal_recording_controller.go) — no teacher context exists
	// there (the caller is Jibri's finalize script, not a logged-in user), so
	// this intentionally skips the ownership check the other methods do.
	GetOrCreateLiveRecordingsLesson(ctx context.Context, sectionID string) (*models.Lesson, error)
}

// LiveRecordingsLessonTitle is the fixed title used to find/create the one
// shared lesson that auto-captured live-class recordings are appended to.
const LiveRecordingsLessonTitle = "การบันทึกสด"

type lessonService struct {
	lessonRepo     repositories.LessonRepository
	lessonClipRepo repositories.LessonClipRepository
	sectionRepo    repositories.SectionRepository
}

func NewLessonService(
	lessonRepo repositories.LessonRepository,
	lessonClipRepo repositories.LessonClipRepository,
	sectionRepo repositories.SectionRepository,
) LessonService {
	return &lessonService{
		lessonRepo:     lessonRepo,
		lessonClipRepo: lessonClipRepo,
		sectionRepo:    sectionRepo,
	}
}

func (s *lessonService) checkSectionOwnership(ctx context.Context, sectionID, teacherID string) error {
	section, err := s.sectionRepo.GetByID(ctx, sectionID)
	if err != nil {
		return fmt.Errorf("section not found: %w", err)
	}
	if section.TeacherID != teacherID {
		return fmt.Errorf("forbidden")
	}
	return nil
}

func (s *lessonService) ListBySection(ctx context.Context, sectionID string) ([]LessonWithClips, error) {
	lessons, err := s.lessonRepo.GetBySectionID(ctx, sectionID)
	if err != nil {
		return nil, err
	}
	result := make([]LessonWithClips, 0, len(lessons))
	for _, lesson := range lessons {
		clips, err := s.lessonClipRepo.GetByLessonID(ctx, lesson.ID)
		if err != nil {
			return nil, err
		}
		if clips == nil {
			clips = []models.LessonClip{}
		}
		result = append(result, LessonWithClips{Lesson: lesson, Clips: clips})
	}
	return result, nil
}

func (s *lessonService) Create(ctx context.Context, sectionID, teacherID, title string) (*models.Lesson, error) {
	if err := s.checkSectionOwnership(ctx, sectionID, teacherID); err != nil {
		return nil, err
	}
	existing, err := s.lessonRepo.GetBySectionID(ctx, sectionID)
	if err != nil {
		return nil, err
	}
	lesson := &models.Lesson{
		ID:         uuid.New().String(),
		SectionID:  sectionID,
		Title:      title,
		OrderIndex: len(existing),
		CreatedAt:  time.Now().UTC(),
		UpdatedAt:  time.Now().UTC(),
	}
	if err := s.lessonRepo.Create(ctx, lesson); err != nil {
		return nil, err
	}
	return lesson, nil
}

func (s *lessonService) Update(ctx context.Context, lessonID, teacherID, title string) (*models.Lesson, error) {
	lesson, err := s.lessonRepo.GetByID(ctx, lessonID)
	if err != nil {
		return nil, fmt.Errorf("lesson not found: %w", err)
	}
	if err := s.checkSectionOwnership(ctx, lesson.SectionID, teacherID); err != nil {
		return nil, err
	}
	lesson.Title = title
	lesson.UpdatedAt = time.Now().UTC()
	if err := s.lessonRepo.Update(ctx, lesson); err != nil {
		return nil, err
	}
	return lesson, nil
}

func (s *lessonService) Delete(ctx context.Context, lessonID, teacherID string) error {
	lesson, err := s.lessonRepo.GetByID(ctx, lessonID)
	if err != nil {
		return fmt.Errorf("lesson not found: %w", err)
	}
	if err := s.checkSectionOwnership(ctx, lesson.SectionID, teacherID); err != nil {
		return err
	}
	return s.lessonRepo.Delete(ctx, lessonID)
}

func (s *lessonService) Reorder(ctx context.Context, sectionID, teacherID string, orderedIDs []string) error {
	if err := s.checkSectionOwnership(ctx, sectionID, teacherID); err != nil {
		return err
	}
	existing, err := s.lessonRepo.GetBySectionID(ctx, sectionID)
	if err != nil {
		return err
	}
	belongs := make(map[string]bool, len(existing))
	for _, l := range existing {
		belongs[l.ID] = true
	}
	if len(orderedIDs) != len(existing) {
		return fmt.Errorf("orderedIds must match the section's lesson set")
	}
	for _, id := range orderedIDs {
		if !belongs[id] {
			return fmt.Errorf("lesson %s does not belong to this section", id)
		}
	}
	return s.lessonRepo.UpdateOrder(ctx, orderedIDs)
}

func (s *lessonService) GetOrCreateLiveRecordingsLesson(ctx context.Context, sectionID string) (*models.Lesson, error) {
	existing, err := s.lessonRepo.GetBySectionID(ctx, sectionID)
	if err != nil {
		return nil, err
	}
	for i := range existing {
		if existing[i].Title == LiveRecordingsLessonTitle {
			return &existing[i], nil
		}
	}

	lesson := &models.Lesson{
		ID:         uuid.New().String(),
		SectionID:  sectionID,
		Title:      LiveRecordingsLessonTitle,
		OrderIndex: len(existing),
		CreatedAt:  time.Now().UTC(),
		UpdatedAt:  time.Now().UTC(),
	}
	if err := s.lessonRepo.Create(ctx, lesson); err != nil {
		return nil, err
	}
	return lesson, nil
}
