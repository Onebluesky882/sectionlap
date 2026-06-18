package controllers

import (
	"github.com/gofiber/fiber/v3"

	"sectionlap/backend/middlewares"
	"sectionlap/backend/services"
)

type JitsiController struct {
	jitsiService services.JitsiService
}

func NewJitsiController(svc services.JitsiService) *JitsiController {
	return &JitsiController{jitsiService: svc}
}

func (ctrl *JitsiController) GetToken(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	role := middlewares.GetUserRole(c)
	sectionID := c.Params("id")

	userName := c.Get("X-User-Name", userID)

	result, err := ctrl.jitsiService.GetToken(c.Context(), sectionID, userID, userName, role)
	if err != nil {
		if err.Error() == "forbidden: only the section teacher can get a token" ||
			err.Error() == "forbidden: student is not enrolled in this section" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"data":   result,
		"error":  nil,
		"status": "success",
	})
}
