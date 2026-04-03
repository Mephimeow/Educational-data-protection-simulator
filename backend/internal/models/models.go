package models

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		getEnv("DB_HOST", "postgres"),
		getEnv("DB_USER", "cyberuser"),
		getEnv("DB_PASSWORD", "cyberpass"),
		getEnv("DB_NAME", "cyberdb"),
		getEnv("DB_PORT", "5432"),
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connected successfully")
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

type ThreatType string

const (
	Phishing          ThreatType = "phishing"
	Malware           ThreatType = "malware"
	SocialEngineering ThreatType = "social_engineering"
	FakeWebsite       ThreatType = "fake_website"
	DataLeak          ThreatType = "data_leak"
)

type ThreatLevel string

const (
	Low      ThreatLevel = "low"
	Medium   ThreatLevel = "medium"
	High     ThreatLevel = "high"
	Critical ThreatLevel = "critical"
)

type Scenario struct {
	ID          string      `gorm:"primaryKey" json:"id"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Environment string      `json:"environment"`
	ThreatType  ThreatType  `json:"threat_type"`
	ThreatLevel ThreatLevel `json:"threat_level"`
}
