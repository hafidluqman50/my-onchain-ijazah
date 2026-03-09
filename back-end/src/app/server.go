package app

import (
	"my-onchain-ijazah/backend/src/config"
	"my-onchain-ijazah/backend/src/db"
	adminhandlers "my-onchain-ijazah/backend/src/handlers/admin"
	studenthandlers "my-onchain-ijazah/backend/src/handlers/student"
	verifyhandlers "my-onchain-ijazah/backend/src/handlers/verify"
	"my-onchain-ijazah/backend/src/repositories"
	"my-onchain-ijazah/backend/src/routes"
	adminsvc "my-onchain-ijazah/backend/src/services/admin"
	"my-onchain-ijazah/backend/src/services/shared"
	studentsvc "my-onchain-ijazah/backend/src/services/student"
	verifysvc "my-onchain-ijazah/backend/src/services/verify"

	"github.com/gin-gonic/gin"
)

func NewServer(cfg config.Config) *gin.Engine {
	database := db.Connect(cfg.DatabaseURL)

	storage, err := shared.NewStorageService(
		cfg.StorageProvider,
		cfg.StorageDir,
		cfg.PinataJWT,
		cfg.PinataGateway,
	)
	if err != nil {
		panic(err)
	}
	onchain, err := shared.NewOnchainService(
		cfg.ChainRPCURL,
		cfg.WalletPrivateKey,
		cfg.ContractAddress,
		cfg.ChainID,
	)
	if err != nil {
		panic(err)
	}
	adminRepo := repositories.NewAdminRepository(database)
	studentRepo := repositories.NewStudentRepository(database)
	cohortRepo := repositories.NewCohortRepository(database)
	certRepo := repositories.NewCertificateRepository(database)

	issueService := adminsvc.IssueService{
		Students:         studentRepo,
		Certificates:     certRepo,
		Cohorts:          cohortRepo,
		Storage:          storage,
		Onchain:          onchain,
		DefaultIssuerDID: cfg.IssuerDID,
		MasterKey:        []byte(cfg.MasterKey),
	}
	cohortService := adminsvc.CohortService{Cohorts: cohortRepo}
	authService := adminsvc.AuthService{
		Admins:    adminRepo,
		JWTSecret: cfg.JWTSecret,
	}

	studentService := studentsvc.AccessService{
		Students:     studentRepo,
		Certificates: certRepo,
		Storage:      storage,
		MasterKey:    []byte(cfg.MasterKey),
		JWTSecret:    cfg.JWTSecret,
		MFAStatic:    cfg.MFAStaticCode,
	}
	verifyService := verifysvc.VerifyService{Certificates: certRepo}

	authHandler := adminhandlers.AuthHandler{Service: authService}
	issueHandler := adminhandlers.IssueHandler{Service: issueService}
	cohortHandler := adminhandlers.CohortHandler{Service: cohortService}
	studentHandler := studenthandlers.AccessHandler{Service: studentService}
	verifyHandler := verifyhandlers.VerifyHandler{Service: verifyService}

	return routes.New(cfg, authHandler, issueHandler, cohortHandler, studentHandler, verifyHandler)
}
