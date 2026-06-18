package controllers

import (
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"

	"sectionlap/backend/models"
	"sectionlap/backend/repositories"
)

type FeedbackController struct {
	feedbackRepo repositories.FeedbackRepository
}

func NewFeedbackController(repo repositories.FeedbackRepository) *FeedbackController {
	return &FeedbackController{feedbackRepo: repo}
}

type SubmitFeedbackBody struct {
	Platform string                 `json:"platform"`
	Category models.FeedbackCategory `json:"category"`
	Rating   int                    `json:"rating"`
	Message  string                 `json:"message"`
}

func (ctrl *FeedbackController) Submit(c fiber.Ctx) error {
	userID, _ := c.Locals("userID").(string)

	var body SubmitFeedbackBody
	if err := c.Bind().JSON(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	if body.Rating < 1 || body.Rating > 5 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "rating must be between 1 and 5"})
	}
	if body.Message == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "message is required"})
	}
	if body.Platform == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "platform is required"})
	}

	category := body.Category
	if category == "" {
		category = models.FeedbackGeneral
	}

	feedback := &models.Feedback{
		ID:       uuid.NewString(),
		UserID:   userID,
		Platform: body.Platform,
		Category: category,
		Rating:   body.Rating,
		Message:  body.Message,
	}

	if err := ctrl.feedbackRepo.Create(c.Context(), feedback); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save feedback"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"data":   feedback,
		"error":  nil,
		"status": "success",
	})
}
