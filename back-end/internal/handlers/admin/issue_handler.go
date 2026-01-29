package admin

import (
	"io"
	"net/http"
	"strconv"
	"strings"

	adminsvc "my-onchain-ijazah/backend/internal/services/admin"

	"github.com/gin-gonic/gin"
)

type IssueHandler struct {
	Service adminsvc.IssueService
}

func (h IssueHandler) CreateCertificate(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}

	studentEmail := strings.TrimSpace(c.PostForm("student_email"))
	studentName := strings.TrimSpace(c.PostForm("student_name"))
	issuerDID := strings.TrimSpace(c.PostForm("issuer_did"))
	tokenID := strings.TrimSpace(c.PostForm("token_id"))
	contractAddress := strings.TrimSpace(c.PostForm("contract_address"))

	opened, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open file"})
		return
	}
	defer opened.Close()

	data, err := io.ReadAll(opened)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read file"})
		return
	}

	result, err := h.Service.CreateCertificate(adminsvc.CreateCertificateInput{
		StudentEmail:    studentEmail,
		StudentName:     studentName,
		IssuerDID:       issuerDID,
		TokenID:         tokenID,
		ContractAddress: contractAddress,
		FileName:        file.Filename,
		FileBytes:       data,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response := gin.H{
		"certificate_id":    result.Certificate.ID,
		"document_hash":     result.Certificate.DocumentHash,
		"encrypted_cid":     result.Certificate.EncryptedCID,
		"status":            result.Certificate.Status,
		"student_email":     result.Student.Email,
		"student_id":        result.Student.ID,
		"token_id":          result.Certificate.TokenID,
		"contract_address":  result.Certificate.ContractAddress,
		"verification_code": result.Certificate.VerificationCode,
	}
	if result.TempPassword != nil {
		response["temp_password"] = *result.TempPassword
	}
	c.JSON(http.StatusCreated, response)
}

func (h IssueHandler) GetCertificate(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	cert, err := h.Service.GetCertificate(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id":                cert.ID,
		"student":           cert.Student,
		"document_hash":     cert.DocumentHash,
		"encrypted_cid":     cert.EncryptedCID,
		"issuer_did":        cert.IssuerDID,
		"status":            cert.Status,
		"issued_at":         cert.IssuedAt,
		"revoked_at":        cert.RevokedAt,
		"token_id":          cert.TokenID,
		"contract_address":  cert.ContractAddress,
		"verification_code": cert.VerificationCode,
	})
}

func (h IssueHandler) RevokeCertificate(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	cert, err := h.Service.RevokeCertificate(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": cert.Status})
}
