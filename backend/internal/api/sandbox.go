package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

var containerPorts = map[string]int{
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

func RegisterSandboxRoutes(r *gin.Engine) {
	sandbox := r.Group("/api/v1/sandbox")
	{
		sandbox.GET("/list", listSandboxes)
		sandbox.GET("/status/:name", getSandboxStatus)
		sandbox.GET("/url/:name", getSandboxUrl)
	}
}

func listSandboxes(c *gin.Context) {
	sandboxList := []gin.H{}
	for name, port := range containerPorts {
		sandboxList = append(sandboxList, gin.H{
			"name":        name,
			"port":        port,
			"url":         getSandboxUrlByName(name, port),
			"description": getSandboxDescription(name),
			"running":     true,
		})
	}
	c.JSON(http.StatusOK, gin.H{"sandboxes": sandboxList})
}

func getSandboxStatus(c *gin.Context) {
	name := c.Param("name")

	port, exists := containerPorts[name]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sandbox not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"name":    name,
		"port":    port,
		"url":     getSandboxUrlByName(name, port),
		"running": true,
	})
}

func getSandboxUrl(c *gin.Context) {
	name := c.Param("name")

	port, exists := containerPorts[name]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sandbox not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"name": name,
		"url":  getSandboxUrlByName(name, port),
	})
}

func getSandboxUrlByName(name string, port int) string {
	return "http://localhost:" + string(rune('0'+port/100)) + string(rune('0'+(port/10)%10)) + string(rune('0'+port%10))
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
