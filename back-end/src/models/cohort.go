package models

import "time"

type Cohort struct {
	ID        uint   `gorm:"primaryKey"`
	Label     string `gorm:"size:120"`
	LabelKey  string `gorm:"size:160;uniqueIndex"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
