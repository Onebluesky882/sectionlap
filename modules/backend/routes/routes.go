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
	feedbackCtrl *controllers.FeedbackController,
	teacherProfileCtrl *controllers.TeacherProfileController,
	studentProfileCtrl *controllers.StudentProfileController,
	adminCtrl *controllers.AdminController,
	supervisorCtrl *controllers.SupervisorController,
	visualPlanCtrl *controllers.VisualPlanController,
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
	bookings.Post("/:id/cancel", bookingCtrl.Cancel)

	// Feedback (requires auth)
	feedback := api.Group("/feedback", authMw.Require())
	feedback.Post("/", feedbackCtrl.Submit)

	// Teacher profile & verification (teacher only)
	teacher := api.Group("/teacher", authMw.Require(), authMw.RequireRole(models.RoleTeacher))
	teacher.Post("/profile", teacherProfileCtrl.Submit)
	teacher.Get("/profile", teacherProfileCtrl.Get)

	// Student profile (student only)
	student := api.Group("/student", authMw.Require(), authMw.RequireRole(models.RoleStudent))
	student.Post("/profile", studentProfileCtrl.Submit)
	student.Get("/profile", studentProfileCtrl.Get)

	// Admin — can update any section + approve/reject teachers & sections
	admin := api.Group("/admin", authMw.Require(), authMw.RequireRole(models.RoleAdmin))
	admin.Get("/stats", adminCtrl.GetStats)
	admin.Get("/teachers", adminCtrl.ListTeachers)
	admin.Post("/teachers/:id/approve", adminCtrl.ApproveTeacher)
	admin.Post("/teachers/:id/reject", adminCtrl.RejectTeacher)
	admin.Get("/sections", adminCtrl.ListSections)
	admin.Put("/sections/:id", adminCtrl.UpdateSection)
	admin.Patch("/sections/:id", adminCtrl.UpdateSection)
	admin.Post("/sections/:id/approve", adminCtrl.ApproveSection)
	admin.Post("/sections/:id/reject", adminCtrl.RejectSection)

	// Supervisor & Dev — full manual CRUD on sections (shared handler, role-gated)
	svMw := authMw.RequireAnyRole(models.RoleSupervisor, models.RoleDev)
	sv := api.Group("/internal/sections", authMw.Require(), svMw)
	sv.Get("/", supervisorCtrl.ListSections)
	sv.Get("/:id", supervisorCtrl.GetSection)
	sv.Post("/", supervisorCtrl.CreateSection)
	sv.Put("/:id", supervisorCtrl.UpdateSection)
	sv.Patch("/:id", supervisorCtrl.UpdateSection)
	sv.Delete("/:id", supervisorCtrl.DeleteSection)

	// Visual Plans — AI-generated animated flowcharts
	vp := api.Group("/visual-plans")
	vp.Post("/", authMw.Require(), visualPlanCtrl.Generate)
	vp.Get("/", authMw.Require(), visualPlanCtrl.List)
	vp.Get("/:id", visualPlanCtrl.GetByID)
	vp.Delete("/:id", authMw.Require(), visualPlanCtrl.Delete)
}
