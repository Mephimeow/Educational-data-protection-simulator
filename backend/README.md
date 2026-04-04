# Go Backend API

API для управления сценариями и уровнями обучения.

## Описание

Go бэкенд предоставляет REST API для:
- CRUD операций над сценариями
- CRUD операций над уровнями
- Информации о типах атак
- Советов по безопасности

## Технологии

- Go 1.25
- Gin (HTTP фреймворк)
- GORM (ORM для PostgreSQL)
- PostgreSQL

## Структура

```
backend/
├── cmd/main.go           # Точка входа
├── internal/
│   ├── api/
│   │   ├── handler.go    # HTTP handlers
│   │   └── sandbox.go    # Sandbox endpoints
│   └── models/
│       └── models.go      # GORM модели
├── docs/                 # Документация
└── Dockerfile
```

## Запуск

### Локально

```bash
go mod tidy
go run cmd/main.go
```

### Через Docker

```bash
docker-compose up -d backend_go
```

## Переменные окружения

| Переменная | По умолчанию | Описание |
|-----------|---------------|---------|
| PORT | 8000 | Порт сервера |
| DB_HOST | postgres | Хост PostgreSQL |
| DB_USER | cyberuser | Пользователь БД |
| DB_PASSWORD | cyberpass | Пароль БД |
| DB_NAME | cyberdb | Имя базы данных |
| DB_PORT | 5432 | Порт PostgreSQL |

## API Endpoints

### Сценарии

```
GET    /api/v1/scenarios
GET    /api/v1/scenarios/:id
POST   /api/v1/scenarios
PUT    /api/v1/scenarios/:id
DELETE /api/v1/scenarios/:id
```

### Уровни

```
GET    /api/v1/scenarios/:id/levels
GET    /api/v1/levels/:id
POST   /api/v1/levels
PUT    /api/v1/levels/:id
DELETE /api/v1/levels/:id
```

### Прочее

```
GET /health
GET /api/v1/attacks
GET /api/v1/tips
GET /api/v1/sandbox/list
```

## Модели данных

### Scenario
- `id` (string, PK) - slug сценария
- `title` (string) - название с иконкой
- `description` (string) - описание
- `icon` (string) - эмодзи иконка
- `color` (string) - цвет темы
- `threat_type` (string) - тип угрозы
- `threat_level` (string) - уровень угрозы

### Level
- `id` (uint, PK) - автоинкремент
- `scenario_id` (string, FK) - ссылка на сценарий
- `name` (string) - название уровня
- `attack` (string) - тип атаки
- `icon` (string) - эмодзи иконка
- `difficulty` (string) - сложность
- `theory` (text) - HTML теория
- `action` (string) - задание
- `correct_action` (string) - правильное решение
- `sandbox` (string) - имя песочницы
- `sandbox_port` (int) - порт песочницы
- `order` (int) - порядок уровня
