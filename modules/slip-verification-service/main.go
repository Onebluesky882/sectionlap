package main

import (
	"context"
	"crypto/subtle"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"

	"sectionlap/slip-verification-service/config"
	"sectionlap/slip-verification-service/slip2go"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()

	client := slip2go.NewClient(cfg.Slip2GoAPIURL, cfg.Slip2GoSecret)
	if client == nil {
		log.Fatal("SLIP_2GO_SECRET is not configured")
	}
	if cfg.InternalSecret == "" {
		log.Fatal("INTERNAL_SECRET is not configured")
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", healthHandler)
	mux.HandleFunc("POST /v1/verify-slip", verifySlipHandler(client, cfg.InternalSecret))

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: mux,
	}

	go func() {
		log.Printf("slip-verification-service listening on %s", srv.Addr)
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

type verifySlipRequest struct {
	QRCode              string `json:"qrCode"`
	WalletAccountNumber string `json:"walletAccountNumber,omitempty"`
}

type verifySlipResponse struct {
	TransRef      string          `json:"transRef"`
	Amount        float64         `json:"amount"`
	ReceiverName  string          `json:"receiverName"`
	ReceiverLast4 string          `json:"receiverLast4"`
	MatchesWallet *bool           `json:"matchesWallet,omitempty"`
	Raw           json.RawMessage `json:"raw,omitempty"`
}

// verifySlipHandler decodes a scanned slip QR code via Slip2Go and, if
// walletAccountNumber is supplied, reports whether the slip's receiver
// matches it (see slip2go.SlipInfo.MatchesWallet). Callers are still
// responsible for checking the transferred amount against the expected
// price themselves.
func verifySlipHandler(client *slip2go.Client, secret string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !hasValidInternalSecret(r, secret) {
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "forbidden"})
			return
		}

		var body verifySlipRequest
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
			return
		}
		if body.QRCode == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "qrCode is required"})
			return
		}

		info, err := client.GetSlipInfo(r.Context(), body.QRCode)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
			return
		}

		resp := verifySlipResponse{
			TransRef:      info.TransRef,
			Amount:        info.Amount,
			ReceiverName:  info.ReceiverName,
			ReceiverLast4: info.ReceiverLast4,
			Raw:           info.Raw,
		}
		if body.WalletAccountNumber != "" {
			matches := info.MatchesWallet(body.WalletAccountNumber)
			resp.MatchesWallet = &matches
		}
		writeJSON(w, http.StatusOK, resp)
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
