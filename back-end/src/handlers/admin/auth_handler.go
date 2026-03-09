package admin

import (
	"net/http"
	"strings"

	adminsvc "my-onchain-ijazah/backend/src/services/admin"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	Service adminsvc.AuthService
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	result, err := h.Service.Login(req.Email, req.Password)
	if err != nil {
		status := http.StatusUnauthorized
		if strings.Contains(err.Error(), "temporarily locked") {
			status = http.StatusTooManyRequests
		}
		if strings.Contains(err.Error(), "inactive") {
			status = http.StatusForbidden
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token": result.AccessToken,
		"expires_in":   result.ExpiresIn,
	})
}
