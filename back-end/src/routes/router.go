package routes

import (
	"my-onchain-ijazah/backend/src/config"
	adminhandlers "my-onchain-ijazah/backend/src/handlers/admin"
	studenthandlers "my-onchain-ijazah/backend/src/handlers/student"
	verifyhandlers "my-onchain-ijazah/backend/src/handlers/verify"
	adminroutes "my-onchain-ijazah/backend/src/routes/admin"
	studentroutes "my-onchain-ijazah/backend/src/routes/student"
	systemroutes "my-onchain-ijazah/backend/src/routes/system"
	verifyroutes "my-onchain-ijazah/backend/src/routes/verify"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func New(
	cfg config.Config,
	authHandler adminhandlers.AuthHandler,
	issueHandler adminhandlers.IssueHandler,
	cohortHandler adminhandlers.CohortHandler,
	studentHandler studenthandlers.AccessHandler,
	verifyHandler verifyhandlers.VerifyHandler,
) *gin.Engine {
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))
	router.MaxMultipartMemory = cfg.MaxUploadMB << 20

	api := router.Group("/api/v1")
	systemroutes.Register(api)
	adminroutes.Register(api.Group("/admin"), cfg.JWTSecret, authHandler, issueHandler, cohortHandler)
	studentroutes.Register(api.Group("/student"), cfg.JWTSecret, studentHandler)
	verifyroutes.Register(api, verifyHandler)

	return router
}
