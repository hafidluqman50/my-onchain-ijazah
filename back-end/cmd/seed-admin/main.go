package main

import (
	"fmt"
	"log"

	"my-onchain-ijazah/backend/src/config"
	"my-onchain-ijazah/backend/src/db"
	"my-onchain-ijazah/backend/src/repositories"
	adminsvc "my-onchain-ijazah/backend/src/services/admin"
)

func main() {
	cfg := config.Load()

	if cfg.AdminEmail == "" || cfg.AdminPassword == "" {
		log.Fatal("ADMIN_EMAIL and ADMIN_PASSWORD must be set")
	}

	database := db.Connect(cfg.DatabaseURL)

	authService := adminsvc.AuthService{
		Admins:    repositories.NewAdminRepository(database),
		JWTSecret: cfg.JWTSecret,
	}

	if err := authService.BootstrapDefaultAdmin(cfg.AdminEmail, cfg.AdminPassword); err != nil {
		log.Fatal(err)
	}

	fmt.Println("seed-admin: done (created if missing)")
}
