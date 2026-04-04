package api

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(getEnv("JWT_SECRET", "defaultSecretKeyForDevelopment123456789"))

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

type Claims struct {
	UserID int      `json:"user_id"`
	Email  string   `json:"email"`
	Roles  []string `json:"roles"`
	jwt.RegisteredClaims
}

func isAdmin(c *gin.Context) bool {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return false
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenString == authHeader {
		return false
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return false
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return false
	}

	for _, role := range claims.Roles {
		if role == "ADMIN" {
			return true
		}
	}

	return false
}

var (
	mu             sync.RWMutex
	sandboxes      = map[string]bool{}
	containerPorts = map[string]int{
		"phishing":       9081,
		"email-client":   9082,
		"wifi-hotspot":   9083,
		"social-network": 9084,
		"atm-simulator":  9085,
		"password-crack": 9086,
		"malware-scan":   9087,
		"data-leak":      9088,
		"ransomware":     9089,
		"iot-attack":     9090,
	}
	imageNames = map[string]string{
		"phishing":       "sandbox-phishing",
		"email-client":   "sandbox-email",
		"wifi-hotspot":   "sandbox-wifi",
		"social-network": "sandbox-social",
		"atm-simulator":  "sandbox-atm",
		"password-crack": "sandbox-password-crack",
		"malware-scan":   "sandbox-malware-scan",
		"data-leak":      "sandbox-data-leak",
		"ransomware":     "sandbox-ransomware",
		"iot-attack":     "sandbox-iot-attack",
	}
)

func RegisterSandboxRoutes(r *gin.Engine) {
	sandbox := r.Group("/api/v1/sandbox")
	{
		sandbox.GET("/list", listSandboxes)
		sandbox.GET("/status", getSandboxStatus)
		sandbox.POST("/start/:name", startSandbox)
		sandbox.POST("/stop/:name", stopSandbox)
		sandbox.POST("/terminate/:name", terminateSandbox)
	}
}

func listSandboxes(c *gin.Context) {
	sandboxList := []gin.H{}
	for name, port := range containerPorts {
		mu.RLock()
		running := sandboxes[name]
		mu.RUnlock()

		description := getSandboxDescription(name)
		sandboxList = append(sandboxList, gin.H{
			"name":        name,
			"port":        port,
			"description": description,
			"running":     running,
		})
	}
	c.JSON(http.StatusOK, gin.H{"sandboxes": sandboxList})
}

func getSandboxStatus(c *gin.Context) {
	name := c.Param("name")

	mu.RLock()
	running := sandboxes[name]
	port := containerPorts[name]
	mu.RUnlock()

	if port == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sandbox not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"name":    name,
		"port":    port,
		"running": running,
	})
}

func startSandbox(c *gin.Context) {
	name := c.Param("name")

	mu.RLock()
	port, exists := containerPorts[name]
	mu.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sandbox not found"})
		return
	}

	mu.RLock()
	alreadyRunning := sandboxes[name]
	mu.RUnlock()

	if alreadyRunning {
		c.JSON(http.StatusOK, gin.H{
			"message": "Sandbox already running",
			"name":    name,
			"port":    port,
		})
		return
	}

	ctx := context.Background()
	imageName := imageNames[name]
	cmd := exec.CommandContext(ctx, "docker", "run", "-d",
		"--name", fmt.Sprintf("sandbox-%s", name),
		"--network", "educational-data-protection-simulator_app-network",
		"-p", fmt.Sprintf("%d:80", port),
		"--restart", "unless-stopped",
		fmt.Sprintf("educational-data-protection-simulator-%s:latest", imageName),
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Docker run error: %s, output: %s\n", err, string(output))
		if strings.Contains(string(output), "port is already allocated") || strings.Contains(string(output), "Bind for") {
			mu.Lock()
			sandboxes[name] = true
			mu.Unlock()
			c.JSON(http.StatusOK, gin.H{
				"message": "Sandbox already running (port in use)",
				"name":    name,
				"port":    port,
			})
			return
		}
		if string(output) == "" {
			containerExists, _ := checkContainerExists(name)
			if containerExists {
				cmd := exec.Command("docker", "start", fmt.Sprintf("sandbox-%s", name))
				if err := cmd.Run(); err == nil {
					mu.Lock()
					sandboxes[name] = true
					mu.Unlock()
					c.JSON(http.StatusOK, gin.H{
						"message": "Sandbox started",
						"name":    name,
						"port":    port,
					})
					return
				}
			}
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to start sandbox: %s", string(output))})
		return
	}

	mu.Lock()
	sandboxes[name] = true
	mu.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"message": "Sandbox started successfully",
		"name":    name,
		"port":    port,
	})
}

func stopSandbox(c *gin.Context) {
	name := c.Param("name")

	mu.RLock()
	_, exists := containerPorts[name]
	mu.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sandbox not found"})
		return
	}

	imageName := imageNames[name]
	cmd := exec.Command("docker", "stop", fmt.Sprintf("educational-data-protection-simulator-sandbox-%s", imageName))

	if err := cmd.Run(); err != nil {
		mu.Lock()
		sandboxes[name] = false
		mu.Unlock()
		c.JSON(http.StatusOK, gin.H{"message": "Sandbox stopped (or already stopped)", "name": name})
		return
	}

	mu.Lock()
	sandboxes[name] = false
	mu.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"message": "Sandbox stopped",
		"name":    name,
	})
}

func terminateSandbox(c *gin.Context) {
	if !isAdmin(c) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can terminate sandboxes"})
		return
	}

	name := c.Param("name")

	mu.RLock()
	_, exists := containerPorts[name]
	mu.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sandbox not found"})
		return
	}

	imageName := imageNames[name]
	cmd := exec.Command("docker", "rm", "-f", fmt.Sprintf("educational-data-protection-simulator-sandbox-%s", imageName))

	if err := cmd.Run(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to terminate sandbox"})
		return
	}

	mu.Lock()
	sandboxes[name] = false
	mu.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"message": "Sandbox terminated",
		"name":    name,
	})
}

func checkContainerExists(name string) (bool, error) {
	cmd := exec.Command("docker", "ps", "-a", "--filter", fmt.Sprintf("name=sandbox-%s", name), "--format", "{{.Names}}")
	output, err := cmd.Output()
	if err != nil {
		return false, err
	}
	return len(output) > 0, nil
}

func getSandboxDescription(name string) string {
	descriptions := map[string]string{
		"phishing":       "Симуляция фишинговых атак - банковский фишинг, поддельные сайты",
		"email-client":   "Email клиент - распознавание фишинговых писем",
		"wifi-hotspot":   "Wi-Fi атаки - Evil Twin, перехват трафика",
		"social-network": "Социальные сети - социальная инженерия",
		"atm-simulator":  "Банкомат - скимминг и безопасность банкоматов",
		"password-crack": "Взлом паролей - брутфорс и словарные атаки",
		"malware-scan":   "Вредоносное ПО - анализ вирусов и троянов",
		"data-leak":      "Утечка данных - защита конфиденциальной информации",
		"ransomware":     "Вымогательское ПО - шифрование данных",
		"iot-attack":     "IoT атаки - уязвимости умных устройств",
	}
	if desc, ok := descriptions[name]; ok {
		return desc
	}
	return "Интерактивная среда"
}

func init() {
	go func() {
		for name, imageName := range imageNames {
			cmd := exec.Command("docker", "ps", "--filter", fmt.Sprintf("name=educational-data-protection-simulator-%s", imageName), "--format", "{{.Names}}")
			output, err := cmd.Output()
			if err == nil && len(output) > 0 {
				mu.Lock()
				sandboxes[name] = true
				mu.Unlock()
			}
		}
		fmt.Println("Sandbox status initialized")
	}()
}
