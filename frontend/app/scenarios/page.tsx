import Link from "next/link"

const scenarios = [
  {
    id: "office",
    title: "🏢 Офис",
    description: "Рабочий день в офисе. Фишинговые письма, подозрительные USB-накопители, социальная инженерия.",
    levels: [
      { id: 1, name: "Утренняя почта", attack: "Фишинг", icon: "📧" },
      { id: 2, name: "USB-флешка", attack: "Вредоносное ПО", icon: "💾" },
      { id: 3, name: "Звонок \"IT-поддержки\"", attack: "Социальная инженерия", icon: "📞" },
    ],
    color: "blue"
  },
  {
    id: "home",
    title: "🏠 Дом",
    description: "Удалённая работа. Безопасность домашней сети, пароли, фишинг в мессенджерах.",
    levels: [
      { id: 1, name: "Письмо из \"банка\"", attack: "Фишинг", icon: "🏦" },
      { id: 2, name: "Сильный пароль", attack: "Безопасность паролей", icon: "🔐" },
      { id: 3, name: "Обновление системы", attack: "Социальная инженерия", icon: "⚙️" },
    ],
    color: "green"
  },
  {
    id: "public",
    title: "📶 Общественный Wi-Fi",
    description: "Кафе и общественные места. Атаки \"злой двойник\", перехват трафика, скимминг.",
    levels: [
      { id: 1, name: "Выбор сети", attack: "Evil Twin", icon: "📶" },
      { id: 2, name: "Банкомат", attack: "Скимминг", icon: "🏧" },
      { id: 3, name: "Работа в кафе", attack: "Перехват данных", icon: "☕" },
    ],
    color: "purple"
  }
]

export default function ScenariosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 text-white hover:text-cyan-400 transition">
            <span>←</span>
            <span className="text-2xl font-bold">CyberSimulator</span>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Выберите сценарий</h1>
        <p className="text-slate-400 mb-8">Каждый сценарий содержит теорию и практические задания в интерактивной среде</p>

        <div className="space-y-8">
          {scenarios.map(scenario => (
            <div 
              key={scenario.id}
              className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{scenario.id === 'office' ? '🏢' : scenario.id === 'home' ? '🏠' : '📶'}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{scenario.title}</h2>
                    <p className="text-slate-400">{scenario.description}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Уровни:</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {scenario.levels.map(level => (
                    <Link
                      key={level.id}
                      href={`/scenarios/${scenario.id}/${level.id}`}
                      className="bg-slate-700/30 border border-slate-600 rounded-xl p-4 hover:border-cyan-500/50 transition group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{level.icon}</span>
                        <span className="bg-cyan-500/20 text-cyan-400 text-xs px-3 py-1 rounded-full">
                          Уровень {level.id}
                        </span>
                      </div>
                      <h4 className="font-semibold text-white group-hover:text-cyan-400 transition mb-1">
                        {level.name}
                      </h4>
                      <p className="text-slate-500 text-sm">{level.attack}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
