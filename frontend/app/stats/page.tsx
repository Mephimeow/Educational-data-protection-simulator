import Link from "next/link"

const stats = {
  totalScenarios: 9,
  completedScenarios: 3,
  threatTypesLearned: 5,
  totalScore: 250,
  league: "Новичок",
  achievements: [
    { name: "Первая победа", icon: "🏆", earned: true },
    { name: "Охотник за фишингом", icon: "🎣", earned: true },
    { name: "Безопасник", icon: "🛡️", earned: true },
    { name: "Эксперт", icon: "⭐", earned: false },
    { name: "Мастер", icon: "👑", earned: false },
  ],
  recentActivity: [
    { scenario: "🏢 Офис", level: "Уровень 1", result: "✅", date: "Сегодня" },
    { scenario: "🏠 Дом", level: "Уровень 1", result: "✅", date: "Вчера" },
    { scenario: "📶 Общественный Wi-Fi", level: "Уровень 1", result: "✅", date: "Вчера" },
  ]
}

const threatsByLevel = [
  { level: "Новичок", count: 12, color: "bg-green-500" },
  { level: "Знаток", count: 8, color: "bg-blue-500" },
  { level: "Эксперт", count: 3, color: "bg-purple-500" },
  { level: "Мастер", count: 0, color: "bg-amber-500" },
]

export default function StatsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition">
              ← На главную
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">📊 Ваша статистика</h1>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-white mb-1">{stats.completedScenarios}/{stats.totalScenarios}</div>
            <div className="text-slate-400 text-sm">Пройдено сценариев</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-3xl font-bold text-cyan-400 mb-1">{stats.totalScore}</div>
            <div className="text-slate-400 text-sm">Очков</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🎣</div>
            <div className="text-3xl font-bold text-green-400 mb-1">{stats.threatTypesLearned}</div>
            <div className="text-slate-400 text-sm">Типов угроз изучено</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🏅</div>
            <div className="text-xl font-bold text-amber-400 mb-1">{stats.league}</div>
            <div className="text-slate-400 text-sm">Текущая лига</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📈</span> Прогресс по лигам
            </h2>
            <div className="space-y-4">
              {threatsByLevel.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-slate-400 text-sm">{item.level}</div>
                  <div className="flex-1 bg-slate-700 rounded-full h-4 overflow-hidden">
                    <div 
                      className={`${item.color} h-full rounded-full transition-all`}
                      style={{ width: `${(item.count / 12) * 100}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-white text-sm">{item.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🏅</span> Достижения
            </h2>
            <div className="grid grid-cols-5 gap-3">
              {stats.achievements.map((ach, index) => (
                <div 
                  key={index}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center ${
                    ach.earned 
                      ? 'bg-cyan-500/20 border-2 border-cyan-500' 
                      : 'bg-slate-700/50 border-2 border-slate-600 opacity-50'
                  }`}
                  title={ach.name}
                >
                  <span className="text-2xl mb-1">{ach.icon}</span>
                  <span className="text-xs text-slate-400">{ach.earned ? '✓' : '?'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📜</span> Недавняя активность
          </h2>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div 
                key={index}
                className="flex items-center justify-between bg-slate-700/30 rounded-lg p-4"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{activity.result}</span>
                  <div>
                    <div className="text-white font-medium">{activity.scenario}</div>
                    <div className="text-slate-400 text-sm">{activity.level}</div>
                  </div>
                </div>
                <span className="text-slate-500 text-sm">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/scenarios"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-4 rounded-xl transition transform hover:scale-105"
          >
            Продолжить обучение →
          </Link>
        </div>
      </div>
    </main>
  )
}
