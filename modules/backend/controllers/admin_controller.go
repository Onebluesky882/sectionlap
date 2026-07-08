package controllers

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uptrace/bun"

	"sectionlap/backend/middlewares"
	"sectionlap/backend/models"
	"sectionlap/backend/repositories"
	"sectionlap/backend/services"
)

type AdminController struct {
	userRoleRepo        repositories.UserRoleRepository
	teacherProfileRepo  repositories.TeacherProfileRepository
	sectionRepo         repositories.SectionRepository
	sectionService      services.SectionService
	verificationService *services.TeacherVerificationService
	presigner           *services.R2Presigner
	db                  *bun.DB
}

func NewAdminController(
	userRoleRepo repositories.UserRoleRepository,
	teacherProfileRepo repositories.TeacherProfileRepository,
	sectionRepo repositories.SectionRepository,
	sectionService services.SectionService,
	verificationService *services.TeacherVerificationService,
	presigner *services.R2Presigner,
	db *bun.DB,
) *AdminController {
	return &AdminController{
		userRoleRepo:        userRoleRepo,
		teacherProfileRepo:  teacherProfileRepo,
		sectionRepo:         sectionRepo,
		sectionService:      sectionService,
		verificationService: verificationService,
		presigner:           presigner,
		db:                  db,
	}
}

// UpdateSection allows admin to update any section's fields (no ownership check).
func (ctrl *AdminController) UpdateSection(c fiber.Ctx) error {
	id := c.Params("id")
	var input services.UpdateSectionInput
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	section, err := ctrl.sectionService.AdminUpdate(c.Context(), id, input)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": section, "error": nil, "status": "success"})
}

func (ctrl *AdminController) GetStats(c fiber.Ctx) error {
	ctx := c.Context()

	teachers, err := ctrl.userRoleRepo.ListByRole(ctx, models.RoleTeacher)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch teachers"})
	}

	students, err := ctrl.userRoleRepo.ListByRole(ctx, models.RoleStudent)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch students"})
	}

	sections, err := ctrl.sectionRepo.GetAllAdmin(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch sections"})
	}

	pendingTeachers := 0
	approvedTeachers := 0
	for _, t := range teachers {
		if t.IsVerified {
			approvedTeachers++
		} else {
			pendingTeachers++
		}
	}

	pendingSections := 0
	approvedSections := 0
	for _, s := range sections {
		switch s.Status {
		case "approved":
			approvedSections++
		case "pending":
			pendingSections++
		}
	}

	return c.JSON(fiber.Map{
		"data": fiber.Map{
			"pendingTeachers":  pendingTeachers,
			"approvedTeachers": approvedTeachers,
			"pendingSections":  pendingSections,
			"approvedSections": approvedSections,
			"totalStudents":    len(students),
		},
		"error":  nil,
		"status": "success",
	})
}

func (ctrl *AdminController) ListTeachers(c fiber.Ctx) error {
	ctx := c.Context()

	roles, err := ctrl.userRoleRepo.ListByRole(ctx, models.RoleTeacher)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch teacher roles"})
	}

	profiles, err := ctrl.teacherProfileRepo.ListAll(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch teacher profiles"})
	}

	profileMap := make(map[string]*models.TeacherProfile, len(profiles))
	for i := range profiles {
		profileMap[profiles[i].TeacherID] = &profiles[i]
	}

	type TeacherRow struct {
		UserID      string                 `json:"userId"`
		IsVerified  bool                   `json:"isVerified"`
		Profile     *models.TeacherProfile `json:"profile"`
		DocumentURL string                 `json:"documentUrl,omitempty"`
	}

	rows := make([]TeacherRow, 0, len(roles))
	for _, r := range roles {
		profile := profileMap[r.UserID]
		row := TeacherRow{
			UserID:     r.UserID,
			IsVerified: r.IsVerified,
			Profile:    profile,
		}
		if ctrl.presigner != nil && profile != nil && profile.IdentityDocR2Key != "" {
			if url, err := ctrl.presigner.PresignGetURL(ctx, profile.IdentityDocR2Key); err == nil {
				row.DocumentURL = url
			}
		}
		rows = append(rows, row)
	}

	return c.JSON(fiber.Map{
		"data":   rows,
		"error":  nil,
		"status": "success",
	})
}

func (ctrl *AdminController) ApproveTeacher(c fiber.Ctx) error {
	id := c.Params("id")
	reviewerID := middlewares.GetUserID(c)
	if err := ctrl.verificationService.Approve(c.Context(), id, reviewerID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to approve teacher"})
	}
	return c.JSON(fiber.Map{"data": nil, "error": nil, "status": "success"})
}

type RejectTeacherBody struct {
	Reason string `json:"reason"`
}

func (ctrl *AdminController) RejectTeacher(c fiber.Ctx) error {
	id := c.Params("id")
	reviewerID := middlewares.GetUserID(c)

	var body RejectTeacherBody
	_ = c.Bind().JSON(&body)
	if body.Reason == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "rejection reason is required"})
	}

	if err := ctrl.verificationService.Reject(c.Context(), id, reviewerID, body.Reason); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to reject teacher"})
	}
	return c.JSON(fiber.Map{"data": nil, "error": nil, "status": "success"})
}

func (ctrl *AdminController) ListSections(c fiber.Ctx) error {
	sections, err := ctrl.sectionRepo.GetAllAdmin(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch sections"})
	}
	return c.JSON(fiber.Map{
		"data":   sections,
		"error":  nil,
		"status": "success",
	})
}

func (ctrl *AdminController) ApproveSection(c fiber.Ctx) error {
	id := c.Params("id")
	_, err := ctrl.db.NewUpdate().TableExpr("sections").Set("status = ?", "approved").Where("id = ?", id).Exec(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to approve section"})
	}
	return c.JSON(fiber.Map{"data": nil, "error": nil, "status": "success"})
}

func (ctrl *AdminController) RejectSection(c fiber.Ctx) error {
	id := c.Params("id")
	_, err := ctrl.db.NewUpdate().TableExpr("sections").Set("status = ?", "rejected").Where("id = ?", id).Exec(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to reject section"})
	}
	return c.JSON(fiber.Map{"data": nil, "error": nil, "status": "success"})
}
