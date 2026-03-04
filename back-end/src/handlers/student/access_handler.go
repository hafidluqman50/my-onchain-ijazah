package student

import (
	"net/http"
	"strconv"
	"time"

	studentsvc "my-onchain-ijazah/backend/src/services/student"

	"github.com/gin-gonic/gin"
)

type AccessHandler struct {
	Service studentsvc.AccessService
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type changePasswordRequest struct {
	NewPassword string `json:"new_password"`
}

type keyRequest struct {
	OTP string `json:"otp"`
}

func (h AccessHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}
	result, err := h.Service.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"access_token":         result.AccessToken,
		"must_change_password": result.MustChangePassword,
	})
}

func (h AccessHandler) FirstChangePassword(c *gin.Context) {
	studentID := c.GetUint("student_id")
	var req changePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid password"})
		return
	}
	if err := h.Service.FirstChangePassword(studentID, req.NewPassword); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (h AccessHandler) ListCertificates(c *gin.Context) {
	studentID := c.GetUint("student_id")
	certs, err := h.Service.ListCertificates(studentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}
	type certResponse struct {
		ID              uint       `json:"id"`
		DocumentHash    string     `json:"document_hash"`
		EncryptedCID    string     `json:"encrypted_cid"`
		TokenID         string     `json:"token_id"`
		ContractAddress string     `json:"contract_address"`
		IssuerDID       string     `json:"issuer_did"`
		Status          string     `json:"status"`
		IssuedAt        time.Time  `json:"issued_at"`
		RevokedAt       *time.Time `json:"revoked_at"`
	}
	resp := make([]certResponse, 0, len(certs))
	for _, cert := range certs {
		resp = append(resp, certResponse{
			ID:              cert.ID,
			DocumentHash:    cert.DocumentHash,
			EncryptedCID:    cert.EncryptedCID,
			TokenID:         cert.TokenID,
			ContractAddress: cert.ContractAddress,
			IssuerDID:       cert.IssuerDID,
			Status:          cert.Status,
			IssuedAt:        cert.IssuedAt,
			RevokedAt:       cert.RevokedAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{"certificates": resp})
}

func (h AccessHandler) DownloadEncrypted(c *gin.Context) {
	studentID := c.GetUint("student_id")
	certID, _ := strconv.Atoi(c.Param("id"))
	data, err := h.Service.DownloadEncrypted(studentID, uint(certID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.Header("Content-Disposition", "attachment; filename=certificate.enc")
	c.Data(http.StatusOK, "application/octet-stream", data)
}

func (h AccessHandler) RequestKey(c *gin.Context) {
	studentID := c.GetUint("student_id")
	certID, _ := strconv.Atoi(c.Param("id"))
	var req keyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}
	key, err := h.Service.RequestKey(studentID, uint(certID), req.OTP)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "invalid otp" {
			status = http.StatusUnauthorized
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"key_b64": key})
}
