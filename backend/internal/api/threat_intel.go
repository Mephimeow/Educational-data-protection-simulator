package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type ThreatCheckRequest struct {
	Type  string `json:"type" binding:"required"`
	Value string `json:"value" binding:"required"`
}

type VirusTotalResponse struct {
	Data struct {
		Attributes struct {
			Stats struct {
				Malicious  int `json:"malicious"`
				Suspicious int `json:"suspicious"`
				Undetected int `json:"undetected"`
				Harmless   int `json:"harmless"`
			} `json:"last_analysis_stats"`
		} `json:"attributes"`
	} `json:"data"`
}

type ShodanResponse struct {
	IP         string    `json:"ip"`
	Country    string    `json:"country"`
	City       string    `json:"city"`
	ISP        string    `json:"isp"`
	Domain     string    `json:"domain"`
	OS         string    `json:"os"`
	Ports      []int     `json:"ports"`
	Vulns      []string  `json:"vulns"`
	LastUpdate time.Time `json:"last_update"`
	Tags       []string  `json:"tags"`
}

func CheckVirusTotal(hash string) (map[string]interface{}, error) {
	apiKey := os.Getenv("VIRUSTOTAL_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("VIRUSTOTAL_API_KEY not set")
	}

	url := fmt.Sprintf("https://www.virustotal.com/api/v3/files/%s", hash)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("x-apikey", apiKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("VirusTotal API error: %d", resp.StatusCode)
	}

	var result VirusTotalResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	stats := result.Data.Attributes.Stats
	verdict := "unknown"
	if stats.Malicious > 3 {
		verdict = "malicious"
	} else if stats.Suspicious > 0 {
		verdict = "suspicious"
	} else if stats.Harmless > 5 {
		verdict = "clean"
	}

	return map[string]interface{}{
		"verdict":    verdict,
		"malicious":  stats.Malicious,
		"suspicious": stats.Suspicious,
		"undetected": stats.Undetected,
		"total":      stats.Malicious + stats.Suspicious + stats.Undetected + stats.Harmless,
	}, nil
}

func CheckShodan(ip string) (map[string]interface{}, error) {
	apiKey := os.Getenv("SHODAN_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("SHODAN_API_KEY not set")
	}

	url := fmt.Sprintf("https://api.shodan.io/shodan/host/%s?key=%s", ip, apiKey)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("Shodan API error: %d", resp.StatusCode)
	}

	var result ShodanResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	verdict := "safe"
	if len(result.Vulns) > 0 || len(result.Tags) > 0 {
		verdict = "vulnerable"
	}

	return map[string]interface{}{
		"verdict":         verdict,
		"country":         result.Country,
		"city":            result.City,
		"isp":             result.ISP,
		"ports":           result.Ports,
		"vulnerabilities": result.Vulns,
		"tags":            result.Tags,
	}, nil
}

func CheckIPReputation(ip string) (map[string]interface{}, error) {
	results := make(map[string]interface{})

	if shodanResult, err := CheckShodan(ip); err == nil {
		results["shodan"] = shodanResult
	} else {
		log.Printf("Shodan check failed for %s: %v", ip, err)
	}

	results["verdict"] = "unknown"
	if s, ok := results["shodan"].(map[string]interface{}); ok {
		if v, ok := s["verdict"].(string); ok && v == "vulnerable" {
			results["verdict"] = "vulnerable"
		}
	}

	return results, nil
}

func ThreatCheck(c *gin.Context) {
	var req ThreatCheckRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	switch req.Type {
	case "hash":
		hash := strings.TrimSpace(req.Value)
		if len(hash) < 32 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid hash format"})
			return
		}

		result, err := CheckVirusTotal(hash)
		if err != nil {
			c.JSON(http.StatusOK, gin.H{
				"type":    "hash",
				"hash":    hash,
				"error":   err.Error(),
				"verdict": "unknown",
			})
			return
		}
		result["type"] = "hash"
		result["hash"] = hash
		c.JSON(http.StatusOK, result)

	case "ip":
		ip := strings.TrimSpace(req.Value)
		result, err := CheckIPReputation(ip)
		if err != nil {
			c.JSON(http.StatusOK, gin.H{
				"type":    "ip",
				"ip":      ip,
				"error":   err.Error(),
				"verdict": "unknown",
			})
			return
		}
		result["type"] = "ip"
		result["ip"] = ip
		c.JSON(http.StatusOK, result)

	case "url":
		url := strings.TrimSpace(req.Value)
		if !strings.HasPrefix(url, "http") {
			url = "http://" + url
		}

		c.JSON(http.StatusOK, gin.H{
			"type":    "url",
			"url":     url,
			"verdict": "unknown",
			"message": "URL reputation check not implemented (requires paid API)",
		})

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid type. Use: hash, ip, url"})
	}
}

func GetThreatIntel(c *gin.Context) {
	threatType := c.Query("type")
	value := c.Query("value")

	if threatType == "" || value == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing type or value query params"})
		return
	}

	req := ThreatCheckRequest{Type: threatType, Value: value}
	c.Set("threat_request", req)
	ThreatCheck(c)
}
