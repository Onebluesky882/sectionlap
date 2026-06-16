package routes

import (
	"github.com/gofiber/fiber/v3"

	"sectionlap/backend/controllers"
	"sectionlap/backend/middlewares"
	"sectionlap/backend/models"
)

func Register(
	app *fiber.App,
	authCtrl *controllers.AuthController,
	sectionCtrl *controllers.SectionController,
	bookingCtrl *controllers.BookingController,
	jitsiCtrl *controllers.JitsiController,
	authMw *middlewares.AuthMiddleware,
) {
	api := app.Group("/api")

	// Auth (public)
	auth := api.Group("/auth")
	auth.Post("/signup", authCtrl.SignUp)
	auth.Post("/signin", authCtrl.SignIn)
	auth.Post("/signout", authCtrl.SignOut)
	auth.Get("/me", authMw.Require(), authCtrl.Me)

	// Sections (mixed auth)
	sections := api.Group("/sections")
	sections.Get("/", sectionCtrl.List)
	sections.Get("/:id", sectionCtrl.GetByID)
	sections.Post("/", authMw.Require(), authMw.RequireRole(models.RoleTeacher), sectionCtrl.Create)
	sections.Put("/:id", authMw.Require(), authMw.RequireRole(models.RoleTeacher), sectionCtrl.Update)

	// Jitsi token (requires auth + enrollment or teacher)
	sections.Get("/:id/jitsi-token", authMw.Require(), jitsiCtrl.GetToken)

	// Bookings (student only)
	bookings := api.Group("/bookings", authMw.Require())
	bookings.Post("/", bookingCtrl.Create)
	bookings.Get("/", bookingCtrl.List)
	bookings.Post("/:id/pay", bookingCtrl.Pay)
	bookings.Post("/:id/fail", bookingCtrl.Fail)
	bookings.Post("/:id/retry", bookingCtrl.Retry)
}
