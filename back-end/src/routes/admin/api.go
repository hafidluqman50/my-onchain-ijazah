package admin

import (
	adminhandlers "my-onchain-ijazah/backend/src/handlers/admin"
	"my-onchain-ijazah/backend/src/middleware"

	"github.com/gin-gonic/gin"
)

func Register(
	group *gin.RouterGroup,
	jwtSecret string,
	authHandler adminhandlers.AuthHandler,
	issueHandler adminhandlers.IssueHandler,
	cohortHandler adminhandlers.CohortHandler,
) {
	group.POST("/login", authHandler.Login)

	protected := group.Group("")
	protected.Use(middleware.AdminAuth(jwtSecret))

	protected.GET("/cohorts", cohortHandler.List)
	protected.POST("/cohorts", cohortHandler.Create)

	protected.GET("/certificates", issueHandler.ListCertificates)
	protected.POST("/certificates", issueHandler.CreateCertificate)
	protected.POST("/certificates/batch", issueHandler.CreateCertificatesBatch)
	protected.GET("/certificates/:id", issueHandler.GetCertificate)
	protected.POST("/certificates/:id/revoke", issueHandler.RevokeCertificate)
}
