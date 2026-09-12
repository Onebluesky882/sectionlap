package config

import "os"

type Config struct {
	Port           string
	OAuthToken     string
	InternalSecret string
	Model          string
}

func Load() *Config {
	return &Config{
		Port:           getEnv("PORT", "9100"),
		OAuthToken:     os.Getenv("CLAUDE_CODE_OAUTH_TOKEN"),
		InternalSecret: os.Getenv("INTERNAL_SECRET"),
		// Haiku is a fast, cheap fit for this structured-JSON-extraction task —
		// no need for a larger model just to break a prompt into steps.
		Model: getEnv("CLAUDE_CODE_MODEL", "claude-haiku-4-5-20251001"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
