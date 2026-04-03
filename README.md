# CyberSimulator

Интерактивный веб-симулятор для повышения цифровой грамотности и безопасности.

## Описание

Проект разработан для обучения пользователей распознаванию киберугроз в повседневных цифровых средах. Пользователь попадает в симулированную среду, где сталкивается с реальными сценариями кибератак. Задача — идентифицировать угрозу и применить правильный алгоритм защиты.

## Технологический стек

- **Frontend**: Next.js 14, React, Tailwind CSS, TypeScript
- **Backend**: Go 1.23, Gin
- **Database**: PostgreSQL, Redis
- **Container**: Docker, Docker Compose

## Структура проекта

```
├── docker-compose.yml     # Конфигурация Docker Compose
├── backend/               # Go backend
│   ├── cmd/               # Точка входа
│   ├── internal/
│   │   ├── api/           # API handlers
│   │   └── models/        # Модели данных
│   └── Dockerfile
├── frontend/              # Next.js frontend
│   ├── app/
│   │   ├── page.tsx       # Главная страница
│   │   ├── email/         # Симулятор почты
│   │   └── social/        # Симулятор соцсетей
│   └── Dockerfile
└── .env.example           # Пример переменных окружения
```

## Быстрый старт

### Требования

- Docker
- Docker Compose

### Запуск

```bash
docker-compose up -d --build
```

### Доступ

- Frontend: http://localhost:3000
- Backend API: http://localhost:8001

## API Endpoints

`GET /` -  Проверка работы API 
`GET /health` - Health check 
`GET /api/scenarios` - Список всех сценариев 
`GET /api/scenarios/:env` - Сценарии по среде 
`GET /api/email/inbox` - Симулятор почты 
`GET /api/social/feed` - Симулятор соцсетей 

## Среды симуляции

1. **Симулятор почты** — обнаружение фишинговых писем и вредоносных вложений
2. **Социальные сети** — распознавание мошеннических сообщений и фейковых профилей
3. **Браузер** (не сделафф) — фишинговые сайты и поддельные формы ввода

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

## Лицензия

MIT
