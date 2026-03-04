package repositories

import (
	"my-onchain-ijazah/backend/src/models"

	"gorm.io/gorm"
)

type CohortRepository interface {
	List() ([]models.Cohort, error)
	GetByID(id uint) (*models.Cohort, error)
	FindByLabelKey(labelKey string) (*models.Cohort, error)
	Create(cohort *models.Cohort) error
}

type GormCohortRepository struct {
	db *gorm.DB
}

func NewCohortRepository(db *gorm.DB) *GormCohortRepository {
	return &GormCohortRepository{db: db}
}

func (r *GormCohortRepository) List() ([]models.Cohort, error) {
	var cohorts []models.Cohort
	if err := r.db.Order("label ASC").Find(&cohorts).Error; err != nil {
		return nil, err
	}
	return cohorts, nil
}

func (r *GormCohortRepository) GetByID(id uint) (*models.Cohort, error) {
	var cohort models.Cohort
	if err := r.db.First(&cohort, id).Error; err != nil {
		return nil, err
	}
	return &cohort, nil
}

func (r *GormCohortRepository) FindByLabelKey(labelKey string) (*models.Cohort, error) {
	var cohort models.Cohort
	if err := r.db.Where("label_key = ?", labelKey).First(&cohort).Error; err != nil {
		return nil, err
	}
	return &cohort, nil
}

func (r *GormCohortRepository) Create(cohort *models.Cohort) error {
	return r.db.Create(cohort).Error
}
