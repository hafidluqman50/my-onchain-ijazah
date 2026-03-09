package models

import "time"

type Admin struct {
	ID             uint   `gorm:"primaryKey"`
	Email          string `gorm:"uniqueIndex;size:160"`
	PasswordHash   string `gorm:"size:200"`
	Status         string `gorm:"size:20;default:active"`
	FailedAttempts int    `gorm:"default:0"`
	LockedUntil    *time.Time
	LastLoginAt    *time.Time
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
