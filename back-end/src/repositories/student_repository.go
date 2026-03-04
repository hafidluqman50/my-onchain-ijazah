package repositories

import (
	"errors"

	"my-onchain-ijazah/backend/src/models"

	"gorm.io/gorm"
)

type StudentRepository interface {
	GetByEmail(email string) (*models.Student, error)
	GetByID(id uint) (*models.Student, error)
	Create(student *models.Student) error
	Update(student *models.Student) error
}

type GormStudentRepository struct {
	db *gorm.DB
}

func NewStudentRepository(db *gorm.DB) *GormStudentRepository {
	return &GormStudentRepository{db: db}
}

func (r *GormStudentRepository) GetByEmail(email string) (*models.Student, error) {
	var student models.Student
	if err := r.db.Where("email = ?", email).First(&student).Error; err != nil {
		return nil, err
	}
	return &student, nil
}

func (r *GormStudentRepository) GetByID(id uint) (*models.Student, error) {
	var student models.Student
	if err := r.db.First(&student, id).Error; err != nil {
		return nil, err
	}
	return &student, nil
}

func (r *GormStudentRepository) Create(student *models.Student) error {
	return r.db.Create(student).Error
}

func (r *GormStudentRepository) Update(student *models.Student) error {
	if student == nil {
		return errors.New("student is nil")
	}
	return r.db.Save(student).Error
}
