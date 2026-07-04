package routes

import (
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/limiter"

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
	lessonCtrl *controllers.LessonController,
	lessonClipCtrl *controllers.LessonClipController,
	walletCtrl *controllers.TeacherWalletController,
	internalRecordingCtrl *controllers.InternalRecordingController,
	authMw *middlewares.AuthMiddleware,
	internalIngestSecret string,
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

	// Lessons (mixed auth) — topics + video clips within a section
	sections.Get("/:sectionId/lessons", lessonCtrl.List)
	sections.Post("/:sectionId/lessons", authMw.Require(), authMw.RequireRole(models.RoleTeacher), lessonCtrl.Create)
	sections.Patch("/:sectionId/lessons/reorder", authMw.Require(), authMw.RequireRole(models.RoleTeacher), lessonCtrl.Reorder)

	lessons := api.Group("/lessons")
	lessons.Put("/:lessonId", authMw.Require(), authMw.RequireRole(models.RoleTeacher), lessonCtrl.Update)
	lessons.Delete("/:lessonId", authMw.Require(), authMw.RequireRole(models.RoleTeacher), lessonCtrl.Delete)
	lessons.Post("/:lessonId/clips", authMw.Require(), authMw.RequireRole(models.RoleTeacher), lessonClipCtrl.Create)
	lessons.Delete("/:lessonId/clips/:clipId", authMw.Require(), authMw.RequireRole(models.RoleTeacher), lessonClipCtrl.Delete)
	lessons.Get("/:lessonId/clips/:clipId/playback", lessonClipCtrl.Playback)

	// Bookings (student only)
	bookings := api.Group("/bookings", authMw.Require())
	bookings.Post("/", bookingCtrl.Create)
	bookings.Get("/", bookingCtrl.List)
	bookings.Post("/:id/pay", bookingCtrl.Pay)
	bookings.Post("/:id/fail", bookingCtrl.Fail)
	bookings.Post("/:id/retry", bookingCtrl.Retry)
	bookings.Post("/:id/cancel", bookingCtrl.Cancel)
	bookings.Post("/:id/verify-slip", bookingCtrl.VerifySlip)

	// Wallet — section-scoped lookup is public so a paying student can see it
	sections.Get("/:id/wallet", walletCtrl.GetForSection)

	// Internal — machine-to-machine only (Jibri's finalize script), gated by
	// a shared secret rather than a user session.
	internal := api.Group("/internal", authMw.RequireInternalSecret(internalIngestSecret))
	internal.Post("/recordings/presign", internalRecordingCtrl.Presign)
	internal.Post("/recordings/:clipId/complete", internalRecordingCtrl.Complete)

	// Feedback (requires auth)
	feedback := api.Group("/feedback", authMw.Require())
	feedback.Post("/", feedbackCtrl.Submit)

	// Teacher profile & verification (teacher only)
	teacher := api.Group("/teacher", authMw.Require(), authMw.RequireRole(models.RoleTeacher))
	teacher.Post("/profile", teacherProfileCtrl.Submit)
	teacher.Get("/profile", teacherProfileCtrl.Get)
	teacher.Get("/wallet", walletCtrl.Get)
	teacher.Put("/wallet", walletCtrl.Upsert)
	teacher.Post("/wallet/test-slip", walletCtrl.TestSlip)

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

	// Visual Plans — AI-generated animated flowcharts. Generation is open to
	// anyone (no login required) but rate-limited per IP since each call costs
	// real money (Claude + render service + R2 storage).
	vp := api.Group("/visual-plans")
	genLimiter := limiter.New(limiter.Config{
		Max:        5,
		Expiration: 10 * time.Minute,
	})
	vp.Post("/", authMw.OptionalAuth(), genLimiter, visualPlanCtrl.Generate)
	vp.Get("/", authMw.Require(), visualPlanCtrl.List)
	vp.Get("/:id", visualPlanCtrl.GetByID)
	vp.Delete("/:id", authMw.Require(), visualPlanCtrl.Delete)
}
