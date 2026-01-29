package verify

import (
	"errors"

	"my-onchain-ijazah/backend/internal/models"
	"my-onchain-ijazah/backend/internal/repositories"
)

type VerifyService struct {
	Certificates repositories.CertificateRepository
}

type VerifyInput struct {
	Code     string
	TokenID  string
	Contract string
	Hash     string
}

func (s VerifyService) Verify(input VerifyInput) (*models.Certificate, error) {
	if input.Code != "" {
		return s.Certificates.FindByVerificationCode(input.Code)
	}
	if input.TokenID == "" && input.Contract == "" && input.Hash == "" {
		return nil, errors.New("provide code or token/hash")
	}
	return s.Certificates.FindByFilters(input.TokenID, input.Contract, input.Hash)
}
