'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "./lib/AuthContext"
import { isAdmin } from "./lib/auth"

const scenarios = [
  {
    id: "office",
    title: "Офис",
    description: "Сценарий: Рабочий день в офисе. Фишинговые письма, подозрительные USB-накопители, социальная инженерия.",
    icon: "🏢",
    color: "blue",
    levels: 3,
    attacks: ["phishing", "usb", "social_engineering"]
  },
  {
    id: "home",
    title: "Дом",
    description: "Сценарий: Удалённая работа. Безопасность домашней сети, пароли, фишинг в мессенджерах.",
    icon: "🏠",
    color: "green",
    levels: 3,
    attacks: ["phishing", "password", "malware"]
  },
  {
    id: "public",
    title: "Общественный Wi-Fi",
    description: "Сценарий: Кафе и общественные места. Атаки \"злой двойник\", перехват трафика, скимминг.",
    icon: "📶",
    color: "purple",
    levels: 3,
    attacks: ["evil_twin", "mitm", "skimming"]
  }
]

const attackTypes = [
  { id: "phishing", name: "Фишинг", icon: "🎣", description: "Поддельные письма и сайты для кражи данных" },
  { id: "social_engineering", name: "Социальная инженерия", icon: "🎭", description: "Манипуляция людьми для получения информации" },
  { id: "evil_twin", name: "Злой двойник", icon: "👻", description: "Поддельные Wi-Fi точки доступа" },
  { id: "skimming", name: "Скимминг", icon: "💳", description: "Установка считывателей на банкоматы" },
  { id: "password", name: "Подбор пароля", icon: "🔑", description: "Brute force и угадывание паролей" },
]

export default function Home() {
  const { user, isAuthenticated, logout, loading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛡️</span>
            <h1 className="text-2xl font-bold text-white">CyberSimulator</h1>
          </div>
          <nav className="flex gap-6 items-center">
            <Link href="/scenarios" className="text-slate-300 hover:text-white transition">Сценарии</Link>
            <Link href="/stats" className="text-slate-300 hover:text-white transition">Статистика</Link>
            <Link href="/about" className="text-slate-300 hover:text-white transition">О проекте</Link>
            {!loading && isAdmin(user) && (
              <Link href="/admin" className="text-purple-400 hover:text-purple-300 transition font-medium">
                Админ
              </Link>
            )}
            {!loading && (
              isAuthenticated ? (
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-600">
                  <span className="text-slate-300 text-sm">
                    👤 {user?.name || 'Пользователь'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-600">
                  <Link href="/login" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                    Войти
                  </Link>
                  <Link href="/register" className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                    Регистрация
                  </Link>
                </div>
              )
            )}
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Обучайтесь кибербезопасности<br/>
            <span className="text-cyan-400"> через практику</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Интерактивные сценарии с реальными угрозами. Изучайте, как распознавать атаки, 
            принимая решения в безопасной среде.
          </p>
          {isAuthenticated ? (
            <Link 
              href="/scenarios" 
              className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-4 rounded-xl transition transform hover:scale-105"
            >
              Продолжить обучение →
            </Link>
          ) : (
            <Link 
              href="/register" 
              className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-4 rounded-xl transition transform hover:scale-105"
            >
              Начать обучение →
            </Link>
          )}
        </section>

        <section className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span>🎯</span> Выберите сценарий
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {scenarios.map(scenario => (
              <Link 
                key={scenario.id}
                href={isAuthenticated ? `/scenarios/${scenario.id}` : '/login'}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition group"
              >
                <div className="text-5xl mb-4">{scenario.icon}</div>
                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition">
                  {scenario.title}
                </h4>
                <p className="text-slate-400 text-sm mb-4">{scenario.description}</p>
                <div className="flex flex-wrap gap-2">
                  {scenario.attacks.map(attack => {
                    const type = attackTypes.find(t => t.id === attack)
                    return (
                      <span 
                        key={attack}
                        className="bg-slate-700/50 text-slate-300 text-xs px-3 py-1 rounded-full"
                      >
                        {type?.icon} {type?.name}
                      </span>
                    )
                  })}
                </div>
                <div className="mt-4 text-cyan-400 text-sm font-medium">
                  {scenario.levels} уровня →
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span>📚</span> Типы угроз
          </h3>
          <div className="grid md:grid-cols-5 gap-4">
            {attackTypes.map(typeItem => (
              <div 
                key={typeItem.id}
                className="bg-slate-800/30 border border-slate-700 rounded-xl p-4 text-center"
              >
                <div className="text-3xl mb-2">{typeItem.icon}</div>
                <h5 className="font-semibold text-white text-sm mb-1">{typeItem.name}</h5>
                <p className="text-slate-500 text-xs">{typeItem.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span>💡</span> Как это работает?
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">📖</div>
              <h5 className="font-semibold text-white mb-2">Теория</h5>
              <p className="text-slate-400 text-sm">Изучите принципы работы угроз и как их распознавать</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎮</div>
              <h5 className="font-semibold text-white mb-2">Практика</h5>
              <p className="text-slate-400 text-sm">Интерактивные симуляции в безопасной среде</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <h5 className="font-semibold text-white mb-2">Проверка</h5>
              <p className="text-slate-400 text-sm">Выбирайте правильные решения и получайте обратную связь</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📈</div>
              <h5 className="font-semibold text-white mb-2">Прогресс</h5>
              <p className="text-slate-400 text-sm">Отслеживайте свои навыки и становитесь экспертом</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
