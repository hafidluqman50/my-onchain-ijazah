package models

import "time"

type Certificate struct {
	ID               uint       `gorm:"column:id;primaryKey"`
	StudentID        uint       `gorm:"column:student_id;index"`
	Student          Student    `gorm:"foreignKey:StudentID"`
	CohortID         uint       `gorm:"column:cohort_id;index"`
	Cohort           Cohort     `gorm:"foreignKey:CohortID"`
	DocumentHash     string     `gorm:"column:document_hash;size:120"`
	EncryptedCID     string     `gorm:"column:encrypted_cid;size:200"`
	EncryptedKey     string     `gorm:"column:encrypted_key;size:400"`
	TokenID          string     `gorm:"column:token_id;size:80;index"`
	ContractAddress  string     `gorm:"column:contract_address;size:80;index"`
	IssuerDID        string     `gorm:"column:issuer_did;size:120"`
	VerificationCode string     `gorm:"column:verification_code;size:16;uniqueIndex"`
	Status           string     `gorm:"column:status;size:20;default:active"`
	IssuedAt         time.Time  `gorm:"column:issued_at"`
	RevokedAt        *time.Time `gorm:"column:revoked_at"`
	CreatedAt        time.Time  `gorm:"column:created_at"`
	UpdatedAt        time.Time  `gorm:"column:updated_at"`
}
