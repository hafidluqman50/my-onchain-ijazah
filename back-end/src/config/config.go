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
	AdminEmail        string
	AdminPassword     string
	StorageProvider   string
	StorageDir        string
	PinataJWT         string
	PinataGateway     string
	ChainRPCURL       string
	ChainID           string
	ContractAddress   string
	WalletPrivateKey  string
	IssuerDID         string
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
		AdminEmail:        envOr("ADMIN_EMAIL", "admin@school.local"),
		AdminPassword:     envOr("ADMIN_PASSWORD", "change_me_now"),
		StorageProvider:   envOr("STORAGE_PROVIDER", "local"),
		StorageDir:        envOr("STORAGE_DIR", "./storage"),
		PinataJWT:         envOr("PINATA_JWT", ""),
		PinataGateway:     envOr("PINATA_GATEWAY", "https://gateway.pinata.cloud/ipfs"),
		ChainRPCURL:       envOr("CHAIN_RPC_URL", ""),
		ChainID:           envOr("CHAIN_ID", ""),
		ContractAddress:   envOr("CONTRACT_ADDRESS", ""),
		WalletPrivateKey:  envOr("WALLET_PRIVATE_KEY", ""),
		IssuerDID:         envOr("ISSUER_DID", "did:ethr:base-sepolia:0xD3ABe6Cb5EAe7B9f57C543151F825AD9149Af2D9"),
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
