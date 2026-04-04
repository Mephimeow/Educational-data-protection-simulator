// @title CyberSimulator API
// @version 1.0
// @description Educational cybersecurity simulator API
// @termsOfService http://swagger.io/terms/

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8000
// @BasePath /
// @schemes http
package main

import (
	"log"
	"os"
	"time"

	"github.com/cyber-simulator/backend/internal/api"
	"github.com/cyber-simulator/backend/internal/models"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	swagfiles "github.com/swaggo/files"
	swaggo "github.com/swaggo/gin-swagger"
)

func main() {
	jwtSecret := getEnv("JWT_SECRET", "defaultSecretKeyForDevelopment123456789")
	allowedOrigins := getEnv("ALLOWED_ORIGINS", "http://localhost:3001,http://backend:3000")

	r := gin.Default()

	origins := []string{}
	for _, o := range parseOrigins(allowedOrigins) {
		origins = append(origins, o)
	}
	if len(origins) == 0 {
		origins = []string{"http://localhost:3001", "http://frontend:3000", "http://backend:3000"}
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	models.InitDB()

	authHandler := api.NewAuthHandler(jwtSecret)
	userHandler := api.NewUserHandler()
	statsHandler := api.NewStatsHandler()
	adminHandler := api.NewAdminHandler()

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"name":        "CyberSimulator API",
			"version":     "1.0.0",
			"description": "Educational cybersecurity simulator API",
		})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.GET("/swagger/*any", swaggo.WrapHandler(swagfiles.NewHandler()))

	apiV1 := r.Group("/api/v1")
	{
		apiV1.GET("/scenarios", api.GetScenarios)
		apiV1.GET("/scenarios/:id", api.GetScenarioById)
		apiV1.POST("/scenarios", api.AuthMiddleware(jwtSecret), api.AdminMiddleware(), api.CreateScenario)
		apiV1.PUT("/scenarios/:id", api.AuthMiddleware(jwtSecret), api.AdminMiddleware(), api.UpdateScenario)
		apiV1.DELETE("/scenarios/:id", api.AuthMiddleware(jwtSecret), api.AdminMiddleware(), api.DeleteScenario)

		apiV1.GET("/scenarios/:id/levels", api.GetScenarioLevels)
		apiV1.GET("/levels/:id", api.GetLevelById)
		apiV1.POST("/levels", api.AuthMiddleware(jwtSecret), api.AdminMiddleware(), api.CreateLevel)
		apiV1.PUT("/levels/:id", api.AuthMiddleware(jwtSecret), api.AdminMiddleware(), api.UpdateLevel)
		apiV1.DELETE("/levels/:id", api.AuthMiddleware(jwtSecret), api.AdminMiddleware(), api.DeleteLevel)

		apiV1.GET("/attacks", api.GetAttackTypes)
		apiV1.GET("/tips", api.GetSecurityTips)

		auth := apiV1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.Refresh)
			auth.POST("/logout", authHandler.Logout)
		}

		users := apiV1.Group("/users")
		{
			users.GET("/me", api.AuthMiddleware(jwtSecret), authHandler.GetMe)
			users.GET("/profile", api.AuthMiddleware(jwtSecret), userHandler.GetProfile)
			users.PUT("/profile", api.AuthMiddleware(jwtSecret), userHandler.UpdateProfile)
		}

		stats := apiV1.Group("/stats")
		{
			stats.GET("/me", api.AuthMiddleware(jwtSecret), statsHandler.GetMyStats)
			stats.POST("/complete", api.AuthMiddleware(jwtSecret), statsHandler.CompleteLevel)
		}

		admin := apiV1.Group("/admin")
		admin.Use(api.AuthMiddleware(jwtSecret))
		admin.Use(api.AdminMiddleware())
		{
			admin.GET("/users", adminHandler.GetAllUsers)
			admin.DELETE("/users/:id", adminHandler.DeleteUser)
			admin.POST("/users/:id/roles", adminHandler.UpdateUserRoles)
			admin.GET("/all", statsHandler.GetAllStats)
		}
	}

	api.RegisterSandboxRoutes(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("CyberSimulator API starting on port %s", port)
	log.Printf("Swagger available at http://localhost:%s/swagger/index.html", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func parseOrigins(origins string) []string {
	if origins == "" {
		return []string{}
	}
	var result []string
	for _, o := range splitAndTrim(origins, ",") {
		if o != "" {
			result = append(result, o)
		}
	}
	return result
}

func splitAndTrim(s, sep string) []string {
	var result []string
	start := 0
	for i := 0; i <= len(s)-len(sep); i++ {
		if s[i:i+len(sep)] == sep {
			if start < i {
				result = append(result, s[start:i])
			}
			start = i + len(sep)
			i += len(sep) - 1
		}
	}
	if start < len(s) {
		result = append(result, s[start:])
	}
	return result
}
