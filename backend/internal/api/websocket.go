package api

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/cyber-simulator/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Hub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan []byte
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mu         sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.Close()
			}
			h.mu.Unlock()
		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				err := client.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					client.Close()
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) BroadcastEvent(eventType string, data interface{}) {
	msg := map[string]interface{}{
		"type": eventType,
		"data": data,
	}
	jsonData, _ := json.Marshal(msg)
	h.broadcast <- jsonData
}

var globalHub *Hub

func InitWebSocket() {
	globalHub = NewHub()
	go globalHub.Run()
}

func WebSocketHandler(c *gin.Context) {
	if globalHub == nil {
		InitWebSocket()
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	globalHub.register <- conn

	defer func() {
		globalHub.unregister <- conn
	}()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

func NotifyLevelComplete(userID uint, xpEarned int, level string) {
	if globalHub != nil {
		globalHubBroadcastEvent("level_complete", map[string]interface{}{
			"user_id":   userID,
			"xp":        xpEarned,
			"level":     level,
			"timestamp": time.Now().Unix(),
		})
	}
}

func globalHubBroadcastEvent(eventType string, data interface{}) {
	if globalHub != nil {
		globalHub.BroadcastEvent(eventType, data)
	}
}

var redisClient *redis.Client
var ctx = context.Background()

func InitRedisCache(host, port string) {
	redisClient = redis.NewClient(&redis.Options{
		Addr:     host + ":" + port,
		Password: "",
		DB:       0,
	})
	log.Println("Redis cache initialized")
}

func GetCachedScenarios() ([]byte, error) {
	if redisClient == nil {
		return nil, nil
	}
	return redisClient.Get(ctx, "scenarios:all").Bytes()
}

func SetCachedScenarios(data []byte, ttl time.Duration) error {
	if redisClient == nil {
		return nil
	}
	return redisClient.Set(ctx, "scenarios:all", data, ttl).Err()
}

func GetCachedScenario(id string) ([]byte, error) {
	if redisClient == nil {
		return nil, nil
	}
	return redisClient.Get(ctx, "scenario:"+id).Bytes()
}

func SetCachedScenario(id string, data []byte, ttl time.Duration) error {
	if redisClient == nil {
		return nil
	}
	return redisClient.Set(ctx, "scenario:"+id, data, ttl).Err()
}

func InvalidateScenarioCache() {
	if redisClient == nil {
		return
	}
	redisClient.Del(ctx, "scenarios:all")
	keys, _ := redisClient.Keys(ctx, "scenario:*").Result()
	if len(keys) > 0 {
		redisClient.Del(ctx, keys...)
	}
}

func CachedScenariosMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if redisClient == nil {
			c.Next()
			return
		}

		c.Set("redis_client", redisClient)
		c.Next()
	}
}

type RateLimitBucket struct {
	Count     int
	ExpiresAt time.Time
}

var rateLimitBuckets = make(map[string]*RateLimitBucket)
var rateLimitMu sync.Mutex

func RateLimiter(maxRequests int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		rateLimitMu.Lock()
		bucket, exists := rateLimitBuckets[ip]

		if !exists || time.Now().After(bucket.ExpiresAt) {
			rateLimitBuckets[ip] = &RateLimitBucket{
				Count:     1,
				ExpiresAt: time.Now().Add(window),
			}
			rateLimitMu.Unlock()
			c.Next()
			return
		}

		if bucket.Count >= maxRequests {
			rateLimitMu.Unlock()
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}

		bucket.Count++
		rateLimitMu.Unlock()

		c.Next()
	}
}

func GetLiveStats() gin.H {
	var totalUsers int64
	models.DB.Model(&models.User{}).Count(&totalUsers)

	var activeUsers int64
	models.DB.Model(&models.LevelProgress{}).Where("completed_at > ?", time.Now().Add(-1*time.Hour)).Distinct("user_id").Count(&activeUsers)

	var totalCompletions int64
	models.DB.Model(&models.LevelProgress{}).Where("completed = ?", true).Count(&totalCompletions)

	return gin.H{
		"total_users":       totalUsers,
		"active_users_1h":   activeUsers,
		"total_completions": totalCompletions,
		"timestamp":         time.Now().Unix(),
	}
}
