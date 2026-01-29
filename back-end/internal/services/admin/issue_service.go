package admin

import (
	"errors"
	"path/filepath"
	"strings"
	"time"

	"my-onchain-ijazah/backend/internal/models"
	"my-onchain-ijazah/backend/internal/repositories"
	"my-onchain-ijazah/backend/internal/services"
	"my-onchain-ijazah/backend/internal/utils"

	"gorm.io/gorm"
)

type IssueService struct {
	Students     repositories.StudentRepository
	Certificates repositories.CertificateRepository
	Storage      services.Storage
	MasterKey    []byte
}

type CreateCertificateInput struct {
	StudentEmail    string
	StudentName     string
	IssuerDID       string
	TokenID         string
	ContractAddress string
	FileName        string
	FileBytes       []byte
}

type CreateCertificateOutput struct {
	Certificate  *models.Certificate
	Student      *models.Student
	TempPassword *string
}

func (s IssueService) CreateCertificate(input CreateCertificateInput) (*CreateCertificateOutput, error) {
	if input.StudentEmail == "" || input.StudentName == "" {
		return nil, errors.New("student_email and student_name required")
	}
	if strings.ToLower(filepath.Ext(input.FileName)) != ".pdf" {
		return nil, errors.New("only pdf allowed")
	}
	if len(input.FileBytes) == 0 {
		return nil, errors.New("file is empty")
	}

	docHash := services.HashSHA256(input.FileBytes)
	fileKey, err := services.GenerateRandomKey(32)
	if err != nil {
		return nil, err
	}

	ciphertext, err := services.EncryptAESGCM(input.FileBytes, fileKey)
	if err != nil {
		return nil, err
	}

	wrappedKey, err := services.WrapKeyWithMaster(fileKey, s.MasterKey)
	if err != nil {
		return nil, err
	}

	student, tempPassword, err := s.ensureStudent(input.StudentEmail, input.StudentName)
	if err != nil {
		return nil, err
	}

	verificationCode, err := s.generateUniqueCode()
	if err != nil {
		return nil, err
	}

	cert := &models.Certificate{
		StudentID:        student.ID,
		DocumentHash:     docHash,
		EncryptedCID:     "ipfs://local/" + strings.TrimPrefix(docHash, "sha256:"),
		EncryptedKey:     wrappedKey,
		TokenID:          input.TokenID,
		ContractAddress:  input.ContractAddress,
		IssuerDID:        input.IssuerDID,
		VerificationCode: verificationCode,
		Status:           "active",
		IssuedAt:         time.Now(),
	}
	if err := s.Certificates.Create(cert); err != nil {
		return nil, err
	}

	if _, err := s.Storage.SaveEncrypted(cert.ID, ciphertext); err != nil {
		return nil, err
	}

	return &CreateCertificateOutput{
		Certificate:  cert,
		Student:      student,
		TempPassword: tempPassword,
	}, nil
}

func (s IssueService) GetCertificate(id uint) (*models.Certificate, error) {
	return s.Certificates.GetByIDWithStudent(id)
}

func (s IssueService) RevokeCertificate(id uint) (*models.Certificate, error) {
	cert, err := s.Certificates.GetByID(id)
	if err != nil {
		return nil, err
	}
	now := time.Now()
	cert.Status = "revoked"
	cert.RevokedAt = &now
	if err := s.Certificates.Save(cert); err != nil {
		return nil, err
	}
	return cert, nil
}

func (s IssueService) ensureStudent(email string, name string) (*models.Student, *string, error) {
	student, err := s.Students.GetByEmail(email)
	if err == nil {
		return student, nil, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil, err
	}

	tempPassword := utils.RandomReadablePassword(10)
	hash, err := utils.HashPassword(tempPassword)
	if err != nil {
		return nil, nil, err
	}

	student = &models.Student{
		Name:               name,
		Email:              email,
		PasswordHash:       hash,
		MustChangePassword: true,
	}
	if err := s.Students.Create(student); err != nil {
		return nil, nil, err
	}
	return student, &tempPassword, nil
}

func (s IssueService) generateUniqueCode() (string, error) {
	for i := 0; i < 5; i++ {
		code := utils.GenerateVerificationCode(8)
		_, err := s.Certificates.FindByVerificationCode(code)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return code, nil
		}
		if err == nil {
			continue
		}
		return "", err
	}
	return utils.GenerateVerificationCode(10), nil
}
