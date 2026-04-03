package api

import (
	"net/http"
	"os/exec"
	"runtime"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
)

var (
	sandboxStatus = make(map[string]bool)
	sandboxMutex  sync.RWMutex
)

type SandboxRequest struct {
	Name string `json:"name" binding:"required"`
}

type SandboxResponse struct {
	Name    string `json:"name"`
	Status  string `json:"status"`
	Port    int    `json:"port"`
	Message string `json:"message,omitempty"`
}

func RegisterSandboxRoutes(r *gin.Engine) {
	sandbox := r.Group("/api/v1/sandbox")
	{
		sandbox.GET("/list", listSandboxes)
		sandbox.POST("/start", startSandbox)
		sandbox.POST("/stop", stopSandbox)
		sandbox.GET("/status/:name", getSandboxStatus)
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

func startSandbox(c *gin.Context) {
	var req SandboxRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	sandboxMutex.Lock()
	if sandboxStatus[req.Name] {
		sandboxMutex.Unlock()
		c.JSON(http.StatusOK, SandboxResponse{
			Name:    req.Name,
			Status:  "already_running",
			Message: "Песочница уже запущена",
		})
		return
	}
	sandboxMutex.Unlock()

	containerName := "educational-data-protection-simulator-sandbox-" + req.Name
	port := getSandboxPort(req.Name)

	if runtime.GOOS == "windows" {
		cmd := exec.Command("docker", "start", containerName)
		if err := cmd.Run(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start sandbox: " + err.Error()})
			return
		}
	} else {
		cmd := exec.Command("sudo", "docker", "start", containerName)
		if err := cmd.Run(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start sandbox: " + err.Error()})
			return
		}
	}

	sandboxMutex.Lock()
	sandboxStatus[req.Name] = true
	sandboxMutex.Unlock()

	c.JSON(http.StatusOK, SandboxResponse{
		Name:    req.Name,
		Status:  "started",
		Port:    port,
		Message: "Песочница успешно запущена",
	})
}

func stopSandbox(c *gin.Context) {
	var req SandboxRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	sandboxMutex.Lock()
	if !sandboxStatus[req.Name] {
		sandboxMutex.Unlock()
		c.JSON(http.StatusOK, SandboxResponse{
			Name:    req.Name,
			Status:  "not_running",
			Message: "Песочница не запущена",
		})
		return
	}
	sandboxMutex.Unlock()

	containerName := "educational-data-protection-simulator-sandbox-" + req.Name

	if runtime.GOOS == "windows" {
		cmd := exec.Command("docker", "stop", containerName)
		if err := cmd.Run(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to stop sandbox: " + err.Error()})
			return
		}
	} else {
		cmd := exec.Command("sudo", "docker", "stop", containerName)
		if err := cmd.Run(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to stop sandbox: " + err.Error()})
			return
		}
	}

	sandboxMutex.Lock()
	sandboxStatus[req.Name] = false
	sandboxMutex.Unlock()

	c.JSON(http.StatusOK, SandboxResponse{
		Name:    req.Name,
		Status:  "stopped",
		Message: "Песочница остановлена",
	})
}

func getSandboxStatus(c *gin.Context) {
	name := c.Param("name")

	containerName := "educational-data-protection-simulator-sandbox-" + name
	var running bool

	if runtime.GOOS == "windows" {
		cmd := exec.Command("docker", "inspect", "-f", "{{.State.Running}}", containerName)
		output, err := cmd.Output()
		if err == nil {
			running = strings.TrimSpace(string(output)) == "true"
		}
	} else {
		cmd := exec.Command("sudo", "docker", "inspect", "-f", "{{.State.Running}}", containerName)
		output, err := cmd.Output()
		if err == nil {
			running = strings.TrimSpace(string(output)) == "true"
		}
	}

	sandboxMutex.Lock()
	sandboxStatus[name] = running
	sandboxMutex.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"name":    name,
		"running": running,
		"port":    getSandboxPort(name),
	})
}

func getSandboxPort(name string) int {
	ports := map[string]int{
		"phishing":       9081,
		"email-client":   9082,
		"wifi-hotspot":   9083,
		"social-network": 9084,
		"atm-simulator":  9085,
	}
	if port, ok := ports[name]; ok {
		return port
	}
	return 0
}
