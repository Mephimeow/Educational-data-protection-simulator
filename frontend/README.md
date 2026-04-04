# Frontend

Next.js приложение для CyberSimulator.

## Описание

Фронтенд предоставляет:
- Интерфейс обучения с интерактивными песочницами
- Систему аутентификации
- Админ-панель для управления
- Статистику прогресса

## Технологии

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- fetch API для коммуникации с бэкендами

## Структура

```
frontend/
├── app/
│   ├── layout.tsx          # Корневой layout с AuthProvider
│   ├── page.tsx           # Главная страница
│   ├── globals.css        # Глобальные стили
│   ├── scenarios/         # Страницы сценариев
│   │   ├── page.tsx       # Список сценариев
│   │   ├── [id]/          # Динамические маршруты
│   │   │   ├── page.tsx   # Детали сценария
│   │   │   └── [level]/
│   │   │       └── page.tsx  # Уровень с песочницей
│   ├── stats/             # Статистика пользователя
│   ├── profile/           # Профиль пользователя
│   ├── admin/             # Админ-панель
│   │   ├── page.tsx       # Управление пользователями
│   │   └── scenarios/     # Управление сценариями
│   ├── (auth)/            # Страницы аутентификации
│   │   ├── login/
│   │   └── register/
│   └── lib/
│       ├── auth.ts        # AuthService, типы
│       └── AuthContext.tsx # React Context для auth
└── Dockerfile
```

## Запуск

### Локально

```bash
cd frontend
npm install
npm run dev
```

Приложение будет доступно на http://localhost:3000

### Через Docker

```bash
docker-compose up -d frontend
```

## Переменные окружения

При сборке Docker образа используются build args:

| Переменная | По умолчанию | Описание |
|-----------|---------------|---------|
| NEXT_PUBLIC_API_URL | http://localhost:8010 | URL Go API |
| NEXT_PUBLIC_AUTH_API_URL | http://localhost:8080 | URL Java API |

## Страницы

### Публичные
- `/` - Главная страница
- `/scenarios` - Каталог сценариев
- `/scenarios/[id]` - Детали сценария
- `/scenarios/[id]/[level]` - Уровень с теорией и песочницей
- `/about` - О проекте

### Требуют авторизации
- `/login` - Вход
- `/register` - Регистрация
- `/profile` - Профиль пользователя
- `/stats` - Статистика прогресса

### Только для админов
- `/admin` - Управление пользователями
- `/admin/scenarios` - Управление сценариями и уровнями

## Auth Flow

1. Пользователь входит через `/api/auth/login` (Java backend)
2. Получает access token + refresh cookie
3. Access token хранится в localStorage
4. При запросах отправляется в заголовке `Authorization: Bearer <token>`
5. Refresh автоматически при истечении токена

## API Integrations

### Go API (NEXT_PUBLIC_API_URL)
- Загрузка сценариев и уровней
- CRUD операции для админов

### Java API (NEXT_PUBLIC_AUTH_API_URL)
- Аутентификация
- Управление профилем
- Статистика

## Стилизация

Используется Tailwind CSS с кастомной цветовой схемой:
- Primary: cyan-500
- Background: slate-900/slate-800
- Text: white/slate-300/slate-400
