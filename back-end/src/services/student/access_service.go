package student

import (
	"encoding/base64"
	"errors"
	"time"

	"my-onchain-ijazah/backend/src/models"
	"my-onchain-ijazah/backend/src/repositories"
	"my-onchain-ijazah/backend/src/services"
	"my-onchain-ijazah/backend/src/services/shared"
	"my-onchain-ijazah/backend/src/utils"

	"gorm.io/gorm"
)

type AccessService struct {
	Students     repositories.StudentRepository
	Certificates repositories.CertificateRepository
	Storage      *shared.StorageService
	MasterKey    []byte
	JWTSecret    string
	MFAStatic    string
}

type LoginResult struct {
	AccessToken        string
	MustChangePassword bool
}

func (s AccessService) Login(email string, password string) (*LoginResult, error) {
	student, err := s.Students.GetByEmail(email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}
	if !utils.CheckPassword(student.PasswordHash, password) {
		return nil, errors.New("invalid credentials")
	}
	token, err := utils.GenerateToken(s.JWTSecret, student.ID, student.Email, 24*time.Hour)
	if err != nil {
		return nil, err
	}
	return &LoginResult{
		AccessToken:        token,
		MustChangePassword: student.MustChangePassword,
	}, nil
}

func (s AccessService) FirstChangePassword(studentID uint, newPassword string) error {
	if len(newPassword) < 6 {
		return errors.New("invalid password")
	}
	student, err := s.Students.GetByID(studentID)
	if err != nil {
		return err
	}
	hash, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}
	student.PasswordHash = hash
	student.MustChangePassword = false
	return s.Students.Update(student)
}

func (s AccessService) ListCertificates(studentID uint) ([]models.Certificate, error) {
	return s.Certificates.ListByStudentID(studentID)
}

func (s AccessService) DownloadEncrypted(studentID uint, certID uint) ([]byte, error) {
	cert, err := s.Certificates.GetByIDAndStudentID(certID, studentID)
	if err != nil {
		return nil, err
	}
	return s.Storage.ReadEncrypted(cert.EncryptedCID, cert.ID)
}

func (s AccessService) RequestKey(studentID uint, certID uint, otp string) (string, error) {
	if otp != s.MFAStatic {
		return "", errors.New("invalid otp")
	}
	cert, err := s.Certificates.GetByIDAndStudentID(certID, studentID)
	if err != nil {
		return "", err
	}
	key, err := services.UnwrapKeyWithMaster(cert.EncryptedKey, s.MasterKey)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(key), nil
}

func (s AccessService) GetCertificateByID(studentID uint, certID uint) (*models.Certificate, error) {
	return s.Certificates.GetByIDAndStudentID(certID, studentID)
}

func (s AccessService) GetStudentByEmail(email string) (*models.Student, error) {
	student, err := s.Students.GetByEmail(email)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	return student, err
}
