package controllers

import (
	"github.com/gofiber/fiber/v3"

	"sectionlap/backend/middlewares"
	"sectionlap/backend/services"
)

type BookingController struct {
	bookingService services.BookingService
}

func NewBookingController(svc services.BookingService) *BookingController {
	return &BookingController{bookingService: svc}
}

type CreateBookingBody struct {
	SectionID string `json:"sectionId"`
}

func (ctrl *BookingController) Create(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	var body CreateBookingBody
	if err := c.Bind().JSON(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	result, err := ctrl.bookingService.Create(c.Context(), body.SectionID, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	if result.Error != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"data":   fiber.Map{"booking": result.Booking, "error": string(*result.Error)},
			"error":  string(*result.Error),
			"status": "error",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"data":   fiber.Map{"booking": result.Booking, "error": nil},
		"error":  nil,
		"status": "success",
	})
}

func (ctrl *BookingController) List(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	bookings, err := ctrl.bookingService.ListByStudent(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": bookings, "error": nil, "status": "success"})
}

func (ctrl *BookingController) Pay(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	bookingID := c.Params("id")

	booking, err := ctrl.bookingService.Pay(c.Context(), bookingID, userID)
	if err != nil {
		if err.Error() == "forbidden" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": booking, "error": nil, "status": "success"})
}

func (ctrl *BookingController) Fail(c fiber.Ctx) error {
	bookingID := c.Params("id")

	booking, err := ctrl.bookingService.Fail(c.Context(), bookingID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": booking, "error": nil, "status": "success"})
}

func (ctrl *BookingController) Retry(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	bookingID := c.Params("id")

	booking, err := ctrl.bookingService.Retry(c.Context(), bookingID, userID)
	if err != nil {
		if err.Error() == "forbidden" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": booking, "error": nil, "status": "success"})
}
