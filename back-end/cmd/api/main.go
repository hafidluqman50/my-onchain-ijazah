package main

import (
	"log"
	"net/http"

	"my-onchain-ijazah/backend/internal/config"
	"my-onchain-ijazah/backend/internal/db"
	"my-onchain-ijazah/backend/internal/handlers"
	adminhandlers "my-onchain-ijazah/backend/internal/handlers/admin"
	studenthandlers "my-onchain-ijazah/backend/internal/handlers/student"
	verifyhandlers "my-onchain-ijazah/backend/internal/handlers/verify"
	"my-onchain-ijazah/backend/internal/middleware"
	"my-onchain-ijazah/backend/internal/models"
	"my-onchain-ijazah/backend/internal/repositories"
	"my-onchain-ijazah/backend/internal/services"
	adminsvc "my-onchain-ijazah/backend/internal/services/admin"
	studentsvc "my-onchain-ijazah/backend/internal/services/student"
	verifysvc "my-onchain-ijazah/backend/internal/services/verify"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	database := db.Connect(cfg.DatabaseURL)
	if err := database.AutoMigrate(&models.Student{}, &models.Certificate{}, &models.AccessLog{}); err != nil {
		log.Fatalf("auto migrate failed: %v", err)
	}

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type", "X-Admin-Key"},
		AllowCredentials: true,
	}))

	router.MaxMultipartMemory = cfg.MaxUploadMB << 20

	storage := services.Storage{Dir: cfg.StorageDir}

	studentRepo := repositories.NewStudentRepository(database)
	certRepo := repositories.NewCertificateRepository(database)

	adminService := adminsvc.IssueService{
		Students:     studentRepo,
		Certificates: certRepo,
		Storage:      storage,
		MasterKey:    []byte(cfg.MasterKey),
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

	adminHandler := adminhandlers.IssueHandler{Service: adminService}
	studentHandler := studenthandlers.AccessHandler{Service: studentService}
	verifyHandler := verifyhandlers.VerifyHandler{Service: verifyService}

	router.GET("/health", handlers.Health)

	admin := router.Group("/admin").Use(middleware.AdminAuth(cfg.AdminAPIKey))
	{
		admin.POST("/certificates", adminHandler.CreateCertificate)
		admin.GET("/certificates/:id", adminHandler.GetCertificate)
		admin.POST("/certificates/:id/revoke", adminHandler.RevokeCertificate)
	}

	student := router.Group("/student")
	{
		student.POST("/login", studentHandler.Login)
		student.POST("/password/first-change", middleware.StudentAuth(cfg.JWTSecret), studentHandler.FirstChangePassword)
		student.GET("/certificates", middleware.StudentAuth(cfg.JWTSecret), studentHandler.ListCertificates)
		student.GET("/certificates/:id/download", middleware.StudentAuth(cfg.JWTSecret), studentHandler.DownloadEncrypted)
		student.POST("/certificates/:id/key", middleware.StudentAuth(cfg.JWTSecret), studentHandler.RequestKey)
	}

	router.GET("/verify", verifyHandler.Verify)

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}
	log.Printf("API listening on :%s", cfg.Port)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
