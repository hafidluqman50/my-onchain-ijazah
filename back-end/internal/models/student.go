package models

import "time"

type Student struct {
	ID                 uint   `gorm:"primaryKey"`
	Name               string `gorm:"size:120"`
	Email              string `gorm:"uniqueIndex;size:160"`
	PasswordHash       string `gorm:"size:200"`
	MustChangePassword bool   `gorm:"default:true"`
	Status             string `gorm:"size:20;default:active"`
	CreatedAt          time.Time
	UpdatedAt          time.Time
}
