package admin

import (
	"errors"
	"strings"
	"time"

	"my-onchain-ijazah/backend/src/models"
	"my-onchain-ijazah/backend/src/repositories"
	"my-onchain-ijazah/backend/src/utils"

	"gorm.io/gorm"
)

const (
	maxFailedAttempts = 5
	lockDuration      = 15 * time.Minute
)

type AuthService struct {
	Admins    repositories.AdminRepository
	JWTSecret string
}

type LoginResult struct {
	AccessToken string
	ExpiresIn   int64
}

func (s AuthService) BootstrapDefaultAdmin(email string, password string) error {
	email = strings.TrimSpace(strings.ToLower(email))
	password = strings.TrimSpace(password)
	if email == "" || password == "" {
		return nil
	}

	count, err := s.Admins.Count()
	if err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	hash, err := utils.HashPassword(password)
	if err != nil {
		return err
	}

	return s.Admins.Create(&models.Admin{
		Email:        email,
		PasswordHash: hash,
		Status:       "active",
	})
}

func (s AuthService) Login(email string, password string) (*LoginResult, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if email == "" || password == "" {
		return nil, errors.New("invalid credentials")
	}

	admin, err := s.Admins.GetByEmail(email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid credentials")
		}
		return nil, err
	}
	if admin.Status != "active" {
		return nil, errors.New("account is inactive")
	}

	now := time.Now()
	if admin.LockedUntil != nil && now.Before(*admin.LockedUntil) {
		return nil, errors.New("account temporarily locked")
	}

	if !utils.CheckPassword(admin.PasswordHash, password) {
		admin.FailedAttempts++
		if admin.FailedAttempts >= maxFailedAttempts {
			lockedUntil := now.Add(lockDuration)
			admin.LockedUntil = &lockedUntil
			admin.FailedAttempts = 0
		}
		_ = s.Admins.Update(admin)
		return nil, errors.New("invalid credentials")
	}

	admin.FailedAttempts = 0
	admin.LockedUntil = nil
	admin.LastLoginAt = &now
	if err := s.Admins.Update(admin); err != nil {
		return nil, err
	}

	ttl := 12 * time.Hour
	token, err := utils.GenerateAdminToken(s.JWTSecret, admin.ID, admin.Email, ttl)
	if err != nil {
		return nil, err
	}

	return &LoginResult{
		AccessToken: token,
		ExpiresIn:   int64(ttl.Seconds()),
	}, nil
}
