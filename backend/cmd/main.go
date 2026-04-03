package main

import (
	"log"
	"os"

	"github.com/cyber-simulator/backend/internal/api"
	"github.com/cyber-simulator/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	models.InitDB()

	api.RegisterRoutes(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
