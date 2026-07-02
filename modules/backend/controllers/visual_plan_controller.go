package controllers

import (
	"github.com/gofiber/fiber/v3"

	"sectionlap/backend/services"
)

type VisualPlanController struct {
	svc *services.VisualPlanService
}

func NewVisualPlanController(svc *services.VisualPlanService) *VisualPlanController {
	return &VisualPlanController{svc: svc}
}

func (c *VisualPlanController) Generate(ctx fiber.Ctx) error {
	userID, ok := ctx.Locals("userID").(string)
	if !ok || userID == "" {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	var body struct {
		PromptText string `json:"promptText"`
	}
	if err := ctx.Bind().JSON(&body); err != nil || body.PromptText == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "promptText is required"})
	}

	plan, err := c.svc.Generate(ctx.Context(), userID, body.PromptText)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{"data": plan})
}

func (c *VisualPlanController) List(ctx fiber.Ctx) error {
	userID, ok := ctx.Locals("userID").(string)
	if !ok || userID == "" {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	plans, err := c.svc.List(ctx.Context(), userID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.JSON(fiber.Map{"data": plans})
}

func (c *VisualPlanController) GetByID(ctx fiber.Ctx) error {
	id := ctx.Params("id")
	plan, err := c.svc.GetByID(ctx.Context(), id)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "not found"})
	}
	return ctx.JSON(fiber.Map{"data": plan})
}

func (c *VisualPlanController) Delete(ctx fiber.Ctx) error {
	userID, ok := ctx.Locals("userID").(string)
	if !ok || userID == "" {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	id := ctx.Params("id")
	if err := c.svc.Delete(ctx.Context(), id, userID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.SendStatus(fiber.StatusNoContent)
}
