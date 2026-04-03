# CyberSimulator API

Educational cybersecurity simulator API.

## Base URL

```
http://localhost:8001
```

## Endpoints

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "ok"
}
```

### Scenarios

```
GET /api/v1/scenarios
```

Response:
```json
{
  "scenarios": [
    {
      "id": "office",
      "title": "🏢 Офис",
      "description": "Рабочий день в офисе...",
      "environment": "office",
      "threat_type": "phishing",
      "threat_level": "medium"
    }
  ]
}
```

### Scenario by ID

```
GET /api/v1/scenarios/:id
```

Parameters:
- `id` - Scenario ID (office, home, public)

### Scenario Levels

```
GET /api/v1/scenarios/:id/levels
```

Response:
```json
{
  "levels": [
    {
      "id": 1,
      "name": "Утренняя почта",
      "attack": "Фишинг",
      "icon": "📧",
      "difficulty": "Легко"
    }
  ]
}
```

### Level by ID

```
GET /api/v1/scenarios/:id/levels/:levelId
```

Parameters:
- `id` - Scenario ID
- `levelId` - Level number (1, 2, 3)

Response:
```json
{
  "id": 1,
  "name": "Утренняя почта",
  "attack": "Фишинг",
  "icon": "📧",
  "sandbox": "email-client",
  "port": 8082
}
```

### Attack Types

```
GET /api/v1/attacks
```

Response:
```json
{
  "attacks": [
    {
      "id": "phishing",
      "name": "Фишинг",
      "icon": "🎣",
      "description": "Поддельные письма и сайты...",
      "cwe": ["CWE-20", "CWE-287"]
    }
  ]
}
```

### Security Tips

```
GET /api/v1/tips
```

Response:
```json
{
  "tips": [
    {
      "category": "phishing",
      "tips": [
        "Проверяйте адрес отправителя",
        "Не переходите по ссылкам из писем"
      ]
    }
  ]
}
```

## Sandbox Ports

| Sandbox | Port | Description |
|---------|------|-------------|
| phishing | 8081 | Bank phishing simulation |
| email-client | 8082 | Email client simulation |
| wifi-hotspot | 8083 | Public WiFi simulation |
| social-network | 8084 | Social network simulation |
| atm-simulator | 8085 | ATM skimming simulation |

## Threat Types (CWE)

- **CWE-20**: Improper Input Validation
- **CWE-287**: Improper Authentication
- **CWE-306**: Missing Authentication for Critical Function
- **CWE-311**: Encryption Missing
- **CWE-312**: Cleartext Storage of Sensitive Information
- **CWE-307**: Improper Restriction of Excessive Authentication Attempts
- **CWE-521**: Weak Password Requirements
- **CWE-94**: Code Injection
- **CWE-506**: Embedded Malicious Code
- **CWE-862**: Missing Authorization
