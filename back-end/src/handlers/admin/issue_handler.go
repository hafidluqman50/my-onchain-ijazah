package admin

import (
	"bytes"
	"encoding/csv"
	"errors"
	"io"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	adminsvc "my-onchain-ijazah/backend/src/services/admin"

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
	cohortIDRaw := strings.TrimSpace(c.PostForm("cohort_id"))
	issuerDID := strings.TrimSpace(c.PostForm("issuer_did"))
	tokenID := strings.TrimSpace(c.PostForm("token_id"))
	contractAddress := strings.TrimSpace(c.PostForm("contract_address"))

	cohortID, err := strconv.Atoi(cohortIDRaw)
	if err != nil || cohortID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cohort_id required"})
		return
	}

	if studentEmail == "" || studentName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "student_email and student_name required"})
		return
	}
	if strings.ToLower(filepath.Ext(file.Filename)) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "only pdf allowed"})
		return
	}

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
	if len(data) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is empty"})
		return
	}

	result, err := h.Service.CreateCertificate(adminsvc.CreateCertificateInput{
		StudentEmail:    studentEmail,
		StudentName:     studentName,
		CohortID:        uint(cohortID),
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
		"cohort_id":         result.Certificate.CohortID,
	}
	if result.TempPassword != nil {
		response["temp_password"] = *result.TempPassword
	}
	c.JSON(http.StatusCreated, response)
}

func (h IssueHandler) CreateCertificatesBatch(c *gin.Context) {
	cohortIDRaw := strings.TrimSpace(c.PostForm("cohort_id"))
	issuerDID := strings.TrimSpace(c.PostForm("issuer_did"))
	tokenID := strings.TrimSpace(c.PostForm("token_id"))
	contractAddress := strings.TrimSpace(c.PostForm("contract_address"))

	cohortID, err := strconv.Atoi(cohortIDRaw)
	if err != nil || cohortID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cohort_id required"})
		return
	}

	studentsFile, err := c.FormFile("students_csv")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "students_csv file is required"})
		return
	}

	studentsOpened, err := studentsFile.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open students_csv"})
		return
	}
	defer studentsOpened.Close()

	studentsData, err := io.ReadAll(studentsOpened)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read students_csv"})
		return
	}

	students, err := parseStudentsCSV(studentsData)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}
	if strings.ToLower(filepath.Ext(file.Filename)) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "only pdf allowed"})
		return
	}

	opened, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open file"})
		return
	}
	defer opened.Close()

	pdfData, err := io.ReadAll(opened)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read file"})
		return
	}
	if len(pdfData) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is empty"})
		return
	}

	result, err := h.Service.CreateCertificatesBatch(adminsvc.CreateCertificatesBatchInput{
		CohortID:        uint(cohortID),
		IssuerDID:       issuerDID,
		TokenID:         tokenID,
		ContractAddress: contractAddress,
		FileName:        file.Filename,
		FileBytes:       pdfData,
		Students:        students,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

func (h IssueHandler) ListCertificates(c *gin.Context) {
	certs, err := h.Service.ListCertificates()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load certificates"})
		return
	}

	type studentResponse struct {
		ID    uint   `json:"id"`
		Name  string `json:"name"`
		Email string `json:"email"`
	}
	type certResponse struct {
		ID               uint            `json:"id"`
		Student          studentResponse `json:"student"`
		CohortID         uint            `json:"cohort_id"`
		DocumentHash     string          `json:"document_hash"`
		EncryptedCID     string          `json:"encrypted_cid"`
		IssuerDID        string          `json:"issuer_did"`
		Status           string          `json:"status"`
		IssuedAt         time.Time       `json:"issued_at"`
		RevokedAt        *time.Time      `json:"revoked_at"`
		TokenID          string          `json:"token_id"`
		ContractAddress  string          `json:"contract_address"`
		VerificationCode string          `json:"verification_code"`
	}

	items := make([]certResponse, 0, len(certs))
	for _, cert := range certs {
		items = append(items, certResponse{
			ID: cert.ID,
			Student: studentResponse{
				ID:    cert.Student.ID,
				Name:  cert.Student.Name,
				Email: cert.Student.Email,
			},
			CohortID:         cert.CohortID,
			DocumentHash:     cert.DocumentHash,
			EncryptedCID:     cert.EncryptedCID,
			IssuerDID:        cert.IssuerDID,
			Status:           cert.Status,
			IssuedAt:         cert.IssuedAt,
			RevokedAt:        cert.RevokedAt,
			TokenID:          cert.TokenID,
			ContractAddress:  cert.ContractAddress,
			VerificationCode: cert.VerificationCode,
		})
	}

	c.JSON(http.StatusOK, gin.H{"certificates": items})
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
		"cohort_id":         cert.CohortID,
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

func parseStudentsCSV(data []byte) ([]adminsvc.BatchStudentInput, error) {
	reader := csv.NewReader(bytes.NewReader(data))
	reader.TrimLeadingSpace = true

	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}
	if len(records) < 2 {
		return nil, errors.New("students_csv must contain header and at least one row")
	}

	headers := records[0]
	nameIdx, emailIdx := -1, -1
	for idx, h := range headers {
		n := normalizeCSVHeader(h)
		switch n {
		case "name", "nama", "studentname":
			nameIdx = idx
		case "email", "studentemail":
			emailIdx = idx
		}
	}
	if nameIdx < 0 || emailIdx < 0 {
		return nil, errors.New("students_csv header must include name and email")
	}

	students := make([]adminsvc.BatchStudentInput, 0, len(records)-1)
	for i, row := range records[1:] {
		rowNum := i + 2
		name := strings.TrimSpace(readCSVCell(row, nameIdx))
		email := strings.TrimSpace(readCSVCell(row, emailIdx))
		if name == "" && email == "" {
			continue
		}
		students = append(students, adminsvc.BatchStudentInput{
			Row:          rowNum,
			StudentEmail: email,
			StudentName:  name,
		})
	}

	if len(students) == 0 {
		return nil, errors.New("students_csv has no valid rows")
	}
	return students, nil
}

func readCSVCell(row []string, idx int) string {
	if idx < 0 || idx >= len(row) {
		return ""
	}
	return row[idx]
}

func normalizeCSVHeader(v string) string {
	v = strings.TrimSpace(strings.TrimPrefix(v, "\ufeff"))
	v = strings.ToLower(v)
	v = strings.ReplaceAll(v, "_", "")
	v = strings.ReplaceAll(v, "-", "")
	v = strings.ReplaceAll(v, " ", "")
	return v
}
