package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port              string
	DatabaseURL       string
	AuthSecret        string
	JitsiAppID        string
	JitsiAppSecret    string
	JitsiDomain       string
	SessionMaxAge     time.Duration
	ClaudeAPIKey      string
	VisualServiceURL  string
	R2Endpoint        string
	R2AccessKeyID     string
	R2SecretAccessKey string
	R2Bucket          string
}

func Load() *Config {
	sessionHours := 24
	if v := os.Getenv("SESSION_HOURS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			sessionHours = n
		}
	}

	return &Config{
		Port:              getEnv("PORT", "8080"),
		DatabaseURL:       getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/sectionlap?sslmode=disable"),
		AuthSecret:        mustEnv("AUTH_SECRET"),
		JitsiAppID:        getEnv("JITSI_APP_ID", "sectionlap"),
		JitsiAppSecret:    getEnv("JITSI_APP_SECRET", ""),
		JitsiDomain:       getEnv("JITSI_DOMAIN", "localhost"),
		SessionMaxAge:     time.Duration(sessionHours) * time.Hour,
		ClaudeAPIKey:      getEnv("CLAUDE_API_KEY", ""),
		VisualServiceURL:  getEnv("VISUAL_SERVICE_URL", "http://localhost:9000"),
		R2Endpoint:        getEnv("R2_ENDPOINT", ""),
		R2AccessKeyID:     getEnv("R2_ACCESS_KEY_ID", ""),
		R2SecretAccessKey: getEnv("R2_SECRET_ACCESS_KEY", ""),
		R2Bucket:          getEnv("R2_BUCKET", ""),
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
