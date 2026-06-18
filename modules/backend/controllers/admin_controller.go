package controllers

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uptrace/bun"

	"sectionlap/backend/models"
	"sectionlap/backend/repositories"
	"sectionlap/backend/services"
)

type AdminController struct {
	userRoleRepo       repositories.UserRoleRepository
	teacherProfileRepo repositories.TeacherProfileRepository
	sectionRepo        repositories.SectionRepository
	db                 *bun.DB
}

func NewAdminController(
	userRoleRepo repositories.UserRoleRepository,
	teacherProfileRepo repositories.TeacherProfileRepository,
	sectionRepo repositories.SectionRepository,
	db *bun.DB,
) *AdminController {
	return &AdminController{
		userRoleRepo:       userRoleRepo,
		teacherProfileRepo: teacherProfileRepo,
		sectionRepo:        sectionRepo,
		db:                 db,
	}
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
		UserID     string                 `json:"userId"`
		IsVerified bool                   `json:"isVerified"`
		Profile    *models.TeacherProfile `json:"profile"`
	}

	rows := make([]TeacherRow, 0, len(roles))
	for _, r := range roles {
		rows = append(rows, TeacherRow{
			UserID:     r.UserID,
			IsVerified: r.IsVerified,
			Profile:    profileMap[r.UserID],
		})
	}

	return c.JSON(fiber.Map{
		"data":   rows,
		"error":  nil,
		"status": "success",
	})
}

func (ctrl *AdminController) ApproveTeacher(c fiber.Ctx) error {
	id := c.Params("id")
	if err := ctrl.userRoleRepo.SetVerified(c.Context(), id, true); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to approve teacher"})
	}
	return c.JSON(fiber.Map{"data": nil, "error": nil, "status": "success"})
}

func (ctrl *AdminController) RejectTeacher(c fiber.Ctx) error {
	id := c.Params("id")
	if err := ctrl.userRoleRepo.SetVerified(c.Context(), id, false); err != nil {
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
