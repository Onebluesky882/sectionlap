package controllers

import (
	"strings"

	"github.com/gofiber/fiber/v3"

	"sectionlap/backend/middlewares"
	"sectionlap/backend/repositories"
	"sectionlap/backend/services"
)

// SupervisorController handles full manual CRUD on sections for supervisor and dev roles.
type SupervisorController struct {
	sectionService services.SectionService
	sectionRepo    repositories.SectionRepository
}

func NewSupervisorController(svc services.SectionService, repo repositories.SectionRepository) *SupervisorController {
	return &SupervisorController{sectionService: svc, sectionRepo: repo}
}

// ListSections returns all sections regardless of status.
func (ctrl *SupervisorController) ListSections(c fiber.Ctx) error {
	sections, err := ctrl.sectionRepo.GetAllAdmin(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": sections, "error": nil, "status": "success"})
}

// GetSection returns a single section by id.
func (ctrl *SupervisorController) GetSection(c fiber.Ctx) error {
	id := c.Params("id")
	section, err := ctrl.sectionService.GetByID(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "section not found"})
	}
	return c.JSON(fiber.Map{"data": section, "error": nil, "status": "success"})
}

type supervisorCreateBody struct {
	TeacherID   string  `json:"teacherId"`
	TeacherName string  `json:"teacher"`
	services.CreateSectionInput
}

// CreateSection creates a section on behalf of any teacher.
func (ctrl *SupervisorController) CreateSection(c fiber.Ctx) error {
	var body supervisorCreateBody
	if err := c.Bind().JSON(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if body.TeacherID == "" {
		body.TeacherID = middlewares.GetUserID(c)
	}
	if body.TeacherName == "" {
		body.TeacherName = body.TeacherID
	}

	section, err := ctrl.sectionService.Create(c.Context(), body.TeacherID, body.TeacherName, body.CreateSectionInput)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": section, "error": nil, "status": "success"})
}

// UpdateSection updates any section (no ownership check).
func (ctrl *SupervisorController) UpdateSection(c fiber.Ctx) error {
	id := c.Params("id")
	var input services.UpdateSectionInput
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	section, err := ctrl.sectionService.AdminUpdate(c.Context(), id, input)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": section, "error": nil, "status": "success"})
}

// DeleteSection removes a section permanently.
func (ctrl *SupervisorController) DeleteSection(c fiber.Ctx) error {
	id := c.Params("id")
	if err := ctrl.sectionRepo.Delete(c.Context(), id); err != nil {
		if strings.Contains(err.Error(), "not found") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "section not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": nil, "error": nil, "status": "success"})
}
