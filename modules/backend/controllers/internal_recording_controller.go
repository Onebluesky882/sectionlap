package controllers

import (
	"fmt"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"

	"sectionlap/backend/services"
)

// InternalRecordingController is called by Jibri's finalize script (see
// modules/live-class/jibri/finalize.sh) — a machine caller with no logged-in
// teacher context, gated by middlewares.RequireInternalSecret instead of a
// user session.
type InternalRecordingController struct {
	lessonService     services.LessonService
	lessonClipService services.LessonClipService
	presigner         *services.R2Presigner
}

func NewInternalRecordingController(
	lessonService services.LessonService,
	lessonClipService services.LessonClipService,
	presigner *services.R2Presigner,
) *InternalRecordingController {
	return &InternalRecordingController{
		lessonService:     lessonService,
		lessonClipService: lessonClipService,
		presigner:         presigner,
	}
}

type presignRecordingRequest struct {
	SectionID string `json:"sectionId"`
	FileName  string `json:"fileName"`
}

func (ctrl *InternalRecordingController) Presign(c fiber.Ctx) error {
	var body presignRecordingRequest
	if err := c.Bind().JSON(&body); err != nil || body.SectionID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "sectionId is required"})
	}
	if ctrl.presigner == nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "R2 not configured"})
	}

	lesson, err := ctrl.lessonService.GetOrCreateLiveRecordingsLesson(c.Context(), body.SectionID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	uploadID := fmt.Sprintf("live-%s-%s", body.SectionID, uuid.New().String())
	r2KeyPrefix := fmt.Sprintf("video/%s/", uploadID)

	clip, err := ctrl.lessonClipService.CreatePendingClip(c.Context(), lesson.ID, r2KeyPrefix)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	uploadURL, err := ctrl.presigner.PresignPutURL(c.Context(), r2KeyPrefix+"0000.webm")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"data": fiber.Map{
			"clipId":    clip.ID,
			"uploadUrl": uploadURL,
		},
		"error":  nil,
		"status": "success",
	})
}

func (ctrl *InternalRecordingController) Complete(c fiber.Ctx) error {
	clipID := c.Params("clipId")

	clip, err := ctrl.lessonClipService.MarkReady(c.Context(), clipID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": clip, "error": nil, "status": "success"})
}
