// Package slip2go wraps Slip2Go's bank-slip verification API
// (https://connect.slip2go.com/api/verify-slip/qr-code/info).
package slip2go

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Client calls Slip2Go's bank-slip verification API.
type Client struct {
	apiURL string
	secret string
	http   *http.Client
}

// NewClient returns nil if secret is empty — callers must treat a nil client
// as "Slip2Go not configured" and skip verification.
func NewClient(apiURL, secret string) *Client {
	if secret == "" {
		return nil
	}
	return &Client{
		apiURL: strings.TrimRight(apiURL, "/"),
		secret: secret,
		http:   &http.Client{Timeout: 20 * time.Second},
	}
}

// SlipInfo is the subset of Slip2Go's slip data callers act on. Matching
// against a wallet's registered account is done in our own code (see
// MatchesWallet) rather than via Slip2Go's checkCondition — checkCondition's
// accountNumber match fails in practice against a PromptPay-proxy receiver
// (bank.account is null for those; only the masked proxy number is
// available), and Slip2Go truncates receiver names, so exact matching there
// doesn't work for this case.
type SlipInfo struct {
	TransRef      string
	Amount        float64
	ReceiverName  string // as returned by Slip2Go — may include a title (นาย/นาง) and be truncated
	ReceiverLast4 string // last 4 digits of whichever receiver identifier Slip2Go returned (bank account or proxy/PromptPay number)
	Raw           json.RawMessage
}

// slip2goEnvelope is Slip2Go's response envelope, calibrated against real
// calls:
//   - found:     {"code": "200000", "message": "Slip found.", "data": {...}}
//   - not found / bad request: HTTP 200 or 400 with a non-"200000" code
//   - account/package error:   HTTP 401, {"code": "401004", "message": "Package Expired."}
//
// The HTTP status alone is not enough — always check the body's own `code`.
type slip2goEnvelope struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Data    struct {
		TransRef string  `json:"transRef"`
		Amount   float64 `json:"amount"`
		Receiver struct {
			Account struct {
				Name string `json:"name"`
				Bank struct {
					Account *string `json:"account"`
				} `json:"bank"`
				Proxy struct {
					Account string `json:"account"`
				} `json:"proxy"`
			} `json:"account"`
		} `json:"receiver"`
	} `json:"data"`
}

// GetSlipInfo decodes a scanned slip QR code via Slip2Go — no checkCondition
// is sent; matching against a specific wallet is done by the caller via
// MatchesWallet.
func (c *Client) GetSlipInfo(ctx context.Context, qrCode string) (*SlipInfo, error) {
	body := map[string]any{"payload": map[string]any{"qrCode": qrCode}}
	payload, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		c.apiURL+"/api/verify-slip/qr-code/info", bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.secret)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("slip2go request failed: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read slip2go response: %w", err)
	}

	var envelope slip2goEnvelope
	_ = json.Unmarshal(raw, &envelope)

	if envelope.Code != "200000" {
		// Still return the raw body so the caller can persist it for audit
		// even though the slip lookup itself failed.
		return &SlipInfo{Raw: raw}, fmt.Errorf("%s", envelope.Message)
	}

	receiverAccount := envelope.Data.Receiver.Account.Proxy.Account
	if envelope.Data.Receiver.Account.Bank.Account != nil && *envelope.Data.Receiver.Account.Bank.Account != "" {
		receiverAccount = *envelope.Data.Receiver.Account.Bank.Account
	}

	return &SlipInfo{
		TransRef:      envelope.Data.TransRef,
		Amount:        envelope.Data.Amount,
		ReceiverName:  envelope.Data.Receiver.Account.Name,
		ReceiverLast4: last4Digits(receiverAccount),
		Raw:           raw,
	}, nil
}

// last4Digits returns the last 4 digits of s, ignoring any non-digit
// characters (masking like "09xxxx9882" still yields "9882").
func last4Digits(s string) string {
	var digits []byte
	for i := 0; i < len(s); i++ {
		if s[i] >= '0' && s[i] <= '9' {
			digits = append(digits, s[i])
		}
	}
	if len(digits) <= 4 {
		return string(digits)
	}
	return string(digits[len(digits)-4:])
}

// MatchesWallet reports whether this slip's receiver matches the given
// wallet's registered account. Deliberately does NOT compare receiver name —
// Slip2Go's name is Thai-title-prefixed and truncated, and receivers can be
// foreign nationals with English names, so name matching isn't a reliable
// signal here. Matching is last-4-digits of the account/PromptPay number —
// callers separately check the transferred amount against the expected price.
func (s *SlipInfo) MatchesWallet(walletAccountNumber string) bool {
	return s.ReceiverLast4 != "" && s.ReceiverLast4 == last4Digits(walletAccountNumber)
}
