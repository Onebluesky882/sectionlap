package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/Authula/authula"
	authulaevents "github.com/Authula/authula/events"
	authulamodels "github.com/Authula/authula/models"
	email_password "github.com/Authula/authula/plugins/email-password"
	email_password_types "github.com/Authula/authula/plugins/email-password/types"
	"github.com/gofiber/fiber/v3"
	"github.com/joho/godotenv"

	"sectionlap/backend/config"
	"sectionlap/backend/controllers"
	bundb "sectionlap/backend/db"
	"sectionlap/backend/middlewares"
	"sectionlap/backend/repositories"
	"sectionlap/backend/routes"
	"sectionlap/backend/services"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()

	db, err := bundb.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}

	if err := bundb.Migrate(db); err != nil {
		log.Fatalf("migration failed: %v", err)
	}

	epPlugin := email_password.New(email_password_types.EmailPasswordPluginConfig{
		Enabled:    true,
		AutoSignIn: true,
	})

	auth := authula.New(&authula.AuthConfig{
		Config: &authulamodels.Config{
			AppName: "SectionLap",
			Secret:  cfg.AuthSecret,
			Database: authulamodels.DatabaseConfig{
				Provider: "postgres",
				URL:      cfg.DatabaseURL,
			},
			Session: authulamodels.SessionConfig{
				CookieName: "sectionlap_session",
				ExpiresIn:  cfg.SessionMaxAge,
			},
			EventBus: authulamodels.EventBusConfig{
				Provider: authulaevents.ProviderGoChannel,
			},
			Plugins: authulamodels.PluginsConfig{
				authulamodels.PluginEmailPassword.String(): map[string]any{
					"enabled": true,
				},
			},
		},
		DB:      db,
		Plugins: []authulamodels.Plugin{epPlugin},
	})

	rawPlugin := auth.PluginRegistry.GetPlugin(authulamodels.PluginEmailPassword.String())
	emailPlugin, ok := rawPlugin.(*email_password.EmailPasswordPlugin)
	if !ok {
		log.Fatal("email-password plugin not initialized")
	}

	coreServices := auth.CoreServices()

	// Repositories
	userRoleRepo := repositories.NewUserRoleRepository(db)
	sectionRepo := repositories.NewSectionRepository(db)
	bookingRepo := repositories.NewBookingRepository(db)

	// Services
	sectionSvc := services.NewSectionService(sectionRepo)
	bookingSvc := services.NewBookingService(bookingRepo, sectionRepo)
	jitsiSvc := services.NewJitsiService(
		cfg.JitsiAppID, cfg.JitsiAppSecret, cfg.JitsiDomain,
		sectionRepo, bookingRepo,
	)

	// Controllers
	const cookieName = "sectionlap_session"
	authCtrl := controllers.NewAuthController(
		emailPlugin,
		coreServices.SessionService,
		coreServices.TokenService,
		coreServices.UserService,
		userRoleRepo,
		cookieName,
	)
	sectionCtrl := controllers.NewSectionController(sectionSvc)
	bookingCtrl := controllers.NewBookingController(bookingSvc)
	jitsiCtrl := controllers.NewJitsiController(jitsiSvc)

	authMw := middlewares.NewAuthMiddleware(
		coreServices.SessionService,
		coreServices.TokenService,
		userRoleRepo,
		cookieName,
	)

	app := fiber.New(fiber.Config{AppName: "SectionLap Backend"})

	routes.Register(app, authCtrl, sectionCtrl, bookingCtrl, jitsiCtrl, authMw)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("SectionLap backend listening on %s", addr)

	go func() {
		if err := app.Listen(addr); err != nil {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutting down...")
	_ = app.Shutdown()
}
