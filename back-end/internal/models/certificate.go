package models

import "time"

type Certificate struct {
	ID               uint    `gorm:"primaryKey"`
	StudentID        uint    `gorm:"index"`
	Student          Student `gorm:"foreignKey:StudentID"`
	DocumentHash     string  `gorm:"size:120"`
	EncryptedCID     string  `gorm:"size:200"`
	EncryptedKey     string  `gorm:"size:400"`
	TokenID          string  `gorm:"size:80;index"`
	ContractAddress  string  `gorm:"size:80;index"`
	IssuerDID        string  `gorm:"size:120"`
	VerificationCode string  `gorm:"size:16;uniqueIndex"`
	Status           string  `gorm:"size:20;default:active"`
	IssuedAt         time.Time
	RevokedAt        *time.Time
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
