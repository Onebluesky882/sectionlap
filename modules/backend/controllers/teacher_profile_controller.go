package controllers

import (
	"time"

	"github.com/gofiber/fiber/v3"

	"sectionlap/backend/middlewares"
	"sectionlap/backend/models"
	"sectionlap/backend/repositories"
)

type TeacherProfileController struct {
	profileRepo  repositories.TeacherProfileRepository
	userRoleRepo repositories.UserRoleRepository
}

func NewTeacherProfileController(profileRepo repositories.TeacherProfileRepository, userRoleRepo repositories.UserRoleRepository) *TeacherProfileController {
	return &TeacherProfileController{profileRepo: profileRepo, userRoleRepo: userRoleRepo}
}


type SubmitProfileBody struct {
	FullName  string `json:"fullName"`
	IDCard    string `json:"idCard"`
	Phone     string `json:"phone"`
	Expertise string `json:"expertise"`
}

func (ctrl *TeacherProfileController) Submit(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	var body SubmitProfileBody
	if err := c.Bind().JSON(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if body.FullName == "" || body.IDCard == "" || body.Phone == "" || body.Expertise == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "all fields are required"})
	}

	profile := &models.TeacherProfile{
		TeacherID:   userID,
		FullName:    body.FullName,
		IDCard:      body.IDCard,
		Phone:       body.Phone,
		Expertise:   body.Expertise,
		SubmittedAt: time.Now(),
	}
	if err := ctrl.profileRepo.Upsert(c.Context(), profile); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save profile"})
	}

	return c.JSON(fiber.Map{
		"data":   fiber.Map{"verified": false, "profile": profile},
		"error":  nil,
		"status": "success",
	})
}

func (ctrl *TeacherProfileController) Get(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	profile, err := ctrl.profileRepo.GetByTeacherID(c.Context(), userID)
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
