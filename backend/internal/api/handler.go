package api

import (
	"net/http"

	"github.com/cyber-simulator/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"name":        "CyberSimulator API",
			"version":     "1.0.0",
			"description": "Educational cybersecurity simulator API",
		})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := r.Group("/api/v1")
	{
		api.GET("/scenarios", getScenarios)
		api.GET("/scenarios/:id", getScenarioById)
		api.GET("/scenarios/:id/levels", getScenarioLevels)
		api.GET("/scenarios/:id/levels/:levelId", getLevelById)
		api.GET("/attacks", getAttackTypes)
		api.GET("/tips", getSecurityTips)
	}
}

func getScenarios(c *gin.Context) {
	scenarios := []models.Scenario{
		{
			ID:          "office",
			Title:       "🏢 Офис",
			Description: "Рабочий день в офисе. Фишинговые письма, подозрительные USB-накопители, социальная инженерия.",
			Environment: "office",
			ThreatType:  models.Phishing,
			ThreatLevel: models.Medium,
		},
		{
			ID:          "home",
			Title:       "🏠 Дом",
			Description: "Удалённая работа. Безопасность домашней сети, пароли, фишинг в мессенджерах.",
			Environment: "home",
			ThreatType:  models.SocialEngineering,
			ThreatLevel: models.Medium,
		},
		{
			ID:          "public",
			Title:       "📶 Общественный Wi-Fi",
			Description: "Кафе и общественные места. Атаки \"злой двойник\", перехват трафика, скимминг.",
			Environment: "public",
			ThreatType:  models.Malware,
			ThreatLevel: models.High,
		},
	}
	c.JSON(http.StatusOK, gin.H{"scenarios": scenarios})
}

func getScenarioById(c *gin.Context) {
	id := c.Param("id")
	scenarios := map[string]models.Scenario{
		"office": {
			ID:          "office",
			Title:       "🏢 Офис",
			Description: "Рабочий день в офисе. Фишинговые письма, подозрительные USB-накопители, социальная инженерия.",
			Environment: "office",
			ThreatType:  models.Phishing,
			ThreatLevel: models.Medium,
		},
		"home": {
			ID:          "home",
			Title:       "🏠 Дом",
			Description: "Удалённая работа. Безопасность домашней сети, пароли, фишинг в мессенджерах.",
			Environment: "home",
			ThreatType:  models.SocialEngineering,
			ThreatLevel: models.Medium,
		},
		"public": {
			ID:          "public",
			Title:       "📶 Общественный Wi-Fi",
			Description: "Кафе и общественные места. Атаки \"злой двойник\", перехват трафика, скимминг.",
			Environment: "public",
			ThreatType:  models.Malware,
			ThreatLevel: models.High,
		},
	}
	if s, ok := scenarios[id]; ok {
		c.JSON(http.StatusOK, s)
		return
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Scenario not found"})
}

func getScenarioLevels(c *gin.Context) {
	id := c.Param("id")
	levels := map[string][]gin.H{
		"office": {
			{"id": 1, "name": "Утренняя почта", "attack": "Фишинг", "icon": "📧", "difficulty": "Легко"},
			{"id": 2, "name": "USB-флешка", "attack": "Вредоносное ПО", "icon": "💾", "difficulty": "Средне"},
			{"id": 3, "name": "Звонок IT-поддержки", "attack": "Социальная инженерия", "icon": "📞", "difficulty": "Средне"},
		},
		"home": {
			{"id": 1, "name": "Письмо из банка", "attack": "Фишинг", "icon": "🏦", "difficulty": "Легко"},
			{"id": 2, "name": "Сильный пароль", "attack": "Безопасность паролей", "icon": "🔐", "difficulty": "Легко"},
			{"id": 3, "name": "Обновление системы", "attack": "Социальная инженерия", "icon": "⚙️", "difficulty": "Средне"},
		},
		"public": {
			{"id": 1, "name": "Выбор сети", "attack": "Evil Twin", "icon": "📶", "difficulty": "Легко"},
			{"id": 2, "name": "Банкомат", "attack": "Скимминг", "icon": "🏧", "difficulty": "Средне"},
			{"id": 3, "name": "Работа в кафе", "attack": "Перехват данных", "icon": "☕", "difficulty": "Средне"},
		},
	}
	if l, ok := levels[id]; ok {
		c.JSON(http.StatusOK, gin.H{"levels": l})
		return
	}
	c.JSON(http.StatusOK, gin.H{"levels": []gin.H{}})
}

func getLevelById(c *gin.Context) {
	scenarioId := c.Param("id")
	levelId := c.Param("levelId")

	allLevels := map[string]map[string]gin.H{
		"office": {
			"1": {"id": 1, "name": "Утренняя почта", "attack": "Фишинг", "icon": "📧", "sandbox": "email-client", "port": 8082},
			"2": {"id": 2, "name": "USB-флешка", "attack": "Вредоносное ПО", "icon": "💾", "sandbox": "phishing", "port": 8081},
			"3": {"id": 3, "name": "Звонок IT-поддержки", "attack": "Социальная инженерия", "icon": "📞", "sandbox": "social-network", "port": 8084},
		},
		"home": {
			"1": {"id": 1, "name": "Письмо из банка", "attack": "Фишинг", "icon": "🏦", "sandbox": "phishing", "port": 8081},
			"2": {"id": 2, "name": "Сильный пароль", "attack": "Безопасность паролей", "icon": "🔐", "sandbox": "phishing", "port": 8081},
			"3": {"id": 3, "name": "Обновление системы", "attack": "Социальная инженерия", "icon": "⚙️", "sandbox": "email-client", "port": 8082},
		},
		"public": {
			"1": {"id": 1, "name": "Выбор сети", "attack": "Evil Twin", "icon": "📶", "sandbox": "wifi-hotspot", "port": 8083},
			"2": {"id": 2, "name": "Банкомат", "attack": "Скимминг", "icon": "🏧", "sandbox": "atm-simulator", "port": 8085},
			"3": {"id": 3, "name": "Работа в кафе", "attack": "Перехват данных", "icon": "☕", "sandbox": "wifi-hotspot", "port": 8083},
		},
	}

	if scenario, ok := allLevels[scenarioId]; ok {
		if level, ok := scenario[levelId]; ok {
			c.JSON(http.StatusOK, level)
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Level not found"})
}

func getAttackTypes(c *gin.Context) {
	attacks := []gin.H{
		{"id": "phishing", "name": "Фишинг", "icon": "🎣", "description": "Поддельные письма и сайты для кражи данных", "cwe": []string{"CWE-20", "CWE-287"}},
		{"id": "social_engineering", "name": "Социальная инженерия", "icon": "🎭", "description": "Манипуляция людьми для получения информации", "cwe": []string{"CWE-306", "CWE-862"}},
		{"id": "evil_twin", "name": "Злой двойник", "icon": "👻", "description": "Поддельные Wi-Fi точки доступа", "cwe": []string{"CWE-311"}},
		{"id": "skimming", "name": "Скимминг", "icon": "💳", "description": "Установка считывателей на банкоматы", "cwe": []string{"CWE-312"}},
		{"id": "password", "name": "Подбор пароля", "icon": "🔑", "description": "Brute force и угадывание паролей", "cwe": []string{"CWE-307", "CWE-521"}},
		{"id": "malware", "name": "Вредоносное ПО", "icon": "🦠", "description": "Вирусы, трояны, черви", "cwe": []string{"CWE-94", "CWE-506"}},
	}
	c.JSON(http.StatusOK, gin.H{"attacks": attacks})
}

func getSecurityTips(c *gin.Context) {
	tips := []gin.H{
		{"category": "phishing", "tips": []string{"Проверяйте адрес отправителя", "Не переходите по ссылкам из писем", "Не открывайте подозрительные вложения", "При сомнениях свяжитесь с отправителем"}},
		{"category": "passwords", "tips": []string{"Используйте длинные пароли (12+ символов)", "Не используйте один пароль везде", "Включите двухфакторную аутентификацию", "Используйте менеджер паролей"}},
		{"category": "wifi", "tips": []string{"Избегайте общественных сетей для важных дел", "Используйте VPN в общественных местах", "Отключайте автоподключение к Wi-Fi", "Не используйте банковские приложения в кафе"}},
		{"category": "social_engineering", "tips": []string{"Не сообщайте пароли и PIN-коды", "Не позволяйте удалённый доступ посторонним", "Проверяйте информацию через официальные каналы", "Не торопитесь с решениями"}},
	}
	c.JSON(http.StatusOK, gin.H{"tips": tips})
}
