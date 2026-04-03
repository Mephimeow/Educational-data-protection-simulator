# CyberSimulator

Интерактивный веб-симулятор для повышения цифровой грамотности и безопасности.

## Описание

Проект разработан для обучения пользователей распознаванию киберугроз в повседневных цифровых средах. Пользователь попадает в симулированную среду, где сталкивается с реальными сценариями кибератак. Задача — идентифицировать угрозу и применить правильный алгоритм защиты.

### Особенности

- 📚 Теория перед каждым заданием
- 🎮 Интерактивные песочницы в отдельных Docker-контейнерах
- 🎯 3 нарративных сценария (Офис, Дом, Общественный Wi-Fi)
- 🛡️ 6 типов угроз (фишинг, социальная инженерия, скимминг и др.)
- 📊 Статистика прогресса

## Технологический стек

- **Frontend**: Next.js 14, React, Tailwind CSS, TypeScript
- **Backend**: Go 1.25, Gin
- **Database**: PostgreSQL, Redis
- **Sandbox**: Docker, Nginx
- **Container**: Docker Compose

## Структура проекта

```
├── docker-compose.yml          # Production (с песочницами)
├── docker-compose.dev.yml      # Development (frontend + backend)
├── backend/
│   ├── cmd/main.go            # Точка входа
│   ├── internal/
│   │   ├── api/handler.go     # API endpoints
│   │   └── models/models.go   # Модели данных
│   └── docs/
│       ├── API.md             # Документация API
│       └── openapi.yaml       # OpenAPI спецификация
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Главная
│   │   ├── scenarios/         # Сценарии
│   │   ├── stats/             # Статистика
│   │   └── about/             # О проекте
│   └── Dockerfile
├── sandbox/                    # Песочницы
│   ├── phishing/              # Симуляция фишинга
│   ├── email-client/          # Email клиент
│   ├── wifi-hotspot/          # Wi-Fi атаки
│   ├── social-network/       # Социальные сети
│   └── atm-simulator/         # Банкоматы
└── docs/
    └── ER_DIAGRAM.md          # ER-диаграмма БД
```

## Быстрый старт

### Требования

- Docker 20.10+
- Docker Compose 2.0+

### Development (frontend + backend)

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

### Production (с песочницами)

```bash
docker-compose up -d --build
```

### Доступ

- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- Песочницы:
  - phishing: http://localhost:8081
  - email-client: http://localhost:8082
  - wifi-hotspot: http://localhost:8083
  - social-network: http://localhost:8084
  - atm-simulator: http://localhost:8085

## Разработка

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
go mod tidy
go run cmd/main.go
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/scenarios` | Все сценарии |
| GET | `/api/v1/scenarios/:id` | Сценарий по ID |
| GET | `/api/v1/scenarios/:id/levels` | Уровни сценария |
| GET | `/api/v1/scenarios/:id/levels/:levelId` | Детали уровня |
| GET | `/api/v1/attacks` | Типы атак |
| GET | `/api/v1/tips` | Советы по безопасности |

## Сценарии и уровни

### 🏢 Офис

1. Утренняя почта — Фишинг
2. USB-флешка — Вредоносное ПО
3. Звонок IT-поддержки — Социальная инженерия

### 🏠 Дом

1. Письмо из банка — Фишинг
2. Сильный пароль — Безопасность паролей
3. Обновление системы — Социальная инженерия

### 📶 Общественный Wi-Fi

1. Выбор сети — Evil Twin
2. Банкомат — Скимминг
3. Работа в кафе — Перехват данных

## Типы угроз (CWE)

| ID | Тип | CWE |
|----|-----|-----|
| phishing | Фишинг | CWE-20, CWE-287 |
| social_engineering | Социальная инженерия | CWE-306, CWE-862 |
| evil_twin | Злой двойник | CWE-311 |
| skimming | Скимминг | CWE-312 |
| password | Подбор пароля | CWE-307, CWE-521 |
| malware | Вредоносное ПО | CWE-94, CWE-506 |

## Документация

- [API Documentation](./backend/docs/API.md)
- [OpenAPI Spec](./backend/docs/openapi.yaml)
- [ER Diagram](./docs/ER_DIAGRAM.md)

## Безопасность

> ⚠️ Все угрозы в симуляторе смоделированы. Никакие реальные вредоносные файлы не используются.

## Лицензия

MIT
