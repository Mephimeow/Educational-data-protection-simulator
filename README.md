# Educational Cybersecurity Simulator

## Реализованная функциональность

- Интерактивные сценарии кибербезопасности с уровнями сложности
- Песочницы (sandbox) для практики в безопасной среде
- Система геймификации: XP, достижения, таблица лидеров
- Регистрация и аутентификация пользователей с JWT
- Админ-панель для управления пользователями
- Real-time статистика и мониторинг
- WebSocket для уведомлений
- Кэширование с Redis
- Rate limiting для защиты API
- Интеграция с внешними API (VirusTotal, Shodan)
- Тёмная и светлая темы

## Особенность проекта в следующем

- 7 сценариев с 15+ уровнями для изучения различных типов угроз
- Изолированные sandbox-окружения на базе Docker/nginx
- Геймификация с достижениями, сериями (streak) и XP
- Встроенный мониторинг через Prometheus и Grafana
- Анализ угроз через VirusTotal и Shodan API

## Основной стек технологий

- **Backend:** Go (Gin), PostgreSQL, Redis
- **Frontend:** React (Next.js), TypeScript, Tailwind CSS
- **Мониторинг:** Prometheus, Grafana
- **Контейнеризация:** Docker, Docker Compose
- **API:** REST, WebSocket

## Демо

Демо сервиса доступно по адресу: http://localhost:3001

Реквизиты тестового пользователя: email: testuser@test.ru, пароль: testuser

Реквизиты администратора: email: admin@cyber.ru, пароль: admin123

## Среда запуска

- Требуется установленный Docker и Docker Compose
- Требуется минимум 4GB RAM
- Порт 3001 (frontend), 8000 (backend), 5433 (postgres), 6379 (redis), 3002 (grafana), 9091 (prometheus)

## Установка

### Клонирование репозитория

```bash
git clone https://github.com/your-repo/educational-cybersecurity-simulator
cd educational-cybersecurity-simulator
```

### Запуск через Docker Compose

```bash
docker-compose up -d --build
```

### Проверка статуса

```bash
docker-compose ps
```

Сервисы будут доступны по адресам:

- Frontend: http://localhost:3001
- Backend API: http://localhost:8000
- Swagger: http://localhost:8000/swagger/index.html
- Grafana: http://localhost:3002 (логин: admin, пароль: admin)
- Prometheus: http://localhost:9091

### Остановка

```bash
docker-compose down
```

## База данных

База данных создаётся автоматически при первом запуске через GORM миграции. Тестовые данные (сценарии, уровни, достижения, fake-пользователи) загружаются автоматически.

## Доступные сценарии

1. Офис (Office) - фишинг, USB-угрозы, социальная инженерия
2. Дом (Home) - безопасность паролей, удалённая работа
3. Общественный Wi-Fi - атаки "злой двойник", скимминг
4. Хакерская атака - брутфорс, подбор паролей
5. Вредоносное ПО - анализ вирусов, шифровальщики
6. Утечка данных - форензика, расследование инцидентов
7. Умный дом - IoT-безопасность

## Архитектура системы

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│                    (Next.js + React)                        │
│                   http://localhost:3001                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                             │
│                    (Go + Gin)                               │
│                   http://localhost:8000                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │  Postgres│  │   Redis  │  │ WebSocket│  │ Rate Limit  │  │
│  │  :5433   │  │  :6379   │  │          │  │             │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│  Prometheus  │    │   Grafana    │    │  Sandbox Labs    │
│   :9091      │    │    :3002     │    │   :9081-9090     │
└──────────────┘    └──────────────┘    └──────────────────┘
```

## Схема базы данных

### Таблицы

**users** - Пользователи
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | PK, автоинкремент |
| name | VARCHAR | Имя пользователя |
| email | VARCHAR | Email (уникальный) |
| phone | VARCHAR | Телефон |
| password_hash | VARCHAR | Хэш пароля |
| created_at | TIMESTAMP | Дата создания |

**roles** - Роли
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | PK |
| name | VARCHAR | Название роли (USER, ADMIN) |
| description | VARCHAR | Описание |

**user_roles** - Связь пользователей и ролей
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | PK |
| user_id | INTEGER | FK -> users.id |
| role_id | INTEGER | FK -> roles.id |

**scenarios** - Сценарии
| Поле | Тип | Описание |
|------|-----|----------|
| id | VARCHAR | PK (напр. "office") |
| title | VARCHAR | Название |
| description | TEXT | Описание |
| icon | VARCHAR | Эмодзи |
| color | VARCHAR | Цвет темы |
| threat_type | VARCHAR | Тип угрозы |
| threat_level | VARCHAR | Уровень угрозы |

**levels** - Уровни
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | PK |
| scenario_id | VARCHAR | FK -> scenarios.id |
| name | VARCHAR | Название |
| attack | VARCHAR | Тип атаки |
| difficulty | VARCHAR | Сложность |
| theory | TEXT | Теория (HTML) |
| action | TEXT | Задание |
| correct_action | TEXT | Правильный ответ |
| sandbox | VARCHAR | Название sandbox |
| sandbox_port | INTEGER | Порт sandbox |
| order | INTEGER | Порядок |

**level_progress** - Прогресс пользователей
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | PK |
| user_id | INTEGER | FK -> users.id |
| scenario_id | VARCHAR | FK -> scenarios.id |
| level_id | INTEGER | FK -> levels.id |
| completed | BOOLEAN | Завершён |
| success | BOOLEAN | Успешно |
| completed_at | TIMESTAMP | Дата завершения |

**achievements** - Достижения
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | PK |
| code | VARCHAR | Уникальный код |
| name | VARCHAR | Название |
| description | TEXT | Описание |
| icon | VARCHAR | Эмодзи |
| xp_reward | INTEGER | Награда XP |
| required | INTEGER | Требование |
| type | VARCHAR | Тип |

**user_achievements** - Достижения пользователей
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | PK |
| user_id | INTEGER | FK -> users.id |
| achievement_id | INTEGER | FK -> achievements.id |
| unlocked_at | TIMESTAMP | Дата получения |

**user_stats** - Статистика пользователей
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | PK |
| user_id | INTEGER | FK -> users.id (уникальный) |
| xp | INTEGER | Опыт |
| level | INTEGER | Уровень |
| completed_tasks | INTEGER | Завершено задач |
| total_time | INTEGER | Всего времени (сек) |
| streak | INTEGER | Серия дней |
| last_active | DATE | Последняя активность |

**refresh_tokens** - Токены обновления
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | PK |
| user_id | INTEGER | FK -> users.id |
| token | VARCHAR | Токен (уникальный) |
| expires_at | TIMESTAMP | Срок действия |
| created_at | TIMESTAMP | Дата создания |

## Разработчики

Зубов Юрий - Fullstack Dev
Мосин Илья - Frontend Dev
Зинько Егор - Backend Dev

## ERD Диаграмма

```
┌─────────────────┐       ┌─────────────────┐
│     roles       │       │   scenarios     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ title           │
│ description     │       │ description     │
└────────┬────────┘       │ icon            │
         │                │ color           │
         │                │ threat_type     │
         │                │ threat_level    │
         │                └───────┬─────────┘
         │                        │
         │                ┌───────▼─────────┐
┌────────▼────────┐       │     levels      │
│   user_roles    │       ├─────────────────┤
├─────────────────┤       │ id (PK)         │
│ id (PK)         │       │ scenario_id(FK) │
│ user_id (FK)    │◄───── │ name            │
│ role_id (FK)────┼─────► │ attack          │
└────────┬────────┘       │ difficulty      │
         │                │ theory          │
         │                │ action          │
         │                │ sandbox         │
┌────────▼────────┐       │ sandbox_port    │
│     users       │       │ order           │
├─────────────────┤       └────────┬────────┘
│ id (PK)         │                │
│ name            │        ┌───────▼─────────┐
│ email           │        │ level_progress  │
│ phone           │        ├─────────────────┤
│ password_hash   │        │ id (PK)         │
│ created_at      │        │ user_id (FK)    │
└────────┬────────┘        │ scenario_id(FK) │
         │                 │ level_id (FK)   │
         │                 │ completed       │
         │                 │ success         │
         │                 │ completed_at    │
         │                 └─────────────────┘
┌────────▼───────────────────────────────────────────────────────┐
│                      user_stats                                │
├────────────────────────────────────────────────────────────────┤
│ id (PK)                                                        │
│ user_id (FK) ─────────────────────────────────────────────────►│
│ xp                                                             │
│ level                                                          │
│ completed_tasks                                                │
│ total_time                                                     │
│ streak                                                         │
│ last_active                                                    │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────┐     ┌─────────────────────┐
│    achievements     │     │  user_achievements  │
├─────────────────────┤     ├─────────────────────┤
│ id (PK)             │     │ id (PK)             │
│ code                │     │ user_id (FK)        │
│ name                │◄────│ achievement_id (FK) │
│ description         │     │ unlocked_at         │
│ icon                │     └─────────────────────┘
│ xp_reward           │
│ required            │
│ type                │
└─────────────────────┘

┌─────────────────────┐
│   refresh_tokens    │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ token               │
│ expires_at          │
│ created_at          │
└─────────────────────┘
```

