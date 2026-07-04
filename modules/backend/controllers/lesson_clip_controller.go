package controllers

import (
	"github.com/gofiber/fiber/v3"

	"sectionlap/backend/middlewares"
	"sectionlap/backend/services"
)

type LessonClipController struct {
	lessonClipService services.LessonClipService
}

func NewLessonClipController(svc services.LessonClipService) *LessonClipController {
	return &LessonClipController{lessonClipService: svc}
}

type registerClipRequest struct {
	R2KeyPrefix string `json:"r2KeyPrefix"`
	ChunkCount  int    `json:"chunkCount"`
}

func (ctrl *LessonClipController) Create(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	lessonID := c.Params("lessonId")

	var input registerClipRequest
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if input.R2KeyPrefix == "" || input.ChunkCount <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "r2KeyPrefix and chunkCount are required"})
	}

	clip, err := ctrl.lessonClipService.RegisterClip(c.Context(), lessonID, userID, input.R2KeyPrefix, input.ChunkCount)
	if err != nil {
		if err.Error() == "forbidden" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "you do not own this lesson"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": clip, "error": nil, "status": "success"})
}

func (ctrl *LessonClipController) Delete(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	clipID := c.Params("clipId")

	if err := ctrl.lessonClipService.Delete(c.Context(), clipID, userID); err != nil {
		if err.Error() == "forbidden" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "you do not own this clip"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": nil, "error": nil, "status": "success"})
}

func (ctrl *LessonClipController) Playback(c fiber.Ctx) error {
	clipID := c.Params("clipId")

	urls, err := ctrl.lessonClipService.Playback(c.Context(), clipID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": fiber.Map{"urls": urls}, "error": nil, "status": "success"})
}
