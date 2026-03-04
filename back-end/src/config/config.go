package config

import (
	"log"
	"os"
	"strconv"
)

type Config struct {
	Port              string
	DatabaseURL       string
	JWTSecret         string
	AdminAPIKey       string
	StorageDir        string
	MasterKey         string
	MFAStaticCode     string
	MaxUploadMB       int64
	AllowInsecureHTTP bool
}

func Load() Config {
	maxUpload := int64(20)
	if v := os.Getenv("MAX_UPLOAD_MB"); v != "" {
		if n, err := strconv.ParseInt(v, 10, 64); err == nil {
			maxUpload = n
		}
	}
	allowInsecure := os.Getenv("ALLOW_INSECURE_HTTP") == "true"

	cfg := Config{
		Port:              envOr("PORT", "8080"),
		DatabaseURL:       envOr("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/ijazah?sslmode=disable"),
		JWTSecret:         envOr("JWT_SECRET", "dev_jwt_secret_change_me"),
		AdminAPIKey:       envOr("ADMIN_API_KEY", "dev_admin_key_change_me"),
		StorageDir:        envOr("STORAGE_DIR", "./storage"),
		MasterKey:         envOr("MASTER_KEY", "dev_master_key_32_bytes_len_____"),
		MFAStaticCode:     envOr("MFA_STATIC_CODE", "000000"),
		MaxUploadMB:       maxUpload,
		AllowInsecureHTTP: allowInsecure,
	}

	if len(cfg.MasterKey) < 32 {
		log.Println("warning: MASTER_KEY is shorter than 32 bytes; use a 32+ byte key")
	}

	return cfg
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
