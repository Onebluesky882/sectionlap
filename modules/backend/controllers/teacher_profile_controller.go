package controllers

import (
	"github.com/gofiber/fiber/v3"

	"sectionlap/backend/middlewares"
	"sectionlap/backend/repositories"
	"sectionlap/backend/services"
)

type TeacherProfileController struct {
	profileRepo         repositories.TeacherProfileRepository
	userRoleRepo        repositories.UserRoleRepository
	verificationService *services.TeacherVerificationService
	presigner           *services.R2Presigner
}

func NewTeacherProfileController(
	profileRepo repositories.TeacherProfileRepository,
	userRoleRepo repositories.UserRoleRepository,
	verificationService *services.TeacherVerificationService,
	presigner *services.R2Presigner,
) *TeacherProfileController {
	return &TeacherProfileController{
		profileRepo:         profileRepo,
		userRoleRepo:        userRoleRepo,
		verificationService: verificationService,
		presigner:           presigner,
	}
}

type SubmitProfileBody struct {
	FullName    string `json:"fullName"`
	IDCard      string `json:"idCard"`
	Phone       string `json:"phone"`
	Expertise   string `json:"expertise"`
	DocumentKey string `json:"documentKey"`
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
	if body.DocumentKey == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "identity document is required"})
	}

	profile, err := ctrl.verificationService.Submit(c.Context(), userID, services.SubmitInput{
		FullName:    body.FullName,
		IDCard:      body.IDCard,
		Phone:       body.Phone,
		Expertise:   body.Expertise,
		DocumentKey: body.DocumentKey,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save profile"})
	}

	return c.JSON(fiber.Map{
		"data":   fiber.Map{"status": profile.VerificationStatus, "profile": profile},
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

	if ctrl.presigner != nil && profile.IdentityDocR2Key != "" {
		if url, err := ctrl.presigner.PresignGetURL(c.Context(), profile.IdentityDocR2Key); err == nil {
			profile.DocumentURL = url
		}
	}

	return c.JSON(fiber.Map{
		"data":   profile,
		"error":  nil,
		"status": "success",
	})
}
