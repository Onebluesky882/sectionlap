package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port           string
	DatabaseURL    string
	AuthSecret     string
	JitsiAppID     string
	JitsiAppSecret string
	JitsiDomain    string
	SessionMaxAge  time.Duration
}

func Load() *Config {
	sessionHours := 24
	if v := os.Getenv("SESSION_HOURS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			sessionHours = n
		}
	}

	return &Config{
		Port:           getEnv("PORT", "8080"),
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/sectionlap?sslmode=disable"),
		AuthSecret:     mustEnv("AUTH_SECRET"),
		JitsiAppID:     getEnv("JITSI_APP_ID", "sectionlap"),
		JitsiAppSecret: getEnv("JITSI_APP_SECRET", ""),
		JitsiDomain:    getEnv("JITSI_DOMAIN", "localhost"),
		SessionMaxAge:  time.Duration(sessionHours) * time.Hour,
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		panic("required env var not set: " + key)
	}
	return v
}
