package api

import (
	"net/http"
	"time"

	"github.com/cyber-simulator/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type UserHandler struct{}

func NewUserHandler() *UserHandler {
	return &UserHandler{}
}

type UpdateProfileRequest struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, _ := c.Get("userID")

	var user models.User
	if err := models.DB.Preload("UserRoles.Role").First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var roles []string
	for _, ur := range user.UserRoles {
		roles = append(roles, ur.Role.Name)
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         user.ID,
		"name":       user.Name,
		"email":      user.Email,
		"phone":      user.Phone,
		"roles":      roles,
		"created_at": user.CreatedAt,
	})
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := models.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}

	models.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated",
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"phone": user.Phone,
		},
	})
}

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

func (h *AdminHandler) GetAllUsers(c *gin.Context) {
	var users []models.User
	models.DB.Preload("UserRoles.Role").Find(&users)

	var response []gin.H
	for _, user := range users {
		var roles []string
		for _, ur := range user.UserRoles {
			roles = append(roles, ur.Role.Name)
		}
		response = append(response, gin.H{
			"id":         user.ID,
			"name":       user.Name,
			"email":      user.Email,
			"phone":      user.Phone,
			"roles":      roles,
			"created_at": user.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{"users": response})
}

func (h *AdminHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	if err := models.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	models.DB.Delete(&models.UserRole{}, "user_id = ?", userID)
	models.DB.Delete(&models.LevelProgress{}, "user_id = ?", userID)
	models.DB.Delete(&models.RefreshToken{}, "user_id = ?", userID)
	models.DB.Delete(&user)

	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}

type RoleChangeRequest struct {
	Roles []string `json:"roles" binding:"required"`
}

func (h *AdminHandler) UpdateUserRoles(c *gin.Context) {
	userID := c.Param("id")

	var req RoleChangeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := models.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	models.DB.Where("user_id = ?", userID).Delete(&models.UserRole{})

	for _, roleName := range req.Roles {
		var role models.Role
		if err := models.DB.Where("name = ?", roleName).First(&role).Error; err == nil {
			userRole := models.UserRole{
				UserID: user.ID,
				RoleID: role.ID,
			}
			models.DB.Create(&userRole)
		}
	}

	var updatedUser models.User
	models.DB.Preload("UserRoles.Role").First(&updatedUser, userID)

	var roles []string
	for _, ur := range updatedUser.UserRoles {
		roles = append(roles, ur.Role.Name)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Roles updated",
		"user": gin.H{
			"id":    updatedUser.ID,
			"name":  updatedUser.Name,
			"email": updatedUser.Email,
			"roles": roles,
		},
	})
}

type StatsHandler struct{}

func NewStatsHandler() *StatsHandler {
	return &StatsHandler{}
}

type UserStatsResponse struct {
	TotalScenarios  int             `json:"total_scenarios"`
	CompletedLevels int             `json:"completed_levels"`
	SuccessRate     float64         `json:"success_rate"`
	Progress        []ScenarioStats `json:"progress"`
}

type ScenarioStats struct {
	ScenarioID   string `json:"scenario_id"`
	ScenarioName string `json:"scenario_name"`
	TotalLevels  int    `json:"total_levels"`
	Completed    int    `json:"completed"`
	Success      int    `json:"success"`
}

func (h *StatsHandler) GetMyStats(c *gin.Context) {
	userID, _ := c.Get("userID")

	var progress []models.LevelProgress
	models.DB.Where("user_id = ?", userID).Find(&progress)

	completedLevels := 0
	successCount := 0
	for _, p := range progress {
		if p.Completed {
			completedLevels++
			if p.Success {
				successCount++
			}
		}
	}

	var scenarios []models.Scenario
	models.DB.Find(&scenarios)

	var progressByScenario = make(map[string]ScenarioStats)
	for _, s := range scenarios {
		progressByScenario[s.ID] = ScenarioStats{
			ScenarioID:   s.ID,
			ScenarioName: s.Title,
			TotalLevels:  0,
			Completed:    0,
			Success:      0,
		}
	}

	for _, p := range progress {
		if stats, ok := progressByScenario[p.ScenarioID]; ok {
			stats.Completed++
			if p.Success {
				stats.Success++
			}
			progressByScenario[p.ScenarioID] = stats
		}
	}

	var levels []models.Level
	models.DB.Find(&levels)
	var levelCountByScenario = make(map[string]int)
	for _, l := range levels {
		levelCountByScenario[l.ScenarioID]++
	}

	for id, stats := range progressByScenario {
		stats.TotalLevels = levelCountByScenario[id]
		progressByScenario[id] = stats
	}

	var progressList []ScenarioStats
	for _, stats := range progressByScenario {
		progressList = append(progressList, stats)
	}

	successRate := 0.0
	if completedLevels > 0 {
		successRate = float64(successCount) / float64(completedLevels) * 100
	}

	c.JSON(http.StatusOK, UserStatsResponse{
		TotalScenarios:  len(scenarios),
		CompletedLevels: completedLevels,
		SuccessRate:     successRate,
		Progress:        progressList,
	})
}

type CompleteLevelRequest struct {
	ScenarioID string `json:"scenario_id" binding:"required"`
	LevelID    uint   `json:"level_id" binding:"required"`
	Success    bool   `json:"success"`
}

func (h *StatsHandler) CompleteLevel(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req CompleteLevelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	progress := models.LevelProgress{
		UserID:      userID.(uint),
		ScenarioID:  req.ScenarioID,
		LevelID:     req.LevelID,
		Completed:   true,
		Success:     req.Success,
		CompletedAt: time.Now(),
	}

	models.DB.Create(&progress)

	c.JSON(http.StatusOK, gin.H{"message": "Level completed", "success": req.Success})
}

func (h *StatsHandler) GetAllStats(c *gin.Context) {
	var users []models.User
	models.DB.Find(&users)

	var result []gin.H
	for _, user := range users {
		var progress []models.LevelProgress
		models.DB.Where("user_id = ?", user.ID).Find(&progress)

		completed := 0
		success := 0
		for _, p := range progress {
			if p.Completed {
				completed++
				if p.Success {
					success++
				}
			}
		}

		var roles []string
		var userRoles []models.UserRole
		models.DB.Preload("Role").Where("user_id = ?", user.ID).Find(&userRoles)
		for _, ur := range userRoles {
			roles = append(roles, ur.Role.Name)
		}

		result = append(result, gin.H{
			"user_id":       user.ID,
			"name":          user.Name,
			"email":         user.Email,
			"roles":         roles,
			"completed":     completed,
			"success_count": success,
			"success_rate":  float64(success) / float64(completed+1),
		})
	}

	c.JSON(http.StatusOK, gin.H{"stats": result})
}
