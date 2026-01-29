package repositories

import (
	"errors"

	"my-onchain-ijazah/backend/internal/models"

	"gorm.io/gorm"
)

type CertificateRepository interface {
	Create(cert *models.Certificate) error
	GetByID(id uint) (*models.Certificate, error)
	GetByIDWithStudent(id uint) (*models.Certificate, error)
	GetByIDAndStudentID(id uint, studentID uint) (*models.Certificate, error)
	ListByStudentID(studentID uint) ([]models.Certificate, error)
	FindByVerificationCode(code string) (*models.Certificate, error)
	FindByFilters(tokenID string, contract string, hash string) (*models.Certificate, error)
	Save(cert *models.Certificate) error
}

type GormCertificateRepository struct {
	db *gorm.DB
}

func NewCertificateRepository(db *gorm.DB) *GormCertificateRepository {
	return &GormCertificateRepository{db: db}
}

func (r *GormCertificateRepository) Create(cert *models.Certificate) error {
	return r.db.Create(cert).Error
}

func (r *GormCertificateRepository) GetByID(id uint) (*models.Certificate, error) {
	var cert models.Certificate
	if err := r.db.First(&cert, id).Error; err != nil {
		return nil, err
	}
	return &cert, nil
}

func (r *GormCertificateRepository) GetByIDWithStudent(id uint) (*models.Certificate, error) {
	var cert models.Certificate
	if err := r.db.Preload("Student").First(&cert, id).Error; err != nil {
		return nil, err
	}
	return &cert, nil
}

func (r *GormCertificateRepository) GetByIDAndStudentID(id uint, studentID uint) (*models.Certificate, error) {
	var cert models.Certificate
	if err := r.db.Where("id = ? AND student_id = ?", id, studentID).First(&cert).Error; err != nil {
		return nil, err
	}
	return &cert, nil
}

func (r *GormCertificateRepository) ListByStudentID(studentID uint) ([]models.Certificate, error) {
	var certs []models.Certificate
	if err := r.db.Where("student_id = ?", studentID).Find(&certs).Error; err != nil {
		return nil, err
	}
	return certs, nil
}

func (r *GormCertificateRepository) FindByVerificationCode(code string) (*models.Certificate, error) {
	var cert models.Certificate
	if err := r.db.Where("verification_code = ?", code).First(&cert).Error; err != nil {
		return nil, err
	}
	return &cert, nil
}

func (r *GormCertificateRepository) FindByFilters(tokenID string, contract string, hash string) (*models.Certificate, error) {
	query := r.db.Model(&models.Certificate{})
	if tokenID != "" {
		query = query.Where("token_id = ?", tokenID)
	}
	if contract != "" {
		query = query.Where("contract_address = ?", contract)
	}
	if hash != "" {
		query = query.Where("document_hash = ?", hash)
	}
	var cert models.Certificate
	if err := query.First(&cert).Error; err != nil {
		return nil, err
	}
	return &cert, nil
}

func (r *GormCertificateRepository) Save(cert *models.Certificate) error {
	if cert == nil {
		return errors.New("certificate is nil")
	}
	return r.db.Save(cert).Error
}
