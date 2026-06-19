package controllers

import (
	"github.com/gofiber/fiber/v3"

	"sectionlap/backend/middlewares"
	"sectionlap/backend/models"
	"sectionlap/backend/repositories"
)

type StudentProfileController struct {
	profileRepo repositories.StudentProfileRepository
}

func NewStudentProfileController(profileRepo repositories.StudentProfileRepository) *StudentProfileController {
	return &StudentProfileController{profileRepo: profileRepo}
}

type SubmitStudentProfileBody struct {
	Nickname  string   `json:"nickname"`
	Age       int      `json:"age"`
	Interests []string `json:"interests"`
}

func (ctrl *StudentProfileController) Submit(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	var body SubmitStudentProfileBody
	if err := c.Bind().JSON(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if body.Nickname == "" || body.Age <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "nickname and age are required"})
	}

	profile := &models.StudentProfile{
		StudentID: userID,
		Nickname:  body.Nickname,
		Age:       body.Age,
		Interests: body.Interests,
	}
	if err := ctrl.profileRepo.Upsert(c.Context(), profile); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save profile"})
	}

	return c.JSON(fiber.Map{
		"data":   profile,
		"error":  nil,
		"status": "success",
	})
}

func (ctrl *StudentProfileController) Get(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	profile, err := ctrl.profileRepo.GetByStudentID(c.Context(), userID)
	if err != nil {
		return c.JSON(fiber.Map{
			"data":   nil,
			"error":  nil,
			"status": "success",
		})
	}

	return c.JSON(fiber.Map{
		"data":   profile,
		"error":  nil,
		"status": "success",
	})
}
