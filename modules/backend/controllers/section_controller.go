package controllers

import (
	"github.com/gofiber/fiber/v3"

	"sectionlap/backend/middlewares"
	"sectionlap/backend/models"
	"sectionlap/backend/services"
)

type SectionController struct {
	sectionService services.SectionService
}

func NewSectionController(svc services.SectionService) *SectionController {
	return &SectionController{sectionService: svc}
}

func (ctrl *SectionController) List(c fiber.Ctx) error {
	sections, err := ctrl.sectionService.List(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": sections, "error": nil, "status": "success"})
}

func (ctrl *SectionController) GetByID(c fiber.Ctx) error {
	id := c.Params("id")
	section, err := ctrl.sectionService.GetByID(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "section not found"})
	}
	return c.JSON(fiber.Map{"data": section, "error": nil, "status": "success"})
}

func (ctrl *SectionController) Create(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	var input services.CreateSectionInput
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	teacherName := c.Get("X-User-Name", userID)

	section, err := ctrl.sectionService.Create(c.Context(), userID, teacherName, input)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": section, "error": nil, "status": "success"})
}

func (ctrl *SectionController) Update(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	role := middlewares.GetUserRole(c)

	if role != models.RoleTeacher {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
	}

	id := c.Params("id")
	var input services.UpdateSectionInput
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	section, err := ctrl.sectionService.Update(c.Context(), id, userID, input)
	if err != nil {
		if err.Error() == "forbidden" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "you do not own this section"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": section, "error": nil, "status": "success"})
}
