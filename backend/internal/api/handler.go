package api

import (
	"net/http"
	"strconv"

	"github.com/cyber-simulator/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetScenarios(c *gin.Context) {
	var scenarios []models.Scenario
	models.DB.Preload("Levels", func(db *gorm.DB) *gorm.DB {
		return db.Order("\"order\" ASC")
	}).Find(&scenarios)
	c.JSON(http.StatusOK, gin.H{"scenarios": scenarios})
}

func GetScenarioById(c *gin.Context) {
	id := c.Param("id")
	var scenario models.Scenario
	result := models.DB.Preload("Levels", func(db *gorm.DB) *gorm.DB {
		return db.Order("\"order\" ASC")
	}).First(&scenario, "id = ?", id)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Scenario not found"})
		return
	}
	c.JSON(http.StatusOK, scenario)
}

func CreateScenario(c *gin.Context) {
	var scenario models.Scenario
	if err := c.ShouldBindJSON(&scenario); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	models.DB.Create(&scenario)
	c.JSON(http.StatusCreated, scenario)
}

func UpdateScenario(c *gin.Context) {
	id := c.Param("id")
	var scenario models.Scenario
	if err := models.DB.First(&scenario, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Scenario not found"})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	models.DB.Model(&scenario).Updates(updates)
	c.JSON(http.StatusOK, scenario)
}

func DeleteScenario(c *gin.Context) {
	id := c.Param("id")
	models.DB.Delete(&models.Scenario{}, "id = ?", id)
	models.DB.Delete(&models.Level{}, "scenario_id = ?", id)
	c.JSON(http.StatusOK, gin.H{"message": "Scenario deleted"})
}

func GetScenarioLevels(c *gin.Context) {
	id := c.Param("id")
	var levels []models.Level
	models.DB.Where("scenario_id = ?", id).Order("\"order\" ASC").Find(&levels)
	c.JSON(http.StatusOK, gin.H{"levels": levels})
}

func GetLevelById(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid level ID"})
		return
	}

	var level models.Level
	result := models.DB.First(&level, id)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Level not found"})
		return
	}
	c.JSON(http.StatusOK, level)
}

func CreateLevel(c *gin.Context) {
	var level models.Level
	if err := c.ShouldBindJSON(&level); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	models.DB.Create(&level)
	c.JSON(http.StatusCreated, level)
}

func UpdateLevel(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid level ID"})
		return
	}

	var level models.Level
	if err := models.DB.First(&level, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Level not found"})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	models.DB.Model(&level).Updates(updates)
	c.JSON(http.StatusOK, level)
}

func DeleteLevel(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid level ID"})
		return
	}
	models.DB.Delete(&models.Level{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Level deleted"})
}

func GetAttackTypes(c *gin.Context) {
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

func GetSecurityTips(c *gin.Context) {
	tips := []gin.H{
		{"category": "phishing", "tips": []string{"Проверяйте адрес отправителя", "Не переходите по ссылкам из писем", "Не открывайте подозрительные вложения", "При сомнениях свяжитесь с отправителем"}},
		{"category": "passwords", "tips": []string{"Используйте длинные пароли (12+ символов)", "Не используйте один пароль везде", "Включите двухфакторную аутентификацию", "Используйте менеджер паролей"}},
		{"category": "wifi", "tips": []string{"Избегайте общественных сетей для важных дел", "Используйте VPN в общественных местах", "Отключайте автоподключение к Wi-Fi", "Не используйте банковские приложения в кафе"}},
		{"category": "social_engineering", "tips": []string{"Не сообщайте пароли и PIN-коды", "Не позволяйте удалённый доступ посторонним", "Проверяйте информацию через официальные каналы", "Не торопитесь с решениями"}},
	}
	c.JSON(http.StatusOK, gin.H{"tips": tips})
}
