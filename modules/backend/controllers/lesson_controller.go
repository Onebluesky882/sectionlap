package controllers

import (
	"github.com/gofiber/fiber/v3"

	"sectionlap/backend/middlewares"
	"sectionlap/backend/services"
)

type LessonController struct {
	lessonService services.LessonService
}

func NewLessonController(svc services.LessonService) *LessonController {
	return &LessonController{lessonService: svc}
}

func (ctrl *LessonController) List(c fiber.Ctx) error {
	sectionID := c.Params("sectionId")
	lessons, err := ctrl.lessonService.ListBySection(c.Context(), sectionID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": lessons, "error": nil, "status": "success"})
}

type createLessonRequest struct {
	Title string `json:"title"`
}

func (ctrl *LessonController) Create(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	sectionID := c.Params("sectionId")

	var input createLessonRequest
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	lesson, err := ctrl.lessonService.Create(c.Context(), sectionID, userID, input.Title)
	if err != nil {
		if err.Error() == "forbidden" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "you do not own this section"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": lesson, "error": nil, "status": "success"})
}

func (ctrl *LessonController) Update(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	lessonID := c.Params("lessonId")

	var input createLessonRequest
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	lesson, err := ctrl.lessonService.Update(c.Context(), lessonID, userID, input.Title)
	if err != nil {
		if err.Error() == "forbidden" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "you do not own this lesson"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": lesson, "error": nil, "status": "success"})
}

func (ctrl *LessonController) Delete(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	lessonID := c.Params("lessonId")

	if err := ctrl.lessonService.Delete(c.Context(), lessonID, userID); err != nil {
		if err.Error() == "forbidden" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "you do not own this lesson"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": nil, "error": nil, "status": "success"})
}

type reorderLessonsRequest struct {
	OrderedIDs []string `json:"orderedIds"`
}

func (ctrl *LessonController) Reorder(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	sectionID := c.Params("sectionId")

	var input reorderLessonsRequest
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	if err := ctrl.lessonService.Reorder(c.Context(), sectionID, userID, input.OrderedIDs); err != nil {
		if err.Error() == "forbidden" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "you do not own this section"})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": nil, "error": nil, "status": "success"})
}
