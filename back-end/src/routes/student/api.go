package student

import (
	studenthandlers "my-onchain-ijazah/backend/src/handlers/student"
	"my-onchain-ijazah/backend/src/middleware"

	"github.com/gin-gonic/gin"
)

func Register(group *gin.RouterGroup, jwtSecret string, handler studenthandlers.AccessHandler) {
	group.POST("/login", handler.Login)
	group.POST("/password/first-change", middleware.StudentAuth(jwtSecret), handler.FirstChangePassword)
	group.GET("/certificates", middleware.StudentAuth(jwtSecret), handler.ListCertificates)
	group.GET("/certificates/:id/download", middleware.StudentAuth(jwtSecret), handler.DownloadEncrypted)
	group.POST("/certificates/:id/key", middleware.StudentAuth(jwtSecret), handler.RequestKey)
}
