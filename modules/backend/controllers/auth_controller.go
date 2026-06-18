package controllers

import (
	"github.com/Authula/authula/plugins/email-password"
	authulaservices "github.com/Authula/authula/services"
	"github.com/gofiber/fiber/v3"

	"sectionlap/backend/models"
	"sectionlap/backend/repositories"
)

type AuthController struct {
	emailPlugin    *email_password.EmailPasswordPlugin
	sessionService authulaservices.SessionService
	tokenService   authulaservices.TokenService
	userService    authulaservices.UserService
	userRoleRepo   repositories.UserRoleRepository
	cookieName     string
}

func NewAuthController(
	emailPlugin *email_password.EmailPasswordPlugin,
	sessionService authulaservices.SessionService,
	tokenService authulaservices.TokenService,
	userService authulaservices.UserService,
	userRoleRepo repositories.UserRoleRepository,
	cookieName string,
) *AuthController {
	return &AuthController{
		emailPlugin:    emailPlugin,
		sessionService: sessionService,
		tokenService:   tokenService,
		userService:    userService,
		userRoleRepo:   userRoleRepo,
		cookieName:     cookieName,
	}
}

type SignUpBody struct {
	Name     string              `json:"name"`
	Email    string              `json:"email"`
	Password string              `json:"password"`
	Role     models.UserRoleType `json:"role"`
}

func (ctrl *AuthController) SignUp(c fiber.Ctx) error {
	var body SignUpBody
	if err := c.Bind().JSON(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	if body.Role != models.RoleTeacher && body.Role != models.RoleStudent {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "role must be 'teacher' or 'student'"})
	}

	ip := c.IP()
	ua := c.Get("User-Agent")
	result, err := ctrl.emailPlugin.Api.SignUp(c.Context(), body.Name, body.Email, body.Password, nil, nil, nil, &ip, &ua)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	if err := ctrl.userRoleRepo.Upsert(c.Context(), &models.UserRole{
		UserID: result.User.ID,
		Role:   body.Role,
	}); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to set user role"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"data": fiber.Map{
			"token": result.SessionToken,
			"user": fiber.Map{
				"id":       result.User.ID,
				"name":     result.User.Name,
				"email":    result.User.Email,
				"role":     body.Role,
				"verified": body.Role == models.RoleStudent,
			},
		},
		"error":  nil,
		"status": "success",
	})
}

type SignInBody struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (ctrl *AuthController) SignIn(c fiber.Ctx) error {
	var body SignInBody
	if err := c.Bind().JSON(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	ip := c.IP()
	ua := c.Get("User-Agent")
	result, err := ctrl.emailPlugin.Api.SignIn(c.Context(), body.Email, body.Password, nil, &ip, &ua)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
	}

	userRole, err := ctrl.userRoleRepo.GetByUserID(c.Context(), result.User.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get user role"})
	}

	return c.JSON(fiber.Map{
		"data": fiber.Map{
			"token": result.SessionToken,
			"user": fiber.Map{
				"id":       result.User.ID,
				"name":     result.User.Name,
				"email":    result.User.Email,
				"role":     userRole.Role,
				"verified": userRole.IsVerified,
			},
		},
		"error":  nil,
		"status": "success",
	})
}

func (ctrl *AuthController) SignOut(c fiber.Ctx) error {
	token := c.Get("Authorization")
	if len(token) > 7 && token[:7] == "Bearer " {
		token = token[7:]
	} else {
		token = c.Cookies(ctrl.cookieName)
	}

	if token != "" {
		hashed := ctrl.tokenService.Hash(token)
		if session, err := ctrl.sessionService.GetByToken(c.Context(), hashed); err == nil && session != nil {
			_ = ctrl.sessionService.Delete(c.Context(), session.ID)
		}
	}

	return c.JSON(fiber.Map{
		"data":   fiber.Map{"message": "signed out"},
		"error":  nil,
		"status": "success",
	})
}

func (ctrl *AuthController) Me(c fiber.Ctx) error {
	userID, _ := c.Locals("userID").(string)

	user, err := ctrl.userService.GetByID(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "user not found"})
	}

	userRole, err := ctrl.userRoleRepo.GetByUserID(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "role not found"})
	}

	return c.JSON(fiber.Map{
		"data": fiber.Map{
			"id":       user.ID,
			"name":     user.Name,
			"email":    user.Email,
			"role":     userRole.Role,
			"verified": userRole.IsVerified,
		},
		"error":  nil,
		"status": "success",
	})
}
