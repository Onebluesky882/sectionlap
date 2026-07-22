package config

import "os"

type Config struct {
	Port           string
	Slip2GoAPIURL  string
	Slip2GoSecret  string
	InternalSecret string
}

func Load() Config {
	return Config{
		Port:           getEnv("PORT", "8090"),
		Slip2GoAPIURL:  getEnv("SLIP2GO_API_URL", "https://connect.slip2go.com"),
		Slip2GoSecret:  getEnv("SLIP_2GO_SECRET", ""),
		InternalSecret: getEnv("INTERNAL_SECRET", ""),
	}
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}
