package models

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		getEnv("DB_HOST", "postgres"),
		getEnv("DB_USER", getEnv("DB_USER", "cyberuser")),
		getEnv("DB_PASSWORD", getEnv("DB_PASSWORD", "cyberpass")),
		getEnv("DB_NAME", getEnv("DB_NAME", "cyberdb")),
		getEnv("DB_PORT", "5432"),
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	err = DB.AutoMigrate(
		&Scenario{},
		&Level{},
		&User{},
		&Role{},
		&UserRole{},
		&LevelProgress{},
		&RefreshToken{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	seedData()
	seedRoles()

	log.Println("Database connected and migrated successfully")
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
	PasswordAttack    ThreatType = "password_attack"
	Ransomware        ThreatType = "ransomware"
	IoTAttack         ThreatType = "iot_attack"
)

var (
	containerPorts = map[string]int{
		"phishing":       9081,
		"email-client":   9082,
		"wifi-hotspot":   9083,
		"social-network": 9084,
		"atm-simulator":  9085,
		"password-crack": 9086,
		"malware-scan":   9087,
		"data-leak":      9088,
		"ransomware":     9089,
		"iot-attack":     9090,
	}
)

func GetSandboxPort(name string) int {
	return containerPorts[name]
}

func GetAllSandboxPorts() map[string]int {
	return containerPorts
}

type ThreatLevel string

const (
	Low      ThreatLevel = "low"
	Medium   ThreatLevel = "medium"
	High     ThreatLevel = "high"
	Critical ThreatLevel = "critical"
)

type Scenario struct {
	ID          string      `gorm:"primaryKey" json:"id"`
	Title       string      `json:"title" gorm:"not null"`
	Description string      `json:"description"`
	Icon        string      `json:"icon"`
	Color       string      `json:"color"`
	ThreatType  ThreatType  `json:"threat_type"`
	ThreatLevel ThreatLevel `json:"threat_level"`
	Levels      []Level     `json:"levels,omitempty" gorm:"foreignKey:ScenarioID"`
}

type Level struct {
	ID            uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	ScenarioID    string `json:"scenario_id" gorm:"index"`
	Name          string `json:"name" gorm:"not null"`
	Attack        string `json:"attack"`
	Icon          string `json:"icon"`
	Difficulty    string `json:"difficulty"`
	Theory        string `json:"theory" gorm:"type:text"`
	Action        string `json:"action"`
	CorrectAction string `json:"correct_action"`
	Sandbox       string `json:"sandbox"`
	SandboxPort   int    `json:"sandbox_port"`
	Order         int    `json:"order"`
}

func seedData() {
	var count int64
	DB.Model(&Scenario{}).Count(&count)
	if count > 0 {
		return
	}

	// ============================================================
	// КОНФИГУРАЦИЯ СЦЕНАРИЕВ И УРОВНЕЙ
	// ============================================================
	// Для добавления нового сценария - скопируйте блок Scenario и добавьте Levels
	// Для добавления уровня - создайте новый Level с уникальным Order в рамках сценария
	// Всего доступно sandbox'ов: phishing(9081), email-client(9082), wifi-hotspot(9083), social-network(9084), atm-simulator(9085)
	// ============================================================

	scenarios := []Scenario{
		// ==================== СЦЕНАРИЙ: ОФИС ====================
		Scenario{
			ID:          "office",
			Title:       "🏢 Офис",
			Description: "Рабочий день в офисе. Фишинговые письма, подозрительные USB-накопители, социальная инженерия.",
			Icon:        "🏢",
			Color:       "blue",
			ThreatType:  Phishing,
			ThreatLevel: Medium,
		},
		// ==================== СЦЕНАРИЙ: ДОМ ====================
		Scenario{
			ID:          "home",
			Title:       "🏠 Дом",
			Description: "Удалённая работа. Безопасность домашней сети, пароли, фишинг в мессенджерах.",
			Icon:        "🏠",
			Color:       "green",
			ThreatType:  SocialEngineering,
			ThreatLevel: Medium,
		},
		// ==================== СЦЕНАРИЙ: PUBLIC ====================
		Scenario{
			ID:          "public",
			Title:       "📶 Общественный Wi-Fi",
			Description: "Кафе и общественные места. Атаки \"злой двойник\", перехват трафика, скимминг.",
			Icon:        "📶",
			Color:       "purple",
			ThreatType:  Malware,
			ThreatLevel: High,
		},
		// ==================== СЦЕНАРИЙ: ХАКЕР ====================
		Scenario{
			ID:          "hacker",
			Title:       "💻 Хакерская атака",
			Description: "Атаки на пароли. Брутфорс, словарные атаки, взлом учётных записей.",
			Icon:        "💻",
			Color:       "red",
			ThreatType:  PasswordAttack,
			ThreatLevel: High,
		},
		// ==================== СЦЕНАРИЙ: ВИРУС ====================
		Scenario{
			ID:          "malware",
			Title:       "🦠 Вредоносное ПО",
			Description: "Вирусы, трояны, шифровальщики. Анализ и защита от вредоносного ПО.",
			Icon:        "🦠",
			Color:       "orange",
			ThreatType:  Malware,
			ThreatLevel: Critical,
		},
		// ==================== СЦЕНАРИЙ: УТЕЧКА ====================
		Scenario{
			ID:          "leak",
			Title:       "🔓 Утечка данных",
			Description: "Расследование утечек данных. Форензика, обнаружение и предотвращение.",
			Icon:        "🔓",
			Color:       "pink",
			ThreatType:  DataLeak,
			ThreatLevel: Critical,
		},
		// ==================== СЦЕНАРИЙ: IoT ====================
		Scenario{
			ID:          "iot",
			Title:       "🏠 Умный дом",
			Description: "Безопасность IoT-устройств. Защита умного дома от хакерских атак.",
			Icon:        "🏠",
			Color:       "cyan",
			ThreatType:  IoTAttack,
			ThreatLevel: High,
		},
	}

	for _, s := range scenarios {
		DB.Create(&s)
	}

	levels := []Level{
		// ============================================================
		// УРОВНИ СЦЕНАРИЯ "office"
		// Sandbox: email-client(9082), phishing(9081), social-network(9084)
		// ============================================================
		Level{
			ScenarioID:    "office",
			Name:          "Утренняя почта",
			Attack:        "Фишинг",
			Icon:          "📧",
			Difficulty:    "Легко",
			Order:         1,
			Sandbox:       "email-client",
			SandboxPort:   9082,
			Theory:        "<h3>📧 Что такое фишинг?</h3><p>Фишинг — это вид социальной инженерии, при котором злоумышленники выдают себя за надёжные источники для кражи личных данных.</p><h4>🔍 Признаки фишингового письма:</h4><ul><li><strong>Подозрительный отправитель</strong> — адрес не соответствует официальному домену</li><li><strong>Срочность</strong> — \"Срочно!\", \"Немедленно!\"</li><li><strong>Общие обращения</strong> — \"Уважаемый клиент\"</li></ul><h4>✅ Что делать:</h4><ul><li>Проверяйте адрес отправителя</li><li>Не переходите по ссылкам из писем</li></ul>",
			Action:        "Проверьте входящие письма и определите фишинговые",
			CorrectAction: "Удалить подозрительные письма, не переходить по ссылкам",
		},
		Level{
			ScenarioID:    "office",
			Name:          "USB-флешка",
			Attack:        "Вредоносное ПО",
			Icon:          "💾",
			Difficulty:    "Средне",
			Order:         2,
			Sandbox:       "phishing",
			SandboxPort:   9081,
			Theory:        "<h3>💾 Опасность USB-устройств</h3><p>USB-накопители могут содержать вредоносное ПО.</p><h4>⚠️ Типы угроз:</h4><ul><li><strong>BadUSB</strong> — перепрограммированная флешка</li><li><strong>Autorun-вирусы</strong> — автоматически запускаются</li><li><strong>Шпионское ПО</strong> — крадут файлы</li></ul><h4>✅ Как защититься:</h4><ul><li>Никогда не подключайте найденные USB</li><li>Отключите автозапуск</li></ul>",
			Action:        "Вам оставили USB-флешку на столе. Что делать?",
			CorrectAction: "Не подключать к компьютеру, сдать в IT-отдел",
		},
		Level{
			ScenarioID:    "office",
			Name:          "Звонок IT-поддержки",
			Attack:        "Социальная инженерия",
			Icon:          "📞",
			Difficulty:    "Средне",
			Order:         3,
			Sandbox:       "social-network",
			SandboxPort:   9084,
			Theory:        "<h3>📞 Социальная инженерия по телефону</h3><p>Злоумышленники представляются сотрудниками поддержки.</p><h4>🎭 Распространённые сценарии:</h4><ul><li>\"Ваш компьютер заражён\"</li><li>\"Мы из службы безопасности\"</li><li>\"Вы выиграли приз\"</li></ul><h4>✅ Правила:</h4><ul><li>Никогда не сообщайте пароли</li><li>Не позволяйте удалённый доступ</li></ul>",
			Action:        "Вам звонит \"сотрудник IT\" и просит пароль",
			CorrectAction: "Отказать, перезвонить в IT-отдел по официальному номеру",
		},

		// ============================================================
		// УРОВНИ СЦЕНАРИЯ "home"
		// Sandbox: phishing(9081), email-client(9082)
		// ============================================================
		Level{
			ScenarioID:    "home",
			Name:          "Письмо из банка",
			Attack:        "Фишинг",
			Icon:          "🏦",
			Difficulty:    "Легко",
			Order:         1,
			Sandbox:       "phishing",
			SandboxPort:   9081,
			Theory:        "<h3>🏦 Банковский фишинг</h3><p>Мошенники притворяются банками.</p><h4>🚩 Красные флаги:</h4><ul><li>Запрос полных данных карты</li><li>Угрозы блокировки</li><li>Ссылка на поддельный сайт</li></ul><h4>✅ Проверяйте:</h4><ul><li>Официальный домен банка</li><li>Наличие HTTPS</li></ul>",
			Action:        "Проверьте интернет-банк на подлинность",
			CorrectAction: "Распознать поддельный сайт и не вводить данные",
		},
		Level{
			ScenarioID:    "home",
			Name:          "Сильный пароль",
			Attack:        "Безопасность паролей",
			Icon:          "🔐",
			Difficulty:    "Легко",
			Order:         2,
			Sandbox:       "phishing",
			SandboxPort:   9081,
			Theory:        "<h3>🔐 Создание надёжных паролей</h3><p>Слабые пароли — главная причина взломов.</p><h4>❌ Плохие пароли:</h4><ul><li>123456, password, qwerty</li><li>Даты рождения, имена</li><li>Одно слово</li></ul><h4>✅ Хорошие пароли:</h4><ul><li>Длина от 12 символов</li><li>Менеджер паролей</li><li>Двухфакторная аутентификация</li></ul>",
			Action:        "Создайте новый пароль для аккаунта",
			CorrectAction: "Использовать менеджер паролей и 2FA",
		},
		Level{
			ScenarioID:    "home",
			Name:          "Обновление системы",
			Attack:        "Социальная инженерия",
			Icon:          "⚙️",
			Difficulty:    "Средне",
			Order:         3,
			Sandbox:       "email-client",
			SandboxPort:   9082,
			Theory:        "<h3>⚙️ Фейковые обновления</h3><p>Мошенники используют поддельные уведомления.</p><h4>🎯 Методы:</h4><ul><li>Фейковые сайты обновлений</li><li>Всплывающие окна</li><li>Email-рассылки</li></ul><h4>✅ Правила:</h4><ul><li>Обновляйтесь только через настройки системы</li><li>Никогда не переходите по ссылкам в письмах</li></ul>",
			Action:        "Найдите подозрительное письмо об обновлении",
			CorrectAction: "Обновляться только через официальные каналы",
		},

		// ============================================================
		// УРОВНИ СЦЕНАРИЯ "public"
		// Sandbox: wifi-hotspot(9083), atm-simulator(9085)
		// ============================================================
		Level{
			ScenarioID:    "public",
			Name:          "Выбор сети",
			Attack:        "Evil Twin",
			Icon:          "📶",
			Difficulty:    "Легко",
			Order:         1,
			Sandbox:       "wifi-hotspot",
			SandboxPort:   9083,
			Theory:        "<h3>👻 Атака \"Злой двойник\" (Evil Twin)</h3><p>Злоумышленник создаёт поддельную точку доступа.</p><h4>⚠️ Как это работает:</h4><ul><li>Сканирование сетей</li><li>Клонирование названия</li><li>Перехват трафика</li></ul><h4>✅ Защита:</h4><ul><li>Уточняйте название у персонала</li><li>Используйте VPN</li></ul>",
			Action:        "Выберите безопасную сеть для подключения",
			CorrectAction: "Подключиться к официальной или защищённой сети",
		},
		Level{
			ScenarioID:    "public",
			Name:          "Банкомат",
			Attack:        "Скимминг",
			Icon:          "🏧",
			Difficulty:    "Средне",
			Order:         2,
			Sandbox:       "atm-simulator",
			SandboxPort:   9085,
			Theory:        "<h3>💳 Скимминг</h3><p>Считывающие устройства на банкоматах.</p><h4>🔍 Как распознать:</h4><ul><li>Накладка на картоприёмник</li><li>Накладка на клавиатуру</li><li>Мини-камера</li></ul><h4>✅ Правила:</h4><ul><li>Используйте банкоматы внутри банков</li><li>Закрывайте клавиатуру рукой</li></ul>",
			Action:        "Проверьте банкомат на наличие скиммера",
			CorrectAction: "Обнаружить и не использовать заражённый банкомат",
		},
		Level{
			ScenarioID:    "public",
			Name:          "Работа в кафе",
			Attack:        "Перехват данных",
			Icon:          "☕",
			Difficulty:    "Средне",
			Order:         3,
			Sandbox:       "wifi-hotspot",
			SandboxPort:   9083,
			Theory:        "<h3>☕ Безопасность в общественных местах</h3><p>Работа с данными требует мер.</p><h4>👀 Визуальное наблюдение:</h4><ul><li>Shoulder surfing</li><li>Отражение в окнах</li></ul><h4>🛡️ Защита:</h4><ul><li>Защитная плёнка</li><li>VPN</li><li>Блокировка компьютера</li></ul>",
			Action:        "Безопасно работайте с конфиденциальными данными",
			CorrectAction: "Использовать VPN и защитную плёнку",
		},

		// ============================================================
		// УРОВНИ СЦЕНАРИЯ "hacker"
		// Sandbox: password-crack(9086)
		// ============================================================
		Level{
			ScenarioID:    "hacker",
			Name:          "Подбор пароля",
			Attack:        "Брутфорс",
			Icon:          "🔓",
			Difficulty:    "Легко",
			Order:         1,
			Sandbox:       "password-crack",
			SandboxPort:   9086,
			Theory:        "<h3>🔓 Брутфорс-атака</h3><p>Метод подбора пароля перебором всех возможных комбинаций.</p><h4>⚠️ Уязвимости:</h4><ul><li>Короткие пароли</li><li>Словарные слова</li><li>Без 2FA</li></ul><h4>✅ Защита:</h4><ul><li>Длинные пароли (16+ символов)</li><li>Ограничение попыток входа</li><li>2FA</li></ul>",
			Action:        "Остановите атаку, выбрав надёжный пароль",
			CorrectAction: "Использовать сложный пароль и 2FA",
		},

		// ============================================================
		// УРОВНИ СЦЕНАРИЯ "malware"
		// Sandbox: malware-scan(9087), ransomware(9089)
		// ============================================================
		Level{
			ScenarioID:    "malware",
			Name:          "Анализ вирусов",
			Attack:        "Вредоносное ПО",
			Icon:          "🔬",
			Difficulty:    "Легко",
			Order:         1,
			Sandbox:       "malware-scan",
			SandboxPort:   9087,
			Theory:        "<h3>🔬 Анализ вредоносного ПО</h3><p>Вредоносное ПО может маскироваться под обычные файлы.</p><h4>🚩 Признаки:</h4><ul><li>Подозрительные расширения (.exe, .bat)</li><li>Необычно большой размер файла</li><li>Запрос прав администратора</li></ul><h4>✅ Защита:</h4><ul><li>Антивирусное ПО</li><li>Не скачивать из неизвестных источников</li></ul>",
			Action:        "Найдите заражённый файл",
			CorrectAction: "Обнаружить и удалить вредоносный файл",
		},
		Level{
			ScenarioID:    "malware",
			Name:          "Шифровальщик",
			Attack:        "Ransomware",
			Icon:          "🔒",
			Difficulty:    "Средне",
			Order:         2,
			Sandbox:       "ransomware",
			SandboxPort:   9089,
			Theory:        "<h3>🔒 Программы-вымогатели</h3><p>Шифруют файлы и требуют выкуп.</p><h4>⚠️ Что делать:</h4><ul><li>НЕ платить выкуп!</li><li>Найти резервные копии</li><li>Использовать антивирус</li></ul><h4>✅ Профилактика:</h4><ul><li>Регулярные бэкапы</li><li>Обновления системы</li></ul>",
			Action:        "Восстановите файлы из резервной копии",
			CorrectAction: "Найти backup.zip и восстановить данные",
		},

		// ============================================================
		// УРОВНИ СЦЕНАРИЯ "leak"
		// Sandbox: data-leak(9088)
		// ============================================================
		Level{
			ScenarioID:    "leak",
			Name:          "Расследование",
			Attack:        "Утечка данных",
			Icon:          "🔍",
			Difficulty:    "Легко",
			Order:         1,
			Sandbox:       "data-leak",
			SandboxPort:   9088,
			Theory:        "<h3>🔍 Форензика</h3><p>Анализ логов для поиска источника утечки.</p><h4>📊 Что анализировать:</h4><ul><li>Логи доступа</li><li>Временные метки</li><li>Подозрительные файлы</li></ul><h4>✅ Методы:</h4><ul><li>Анализ сетевого трафика</li><li>Проверка изменённых файлов</li></ul>",
			Action:        "Найдите источник утечки данных",
			CorrectAction: "Обнаружить export.csv и backdoor.py",
		},

		// ============================================================
		// УРОВНИ СЦЕНАРИЯ "iot"
		// Sandbox: iot-attack(9090)
		// ============================================================
		Level{
			ScenarioID:    "iot",
			Name:          "Умный дом",
			Attack:        "IoT-атака",
			Icon:          "🏠",
			Difficulty:    "Легко",
			Order:         1,
			Sandbox:       "iot-attack",
			SandboxPort:   9090,
			Theory:        "<h3>🏠 Безопасность IoT</h3><p>Умные устройства имеют множество уязвимостей.</p><h4>⚠️ Опасности:</h4><ul><li>Стандартные пароли</li><li>Открытые порты</li><li>Отсутствие обновлений</li></ul><h4>✅ Защита:</h4><ul><li>Сменить пароли по умолчанию</li><li>Обновлять прошивку</li><li>Изолировать устройства в сети</li></ul>",
			Action:        "Защитите умный дом от хакера",
			CorrectAction: "Сканировать сеть и заблокировать атаку",
		},
	}

	for _, l := range levels {
		DB.Create(&l)
	}

	log.Println("Database seeded with initial data")
}

type Role struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `gorm:"unique;not null" json:"name"`
	Description string `json:"description"`
}

type User struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	Name         string     `json:"name"`
	Email        string     `gorm:"unique;not null" json:"email"`
	Phone        string     `gorm:"not null" json:"phone"`
	PasswordHash string     `gorm:"not null" json:"-"`
	CreatedAt    time.Time  `json:"created_at"`
	UserRoles    []UserRole `gorm:"foreignKey:UserID" json:"roles,omitempty"`
}

type UserRole struct {
	ID     uint `gorm:"primaryKey" json:"id"`
	UserID uint `gorm:"not null" json:"user_id"`
	RoleID uint `gorm:"not null" json:"role_id"`
	Role   Role `gorm:"foreignKey:RoleID" json:"role,omitempty"`
}

type LevelProgress struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null" json:"user_id"`
	ScenarioID  string    `gorm:"not null" json:"scenario_id"`
	LevelID     uint      `gorm:"not null" json:"level_id"`
	Completed   bool      `gorm:"not null" json:"completed"`
	Success     bool      `gorm:"not null" json:"success"`
	CompletedAt time.Time `json:"completed_at"`
}

type RefreshToken struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	Token     string    `gorm:"unique;not null" json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

func seedRoles() {
	var count int64
	DB.Model(&Role{}).Count(&count)
	if count > 0 {
		return
	}

	roles := []Role{
		{Name: "USER", Description: "Regular user"},
		{Name: "ADMIN", Description: "Administrator"},
	}

	for _, r := range roles {
		DB.Create(&r)
	}

	log.Println("Roles seeded")
}
