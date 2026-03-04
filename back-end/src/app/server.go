package app

import (
	"my-onchain-ijazah/backend/src/config"
	"my-onchain-ijazah/backend/src/db"
	adminhandlers "my-onchain-ijazah/backend/src/handlers/admin"
	studenthandlers "my-onchain-ijazah/backend/src/handlers/student"
	verifyhandlers "my-onchain-ijazah/backend/src/handlers/verify"
	"my-onchain-ijazah/backend/src/models"
	"my-onchain-ijazah/backend/src/repositories"
	"my-onchain-ijazah/backend/src/routes"
	"my-onchain-ijazah/backend/src/services"
	adminsvc "my-onchain-ijazah/backend/src/services/admin"
	studentsvc "my-onchain-ijazah/backend/src/services/student"
	verifysvc "my-onchain-ijazah/backend/src/services/verify"

	"github.com/gin-gonic/gin"
)

func NewServer(cfg config.Config) *gin.Engine {
	database := db.Connect(cfg.DatabaseURL)
	if err := database.AutoMigrate(&models.Student{}, &models.Cohort{}, &models.Certificate{}, &models.AccessLog{}); err != nil {
		panic(err)
	}

	storage := services.Storage{Dir: cfg.StorageDir}
	studentRepo := repositories.NewStudentRepository(database)
	cohortRepo := repositories.NewCohortRepository(database)
	certRepo := repositories.NewCertificateRepository(database)

	issueService := adminsvc.IssueService{
		Students:     studentRepo,
		Certificates: certRepo,
		Cohorts:      cohortRepo,
		Storage:      storage,
		MasterKey:    []byte(cfg.MasterKey),
	}
	cohortService := adminsvc.CohortService{Cohorts: cohortRepo}

	studentService := studentsvc.AccessService{
		Students:     studentRepo,
		Certificates: certRepo,
		Storage:      storage,
		MasterKey:    []byte(cfg.MasterKey),
		JWTSecret:    cfg.JWTSecret,
		MFAStatic:    cfg.MFAStaticCode,
	}
	verifyService := verifysvc.VerifyService{Certificates: certRepo}

	issueHandler := adminhandlers.IssueHandler{Service: issueService}
	cohortHandler := adminhandlers.CohortHandler{Service: cohortService}
	studentHandler := studenthandlers.AccessHandler{Service: studentService}
	verifyHandler := verifyhandlers.VerifyHandler{Service: verifyService}

	return routes.New(cfg, issueHandler, cohortHandler, studentHandler, verifyHandler)
}
