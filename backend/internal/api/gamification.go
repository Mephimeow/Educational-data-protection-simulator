package api

import (
	"net/http"
	"time"

	"github.com/cyber-simulator/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func GetAchievements(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var allAchievements []models.Achievement
	models.DB.Find(&allAchievements)

	var userAchievements []models.UserAchievement
	models.DB.Where("user_id = ?", userID).Preload("Achievement").Find(&userAchievements)

	unlockedMap := make(map[uint]time.Time)
	for _, ua := range userAchievements {
		unlockedMap[ua.AchievementID] = ua.UnlockedAt
	}

	type AchievementResponse struct {
		ID          uint      `json:"id"`
		Code        string    `json:"code"`
		Name        string    `json:"name"`
		Description string    `json:"description"`
		Icon        string    `json:"icon"`
		XPReward    int       `json:"xp_reward"`
		Required    int       `json:"required"`
		Type        string    `json:"type"`
		Unlocked    bool      `json:"unlocked"`
		UnlockedAt  time.Time `json:"unlocked_at,omitempty"`
	}

	response := make([]AchievementResponse, len(allAchievements))
	for i, a := range allAchievements {
		unlockedAt, ok := unlockedMap[a.ID]
		response[i] = AchievementResponse{
			ID:          a.ID,
			Code:        a.Code,
			Name:        a.Name,
			Description: a.Description,
			Icon:        a.Icon,
			XPReward:    a.XPReward,
			Required:    a.Required,
			Type:        a.Type,
			Unlocked:    ok,
			UnlockedAt:  unlockedAt,
		}
	}

	c.JSON(http.StatusOK, gin.H{"achievements": response})
}

func GetUserStats(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var stats models.UserStats
	result := models.DB.Where("user_id = ?", userID).First(&stats)

	if result.Error != nil {
		stats = models.UserStats{
			UserID: userID.(uint),
			XP:     0,
			Level:  1,
		}
		models.DB.Create(&stats)
	}

	var achievements []models.UserAchievement
	models.DB.Where("user_id = ?", userID).Find(&achievements)

	c.JSON(http.StatusOK, gin.H{
		"stats":        stats,
		"achievements": len(achievements),
	})
}

func GetLeaderboard(c *gin.Context) {
	var leaderboard []models.UserStats
	models.DB.Order("xp DESC, level DESC").Limit(50).Find(&leaderboard)

	type LeaderboardEntry struct {
		Rank     int    `json:"rank"`
		UserID   uint   `json:"user_id"`
		UserName string `json:"user_name"`
		XP       int    `json:"xp"`
		Level    int    `json:"level"`
	}

	var users map[uint]string
	models.DB.Find(&users)

	entries := make([]LeaderboardEntry, len(leaderboard))
	for i, stats := range leaderboard {
		var user models.User
		name := "Anonymous"
		if models.DB.First(&user, stats.UserID).Error == nil {
			name = user.Name
		}
		entries[i] = LeaderboardEntry{
			Rank:     i + 1,
			UserID:   stats.UserID,
			UserName: name,
			XP:       stats.XP,
			Level:    stats.Level,
		}
	}

	c.JSON(http.StatusOK, gin.H{"leaderboard": entries})
}

func calculateLevel(xp int) int {
	level := 1
	required := 100
	for xp >= required {
		xp -= required
		level++
		required += 50
	}
	return level
}

func checkAndAwardAchievements(userID uint, stats *models.UserStats) []models.Achievement {
	var newAchievements []models.Achievement

	var completedLevels int64
	models.DB.Model(&models.LevelProgress{}).Where("user_id = ? AND completed = ?", userID, true).Count(&completedLevels)

	var userAchievements []models.UserAchievement
	models.DB.Where("user_id = ?", userID).Find(&userAchievements)
	unlockedIDs := make(map[uint]bool)
	for _, ua := range userAchievements {
		unlockedIDs[ua.AchievementID] = true
	}

	var achievements []models.Achievement
	models.DB.Find(&achievements)

	for _, a := range achievements {
		if unlockedIDs[a.ID] {
			continue
		}

		shouldUnlock := false

		switch a.Type {
		case "levels":
			shouldUnlock = int(completedLevels) >= a.Required
		case "xp":
			shouldUnlock = stats.XP >= a.Required
		case "level":
			shouldUnlock = stats.Level >= a.Required
		case "streak":
			shouldUnlock = stats.Streak >= a.Required
		}

		if shouldUnlock {
			ua := models.UserAchievement{
				UserID:        userID,
				AchievementID: a.ID,
				UnlockedAt:    time.Now(),
			}
			models.DB.Create(&ua)
			stats.XP += a.XPReward
			stats.Level = calculateLevel(stats.XP)
			newAchievements = append(newAchievements, a)
		}
	}

	return newAchievements
}

func CompleteLevelWithXP(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		LevelID     uint   `json:"level_id" binding:"required"`
		ScenarioID  string `json:"scenario_id" binding:"required"`
		TimeSeconds int    `json:"time_seconds"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	progress := models.LevelProgress{
		UserID:      userID.(uint),
		ScenarioID:  req.ScenarioID,
		LevelID:     req.LevelID,
		Completed:   true,
		Success:     true,
		CompletedAt: time.Now(),
	}
	models.DB.Create(&progress)

	var stats models.UserStats
	result := models.DB.Where("user_id = ?", userID).First(&stats)
	if result.Error != nil {
		stats = models.UserStats{
			UserID:         userID.(uint),
			XP:             0,
			Level:          1,
			CompletedTasks: 0,
			Streak:         0,
		}
		models.DB.Create(&stats)
	}

	stats.CompletedTasks++
	stats.TotalTime += req.TimeSeconds

	xpReward := 10
	if req.TimeSeconds < 60 {
		xpReward += 5
	}
	stats.XP += xpReward
	stats.Level = calculateLevel(stats.XP)

	stats.LastActive = time.Now().Format("2006-01-02")

	models.DB.Save(&stats)

	newAchievements := checkAndAwardAchievements(userID.(uint), &stats)

	c.JSON(http.StatusOK, gin.H{
		"message":          "Level completed",
		"xp_earned":        xpReward,
		"total_xp":         stats.XP,
		"level":            stats.Level,
		"new_achievements": newAchievements,
	})
}
