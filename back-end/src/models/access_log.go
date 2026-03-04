package models

import "time"

type AccessLog struct {
	ID            uint   `gorm:"primaryKey"`
	StudentID     uint   `gorm:"index"`
	CertificateID uint   `gorm:"index"`
	Action        string `gorm:"size:40"`
	IPAddress     string `gorm:"size:64"`
	CreatedAt     time.Time
}
