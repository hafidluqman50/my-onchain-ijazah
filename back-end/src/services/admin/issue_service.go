package admin

import (
	"errors"
	"strings"
	"time"

	"my-onchain-ijazah/backend/src/models"
	"my-onchain-ijazah/backend/src/repositories"
	"my-onchain-ijazah/backend/src/services"
	"my-onchain-ijazah/backend/src/utils"

	"gorm.io/gorm"
)

type IssueService struct {
	Students     repositories.StudentRepository
	Certificates repositories.CertificateRepository
	Cohorts      repositories.CohortRepository
	Storage      services.Storage
	MasterKey    []byte
}

type CreateCertificateInput struct {
	StudentEmail    string
	StudentName     string
	CohortID        uint
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

type BatchStudentInput struct {
	Row          int
	StudentEmail string
	StudentName  string
}

type CreateCertificatesBatchInput struct {
	CohortID        uint
	IssuerDID       string
	TokenID         string
	ContractAddress string
	FileName        string
	FileBytes       []byte
	Students        []BatchStudentInput
}

type CreateCertificatesBatchItem struct {
	Row              int     `json:"row"`
	StudentEmail     string  `json:"student_email"`
	StudentName      string  `json:"student_name"`
	CertificateID    *uint   `json:"certificate_id,omitempty"`
	VerificationCode *string `json:"verification_code,omitempty"`
	TempPassword     *string `json:"temp_password,omitempty"`
	Error            *string `json:"error,omitempty"`
}

type CreateCertificatesBatchOutput struct {
	Total   int                           `json:"total"`
	Success int                           `json:"success"`
	Failed  int                           `json:"failed"`
	Items   []CreateCertificatesBatchItem `json:"items"`
}

func (s IssueService) CreateCertificate(input CreateCertificateInput) (*CreateCertificateOutput, error) {
	if _, err := s.Cohorts.GetByID(input.CohortID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("cohort not found")
		}
		return nil, err
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
		CohortID:         input.CohortID,
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

func (s IssueService) CreateCertificatesBatch(input CreateCertificatesBatchInput) (*CreateCertificatesBatchOutput, error) {
	results := make([]CreateCertificatesBatchItem, 0, len(input.Students))
	success := 0
	failed := 0

	for _, student := range input.Students {
		item := CreateCertificatesBatchItem{
			Row:          student.Row,
			StudentEmail: student.StudentEmail,
			StudentName:  student.StudentName,
		}

		if strings.TrimSpace(student.StudentEmail) == "" || strings.TrimSpace(student.StudentName) == "" {
			errText := "student_email and student_name required"
			item.Error = &errText
			failed++
			results = append(results, item)
			continue
		}

		created, err := s.CreateCertificate(CreateCertificateInput{
			StudentEmail:    student.StudentEmail,
			StudentName:     student.StudentName,
			CohortID:        input.CohortID,
			IssuerDID:       input.IssuerDID,
			TokenID:         input.TokenID,
			ContractAddress: input.ContractAddress,
			FileName:        input.FileName,
			FileBytes:       input.FileBytes,
		})
		if err != nil {
			errText := err.Error()
			item.Error = &errText
			failed++
			results = append(results, item)
			continue
		}

		certID := created.Certificate.ID
		verif := created.Certificate.VerificationCode
		item.CertificateID = &certID
		item.VerificationCode = &verif
		item.TempPassword = created.TempPassword

		success++
		results = append(results, item)
	}

	return &CreateCertificatesBatchOutput{
		Total:   len(input.Students),
		Success: success,
		Failed:  failed,
		Items:   results,
	}, nil
}

func (s IssueService) ListCertificates() ([]models.Certificate, error) {
	return s.Certificates.ListWithStudent()
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
