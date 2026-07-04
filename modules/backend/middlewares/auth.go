package middlewares

import (
	"crypto/subtle"
	"strings"

	"github.com/Authula/authula/services"
	"github.com/gofiber/fiber/v3"

	"sectionlap/backend/models"
	"sectionlap/backend/repositories"
)

type contextKey string

const (
	CtxUserID   contextKey = "userID"
	CtxUserName contextKey = "userName"
	CtxUserRole contextKey = "userRole"
)

type AuthMiddleware struct {
	sessionService    services.SessionService
	tokenService      services.TokenService
	userRoleRepo      repositories.UserRoleRepository
	sessionCookieName string
}

func NewAuthMiddleware(
	sessionService services.SessionService,
	tokenService services.TokenService,
	userRoleRepo repositories.UserRoleRepository,
	sessionCookieName string,
) *AuthMiddleware {
	return &AuthMiddleware{
		sessionService:    sessionService,
		tokenService:      tokenService,
		userRoleRepo:      userRoleRepo,
		sessionCookieName: sessionCookieName,
	}
}

func (m *AuthMiddleware) extractToken(c fiber.Ctx) string {
	if auth := c.Get("Authorization"); strings.HasPrefix(auth, "Bearer ") {
		return strings.TrimPrefix(auth, "Bearer ")
	}
	return c.Cookies(m.sessionCookieName)
}

func (m *AuthMiddleware) Require() fiber.Handler {
	return func(c fiber.Ctx) error {
		token := m.extractToken(c)
		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		hashed := m.tokenService.Hash(token)
		session, err := m.sessionService.GetByToken(c.Context(), hashed)
		if err != nil || session == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		userRole, err := m.userRoleRepo.GetByUserID(c.Context(), session.UserID)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized: role not set"})
		}

		c.Locals(string(CtxUserID), session.UserID)
		c.Locals(string(CtxUserRole), userRole.Role)

		return c.Next()
	}
}

func (m *AuthMiddleware) RequireRole(role models.UserRoleType) fiber.Handler {
	return func(c fiber.Ctx) error {
		userRole, ok := c.Locals(string(CtxUserRole)).(models.UserRoleType)
		if !ok || userRole != role {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}
		return c.Next()
	}
}

// OptionalAuth populates CtxUserID/CtxUserRole when a valid session is present,
// but always calls Next() — anonymous requests are allowed through with no locals set.
func (m *AuthMiddleware) OptionalAuth() fiber.Handler {
	return func(c fiber.Ctx) error {
		token := m.extractToken(c)
		if token == "" {
			return c.Next()
		}

		hashed := m.tokenService.Hash(token)
		session, err := m.sessionService.GetByToken(c.Context(), hashed)
		if err != nil || session == nil {
			return c.Next()
		}

		userRole, err := m.userRoleRepo.GetByUserID(c.Context(), session.UserID)
		if err != nil {
			return c.Next()
		}

		c.Locals(string(CtxUserID), session.UserID)
		c.Locals(string(CtxUserRole), userRole.Role)
		return c.Next()
	}
}

// RequireInternalSecret gates machine-to-machine endpoints (no logged-in user
// exists for these callers — e.g. the Jibri finalize script) behind a shared
// secret passed in the X-Internal-Secret header, compared in constant time.
func (m *AuthMiddleware) RequireInternalSecret(secret string) fiber.Handler {
	return func(c fiber.Ctx) error {
		if secret == "" {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "INTERNAL_INGEST_SECRET is not configured"})
		}
		got := c.Get("X-Internal-Secret")
		if subtle.ConstantTimeCompare([]byte(got), []byte(secret)) != 1 {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}
		return c.Next()
	}
}

// RequireAnyRole passes if the authenticated user holds at least one of the given roles.
func (m *AuthMiddleware) RequireAnyRole(roles ...models.UserRoleType) fiber.Handler {
	set := make(map[models.UserRoleType]struct{}, len(roles))
	for _, r := range roles {
		set[r] = struct{}{}
	}
	return func(c fiber.Ctx) error {
		userRole, ok := c.Locals(string(CtxUserRole)).(models.UserRoleType)
		if !ok {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}
		if _, allowed := set[userRole]; !allowed {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}
		return c.Next()
	}
}

func GetUserID(c fiber.Ctx) string {
	v, _ := c.Locals(string(CtxUserID)).(string)
	return v
}

func GetUserRole(c fiber.Ctx) models.UserRoleType {
	v, _ := c.Locals(string(CtxUserRole)).(models.UserRoleType)
	return v
}
