package api

import (
	"net/http"
	"time"

	"github.com/cyber-simulator/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func RegisterRoutes(r *gin.Engine) {
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "CyberSimulator API"})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := r.Group("/api")
	{
		api.GET("/scenarios", getScenarios)
		api.GET("/scenarios/:environment", getScenariosByEnv)
		api.GET("/email/inbox", getEmails)
		api.GET("/social/feed", getSocialFeed)
	}
}

func getScenarios(c *gin.Context) {
	scenarios := []models.Scenario{
		{
			ID:            "1",
			Title:         "Фишинговое письмо от 'банка'",
			Description:   "Пользователь получает письмо, имитирующее уведомление от банка с просьбой срочно подтвердить данные",
			Environment:   "email",
			ThreatType:    models.Phishing,
			ThreatLevel:   models.High,
			CorrectAction: "Удалить письмо и не переходить по ссылкам",
		},
		{
			ID:            "2",
			Title:         "Мошенник в социальной сети",
			Description:   "Незнакомый пользователь предлагает выгодную сделку и запрашивает личные данные",
			Environment:   "social",
			ThreatType:    models.SocialEngineering,
			ThreatLevel:   models.Medium,
			CorrectAction: "Отклонить запрос и пожаловаться",
		},
	}
	c.JSON(http.StatusOK, scenarios)
}

func getScenariosByEnv(c *gin.Context) {
	env := c.Param("environment")
	scenarios := []models.Scenario{
		{
			ID:            "1",
			Title:         "Фишинговое письмо от 'банка'",
			Description:   "Пользователь получает письмо, имитирующее уведомление от банка с просьбой срочно подтвердить данные",
			Environment:   "email",
			ThreatType:    models.Phishing,
			ThreatLevel:   models.High,
			CorrectAction: "Удалить письмо и не переходить по ссылкам",
		},
	}
	if env == "social" {
		scenarios = []models.Scenario{
			{
				ID:            "2",
				Title:         "Мошенник в социальной сети",
				Description:   "Незнакомый пользователь предлагает выгодную сделку и запрашивает личные данные",
				Environment:   "social",
				ThreatType:    models.SocialEngineering,
				ThreatLevel:   models.Medium,
				CorrectAction: "Отклонить запрос и пожаловаться",
			},
		}
	}
	c.JSON(http.StatusOK, scenarios)
}

func getEmails(c *gin.Context) {
	emails := []models.EmailMessage{
		{
			ID:                uuid.New().String(),
			FromEmail:         "support@bank-center.ru",
			FromName:          "Центр-Инвест Банк",
			Subject:           "Срочно: Подтвердите ваш аккаунт",
			Body:              "Уважаемый клиент! Для предотвращения блокировки вашего счета подтвердите личные данные по ссылке...",
			Attachments:       "document.pdf",
			ReceivedAt:        time.Now(),
			IsThreat:          true,
			ThreatType:        "phishing",
			ThreatDescription: "Фишинговое письмо с поддельной ссылкой",
		},
		{
			ID:          uuid.New().String(),
			FromEmail:   "colleague@company.ru",
			FromName:    "Иван Петров",
			Subject:     "Отчет за прошлый месяц",
			Body:        "Привет! Высылаю отчет, посмотри пожалуйста.",
			Attachments: "report.xlsx",
			ReceivedAt:  time.Now(),
			IsThreat:    false,
		},
	}
	c.JSON(http.StatusOK, emails)
}

func getSocialFeed(c *gin.Context) {
	posts := []models.SocialMessage{
		{
			ID:         uuid.New().String(),
			FromUser:   "MegaShop",
			FromAvatar: "🛒",
			Content:    "Поздравляем! Вы выиграли iPhone 15! Перейдите по ссылке для получения приза...",
			Timestamp:  time.Now(),
			IsThreat:   true,
			ThreatType: "phishing",
		},
		{
			ID:         uuid.New().String(),
			FromUser:   "Иван Петров",
			FromAvatar: "👤",
			Content:    "Всем привет! Хорошая погода сегодня, идем на прогулку?",
			Timestamp:  time.Now(),
			IsThreat:   false,
		},
	}
	c.JSON(http.StatusOK, posts)
}
