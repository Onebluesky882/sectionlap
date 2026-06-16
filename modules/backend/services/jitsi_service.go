package services

import (
	"context"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"sectionlap/backend/models"
	"sectionlap/backend/repositories"
)

type JitsiTokenResult struct {
	Token  string `json:"token"`
	RoomID string `json:"roomId"`
}

type JitsiService interface {
	GetToken(ctx context.Context, sectionID, userID, userName string, role models.UserRoleType) (*JitsiTokenResult, error)
}

type jitsiService struct {
	appID      string
	appSecret  string
	domain     string
	sectionRepo repositories.SectionRepository
	bookingRepo repositories.BookingRepository
}

func NewJitsiService(appID, appSecret, domain string, sectionRepo repositories.SectionRepository, bookingRepo repositories.BookingRepository) JitsiService {
	return &jitsiService{
		appID:       appID,
		appSecret:   appSecret,
		domain:      domain,
		sectionRepo: sectionRepo,
		bookingRepo: bookingRepo,
	}
}

func (s *jitsiService) GetToken(ctx context.Context, sectionID, userID, userName string, role models.UserRoleType) (*JitsiTokenResult, error) {
	section, err := s.sectionRepo.GetByID(ctx, sectionID)
	if err != nil {
		return nil, fmt.Errorf("section not found: %w", err)
	}

	if role == models.RoleTeacher {
		if section.TeacherID != userID {
			return nil, fmt.Errorf("forbidden: only the section teacher can get a token")
		}
	} else {
		enrolled, err := s.bookingRepo.IsEnrolled(ctx, sectionID, userID)
		if err != nil {
			return nil, err
		}
		if !enrolled {
			return nil, fmt.Errorf("forbidden: student is not enrolled in this section")
		}
	}

	roomID := fmt.Sprintf("section-%s", sectionID)
	tokenStr, err := s.buildJWT(roomID, userID, userName, string(role))
	if err != nil {
		return nil, err
	}

	return &JitsiTokenResult{Token: tokenStr, RoomID: roomID}, nil
}

func (s *jitsiService) buildJWT(room, userID, userName, role string) (string, error) {
	if s.appSecret == "" {
		return "", fmt.Errorf("JITSI_APP_SECRET is not configured")
	}

	now := time.Now()
	claims := jwt.MapClaims{
		"iss":  s.appID,
		"sub":  s.domain,
		"aud":  "jitsi",
		"room": room,
		"nbf":  now.Unix(),
		"exp":  now.Add(4 * time.Hour).Unix(),
		"context": map[string]any{
			"user": map[string]any{
				"id":   userID,
				"name": userName,
				"role": role,
			},
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.appSecret))
}
