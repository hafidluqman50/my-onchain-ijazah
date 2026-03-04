package admin

import (
	adminhandlers "my-onchain-ijazah/backend/src/handlers/admin"
	"my-onchain-ijazah/backend/src/middleware"

	"github.com/gin-gonic/gin"
)

func Register(
	group *gin.RouterGroup,
	adminKey string,
	issueHandler adminhandlers.IssueHandler,
	cohortHandler adminhandlers.CohortHandler,
) {
	group.Use(middleware.AdminAuth(adminKey))

	group.GET("/cohorts", cohortHandler.List)
	group.POST("/cohorts", cohortHandler.Create)

	group.GET("/certificates", issueHandler.ListCertificates)
	group.POST("/certificates", issueHandler.CreateCertificate)
	group.POST("/certificates/batch", issueHandler.CreateCertificatesBatch)
	group.GET("/certificates/:id", issueHandler.GetCertificate)
	group.POST("/certificates/:id/revoke", issueHandler.RevokeCertificate)
}
