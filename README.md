# CyberSimulator

Интерактивный веб-симулятор для повышения цифровой грамотности и безопасности.

## Описание

Проект разработан для обучения пользователей распознаванию киберугроз в повседневных цифровых средах. Пользователь попадает в симулированную среду, где сталкивается с реальными сценариями кибератак. Задача — идентифицировать угрозу и применить правильный алгоритм защиты.

### Особенности

- 📚 Теория перед каждым заданием
- 🎮 Интерактивные песочницы в отдельных Docker-контейнерах
- 🎯 Динамические сценарии (управляются через админку)
- 🛡️ 6 типов угроз (фишинг, социальная инженерия, скимминг и др.)
- 📊 Статистика прогресса пользователей
- 👥 Система ролей (USER, ADMIN)
- 🔐 JWT-аутентификация
- ⚙️ Динамическое управление сценариями через админ-панель

## Технологический стек

- **Frontend**: Next.js 14, React, Tailwind CSS, TypeScript
- **Backend Go**: Go 1.25, Gin, GORM, PostgreSQL
- **Backend Java**: Spring Boot 4, JWT, PostgreSQL
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Sandbox**: Docker, Nginx
- **Container**: Docker Compose

## Структура проекта

```
├── docker-compose.yml          # Основной compose файл
├── backend/                   # Go API (сценарии, уровни)
│   ├── cmd/main.go            # Точка входа
│   └── internal/
│       ├── api/handler.go      # API endpoints
│       └── models/models.go   # Модели данных (GORM)
├── backendJava/              # Java API (аутентификация)
│   └── src/main/java/
│       └── com/beatrice/backendjava/
│           ├── auth/          # JWT аутентификация
│           ├── user/          # Пользователи, роли
│           ├── stats/         # Статистика прогресса
│           └── admin/         # Управление
├── frontend/                 # Next.js приложение
│   ├── app/
│   │   ├── page.tsx          # Главная
│   │   ├── scenarios/         # Сценарии
│   │   ├── stats/            # Статистика
│   │   ├── profile/         # Профиль пользователя
│   │   ├── admin/           # Админ-панель
│   │   │   ├── page.tsx     # Управление пользователями
│   │   │   └── scenarios/   # Управление сценариями
│   │   └── (auth)/          # Страницы входа
│   └── Dockerfile
└── sandbox/                 # Песочницы
    ├── phishing/              # Симуляция фишинга
    ├── email-client/          # Email клиент
    ├── wifi-hotspot/          # Wi-Fi атаки
    ├── social-network/        # Социальные сети
    └── atm-simulator/         # Банкоматы
```

## Быстрый старт

### Требования

- Docker 20.10+
- Docker Compose 2.0+

### Запуск

```bash
sudo docker-compose up -d --build
```

### Доступ

| Сервис | URL | Описание |
|--------|-----|---------|
| Frontend | http://localhost:3001 | Основной интерфейс |
| Go API | http://localhost:8010 | API сценариев и уровней |
| Java API | http://localhost:8080 | API аутентификации |
| Admin | admin@cybersim.ru / admin123 | Админ-панель |

### Песочницы (постоянно запущены)

| Песочница | URL |
|-----------|-----|
| Phishing | http://localhost:9081 |
| Email Client | http://localhost:9082 |
| Wi-Fi Hotspot | http://localhost:9083 |
| Social Network | http://localhost:9084 |
| ATM Simulator | http://localhost:9085 |

## Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │  Users   │  │ Scenarios│  │  Stats   │  │ Admin │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬───┘ │
└───────┼──────────────┼──────────────┼──────────────┼────┘
        │              │              │              │
        ▼              │              │              │
┌───────────────┐      │              │              │
│  Java API     │      │              │              │
│  (Auth/JWT)  │      │              │              │
│  :8080        │      │              │              │
└───────┬───────┘      │              │              │
        │              │              │              │
        ▼              ▼              │              │
┌─────────────────┐ ┌──────────┐      │              │
│ PostgreSQL Java │ │ Redis    │      │              │
│ (users, roles,  │ │ (JWT)    │      │              │
│  stats)         │ └──────────┘      │              │
└─────────────────┘                   │              │
                                     ▼              │
                           ┌──────────────────┐    │
                           │     Go API        │    │
                           │  (Scenarios)      │    │
                           │     :8010         │    │
                           └────────┬───────────┘    │
                                    │                │
                                    ▼                │
                           ┌──────────────────┐      │
                           │ PostgreSQL Go     │      │
                           │ (scenarios,       │◄─────┘
                           │  levels)          │   (CRUD)
                           └──────────────────┘
```

## API Endpoints

### Go API (сценарии и уровни)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/scenarios` | Все сценарии |
| GET | `/api/v1/scenarios/:id` | Сценарий по ID |
| POST | `/api/v1/scenarios` | Создать сценарий |
| PUT | `/api/v1/scenarios/:id` | Обновить сценарий |
| DELETE | `/api/v1/scenarios/:id` | Удалить сценарий |
| GET | `/api/v1/scenarios/:id/levels` | Уровни сценария |
| GET | `/api/v1/levels/:id` | Уровень по ID |
| POST | `/api/v1/levels` | Создать уровень |
| PUT | `/api/v1/levels/:id` | Обновить уровень |
| DELETE | `/api/v1/levels/:id` | Удалить уровень |
| GET | `/api/v1/attacks` | Типы атак |
| GET | `/api/v1/tips` | Советы по безопасности |

### Java API (аутентификация и пользователи)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| POST | `/api/auth/logout` | Выход |
| POST | `/api/auth/refresh` | Обновить токен |
| GET | `/api/users/whoami` | Текущий пользователь |
| GET | `/api/users/profile` | Профиль |
| PUT | `/api/users/profile` | Обновить профиль |
| GET | `/api/stats/me` | Статистика пользователя |
| POST | `/api/stats/complete` | Записать прохождение |

### Java API (админ)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Все пользователи |
| DELETE | `/api/admin/users/:id` | Удалить пользователя |
| POST | `/api/admin/users/:id/roles` | Изменить роли |
| GET | `/api/stats/admin/all` | Статистика всех |

## Роли и права

### USER
- Прохождение сценариев и уровней
- Просмотр своей статистики
- Редактирование профиля

### ADMIN
- Всё что у USER
- Управление пользователями (удаление, роли)
- Управление сценариями и уровнями
- Просмотр статистики всех пользователей

## Разработка

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend Go

```bash
cd backend
go mod tidy
go run cmd/main.go
```

### Backend Java (в Docker)

Java бэкенд собирается внутри Docker при `docker-compose up --build`

## Типы угроз (CWE)

| ID | Тип | CWE |
|----|-----|-----|
| phishing | Фишинг | CWE-20, CWE-287 |
| social_engineering | Социальная инженерия | CWE-306, CWE-862 |
| evil_twin | Злой двойник | CWE-311 |
| skimming | Скимминг | CWE-312 |
| password | Подбор пароля | CWE-307, CWE-521 |
| malware | Вредоносное ПО | CWE-94, CWE-506 |

## Безопасность

> ⚠️ Все угрозы в симуляторе смоделированы. Никакие реальные вредоносные файлы не используются.

## Лицензия

MIT
