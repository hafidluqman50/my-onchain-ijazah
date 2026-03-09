package main

import (
	"log"
	"net/http"

	"my-onchain-ijazah/backend/src/app"
	"my-onchain-ijazah/backend/src/config"
)

func main() {
	cfg := config.Load()
	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: app.NewServer(cfg),
	}

	log.Printf("API listening on :%s", cfg.Port)
	if err := server.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
