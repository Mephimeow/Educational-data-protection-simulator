package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterSandboxRoutes(r *gin.Engine) {
	sandbox := r.Group("/api/v1/sandbox")
	{
		sandbox.GET("/list", listSandboxes)
	}
}

func listSandboxes(c *gin.Context) {
	sandboxes := []gin.H{
		{"name": "phishing", "port": 9081, "description": "Симуляция фишинга"},
		{"name": "email-client", "port": 9082, "description": "Email клиент"},
		{"name": "wifi-hotspot", "port": 9083, "description": "Wi-Fi атаки"},
		{"name": "social-network", "port": 9084, "description": "Социальные сети"},
		{"name": "atm-simulator", "port": 9085, "description": "Банкомат"},
	}
	c.JSON(http.StatusOK, gin.H{"sandboxes": sandboxes})
}
