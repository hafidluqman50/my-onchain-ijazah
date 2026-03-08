package repositories

import (
	"errors"

	"my-onchain-ijazah/backend/src/models"

	"gorm.io/gorm"
)

type AdminRepository interface {
	GetByEmail(email string) (*models.Admin, error)
	Create(admin *models.Admin) error
	Update(admin *models.Admin) error
	Count() (int64, error)
}

type GormAdminRepository struct {
	db *gorm.DB
}

func NewAdminRepository(db *gorm.DB) *GormAdminRepository {
	return &GormAdminRepository{db: db}
}

func (r *GormAdminRepository) GetByEmail(email string) (*models.Admin, error) {
	var admin models.Admin
	if err := r.db.Where("email = ?", email).First(&admin).Error; err != nil {
		return nil, err
	}
	return &admin, nil
}

func (r *GormAdminRepository) Create(admin *models.Admin) error {
	return r.db.Create(admin).Error
}

func (r *GormAdminRepository) Update(admin *models.Admin) error {
	if admin == nil {
		return errors.New("admin is nil")
	}
	return r.db.Save(admin).Error
}

func (r *GormAdminRepository) Count() (int64, error) {
	var count int64
	if err := r.db.Model(&models.Admin{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
