package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"sectionlap/backend/models"
	"sectionlap/backend/repositories"
)

type LessonClipService interface {
	RegisterClip(ctx context.Context, lessonID, teacherID, r2KeyPrefix string, chunkCount int) (*models.LessonClip, error)
	Delete(ctx context.Context, clipID, teacherID string) error
	Playback(ctx context.Context, clipID string) ([]string, error)
}

type lessonClipService struct {
	lessonClipRepo repositories.LessonClipRepository
	lessonRepo     repositories.LessonRepository
	sectionRepo    repositories.SectionRepository
	presigner      *R2Presigner
}

func NewLessonClipService(
	lessonClipRepo repositories.LessonClipRepository,
	lessonRepo repositories.LessonRepository,
	sectionRepo repositories.SectionRepository,
	presigner *R2Presigner,
) LessonClipService {
	return &lessonClipService{
		lessonClipRepo: lessonClipRepo,
		lessonRepo:     lessonRepo,
		sectionRepo:    sectionRepo,
		presigner:      presigner,
	}
}

func (s *lessonClipService) checkLessonOwnership(ctx context.Context, lessonID, teacherID string) (*models.Lesson, error) {
	lesson, err := s.lessonRepo.GetByID(ctx, lessonID)
	if err != nil {
		return nil, fmt.Errorf("lesson not found: %w", err)
	}
	section, err := s.sectionRepo.GetByID(ctx, lesson.SectionID)
	if err != nil {
		return nil, fmt.Errorf("section not found: %w", err)
	}
	if section.TeacherID != teacherID {
		return nil, fmt.Errorf("forbidden")
	}
	return lesson, nil
}

func (s *lessonClipService) RegisterClip(ctx context.Context, lessonID, teacherID, r2KeyPrefix string, chunkCount int) (*models.LessonClip, error) {
	if _, err := s.checkLessonOwnership(ctx, lessonID, teacherID); err != nil {
		return nil, err
	}
	existing, err := s.lessonClipRepo.GetByLessonID(ctx, lessonID)
	if err != nil {
		return nil, err
	}
	clip := &models.LessonClip{
		ID:          uuid.New().String(),
		LessonID:    lessonID,
		OrderIndex:  len(existing),
		R2KeyPrefix: r2KeyPrefix,
		ChunkCount:  chunkCount,
		Status:      "ready",
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}
	if err := s.lessonClipRepo.Create(ctx, clip); err != nil {
		return nil, err
	}
	return clip, nil
}

func (s *lessonClipService) Delete(ctx context.Context, clipID, teacherID string) error {
	clip, err := s.lessonClipRepo.GetByID(ctx, clipID)
	if err != nil {
		return fmt.Errorf("clip not found: %w", err)
	}
	if _, err := s.checkLessonOwnership(ctx, clip.LessonID, teacherID); err != nil {
		return err
	}
	return s.lessonClipRepo.Delete(ctx, clipID)
}

func (s *lessonClipService) Playback(ctx context.Context, clipID string) ([]string, error) {
	clip, err := s.lessonClipRepo.GetByID(ctx, clipID)
	if err != nil {
		return nil, fmt.Errorf("clip not found: %w", err)
	}
	if s.presigner == nil {
		return nil, fmt.Errorf("R2 not configured")
	}
	urls := make([]string, 0, clip.ChunkCount)
	for i := 0; i < clip.ChunkCount; i++ {
		key := fmt.Sprintf("%s%04d.webm", clip.R2KeyPrefix, i)
		url, err := s.presigner.PresignGetURL(ctx, key)
		if err != nil {
			return nil, fmt.Errorf("presign chunk %d: %w", i, err)
		}
		urls = append(urls, url)
	}
	return urls, nil
}
