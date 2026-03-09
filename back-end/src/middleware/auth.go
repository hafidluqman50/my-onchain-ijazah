package middleware

import (
	"net/http"
	"strings"

	"my-onchain-ijazah/backend/src/utils"

	"github.com/gin-gonic/gin"
)

func StudentAuth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}
		token := strings.TrimPrefix(auth, "Bearer ")
		claims, err := utils.ParseToken(secret, token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		c.Set("student_id", claims.StudentID)
		c.Set("student_email", claims.Email)
		c.Next()
	}
}
