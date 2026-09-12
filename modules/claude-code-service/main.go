package main

import (
	"context"
	"crypto/subtle"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"

	"sectionlap/claude-code-service/claudecode"
	"sectionlap/claude-code-service/config"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()

	if cfg.OAuthToken == "" {
		log.Fatal("CLAUDE_CODE_OAUTH_TOKEN is not configured")
	}
	if cfg.InternalSecret == "" {
		log.Fatal("INTERNAL_SECRET is not configured")
	}
	if _, err := exec.LookPath("claude"); err != nil {
		log.Fatal("claude CLI not found on PATH — install @anthropic-ai/claude-code")
	}

	client := claudecode.NewClient(cfg.Model)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", healthHandler)
	mux.HandleFunc("POST /v1/parse-plan", parsePlanHandler(client, cfg.InternalSecret))

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: mux,
	}

	go func() {
		log.Printf("claude-code-service listening on %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

type parsePlanRequest struct {
	PromptText string `json:"promptText"`
}

// parsePlanHandler turns free-text into a structured plan via the Claude
// Code CLI. Response shape matches what modules/backend's
// VisualPlanService.parseWithClaudeCode expects — same fields the old Groq
// call returned.
func parsePlanHandler(client *claudecode.Client, secret string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !hasValidInternalSecret(r, secret) {
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "forbidden"})
			return
		}

		var body parsePlanRequest
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
			return
		}
		if body.PromptText == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "promptText is required"})
			return
		}

		plan, err := client.Parse(r.Context(), body.PromptText)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
			return
		}

		writeJSON(w, http.StatusOK, plan)
	}
}

func hasValidInternalSecret(r *http.Request, secret string) bool {
	got := r.Header.Get("X-Internal-Secret")
	return subtle.ConstantTimeCompare([]byte(got), []byte(secret)) == 1
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
