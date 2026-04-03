import Link from "next/link"

export default function AboutPage() {
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

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">О проекте</h1>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🎯</span> Цель проекта
          </h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            CyberSimulator — это образовательная платформа для обучения кибербезопасности через интерактивные 
            симуляции. Вместо скучных инструкций мы создаём эмоциональный опыт, который помогает формировать 
            устойчивые поведенческие паттерны безопасного поведения.
          </p>
          <p className="text-slate-300 leading-relaxed">
            Когда пользователь "теряет" аккаунт в симуляции из-за клика по фишинговой ссылке, 
            нейронные связи формируются глубже, чем при чтении текста.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📚</span> Источники
          </h2>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-cyan-400">•</span>
              <span><strong>CWE</strong> (Common Weakness Enumeration) — для описания последствий ошибок</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400">•</span>
              <span><strong>APWG</strong> (Anti-Phishing Working Group) — для реалистичности сценариев</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400">•</span>
              <span><strong>OWASP Top 10</strong> — для объяснения уязвимостей</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400">•</span>
              <span><strong>Material Design 3</strong> — для обеспечения высокого уровня UX</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400">•</span>
              <span><strong>Рекомендации Минцифры РФ</strong> и <strong>Лаборатории Касперского</strong></span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🛡️</span> Типы угроз в симуляторе
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: "🎣", name: "Фишинг", desc: "Поддельные письма и сайты" },
              { icon: "🎭", name: "Социальная инженерия", desc: "Манипуляция людьми" },
              { icon: "👻", name: "Злой двойник", desc: "Поддельные Wi-Fi сети" },
              { icon: "💳", name: "Скимминг", desc: "Считыватели на банкоматах" },
              { icon: "🔑", name: "Подбор пароля", desc: "Brute force атаки" },
              { icon: "🦠", name: "Вредоносное ПО", desc: "Вирусы и трояны" },
            ].map((threat, index) => (
              <div key={index} className="bg-slate-700/30 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{threat.icon}</span>
                  <span className="font-semibold text-white">{threat.name}</span>
                </div>
                <p className="text-slate-400 text-sm">{threat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🏗️</span> Архитектура
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-24 text-right text-slate-400 text-sm">Frontend</div>
              <div className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg text-sm">
                Next.js + Tailwind CSS
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-right text-slate-400 text-sm">Backend</div>
              <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm">
                Go + Gin + GORM
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-right text-slate-400 text-sm">Database</div>
              <div className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg text-sm">
                PostgreSQL + Redis
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-right text-slate-400 text-sm">Sandbox</div>
              <div className="bg-amber-500/20 text-amber-400 px-4 py-2 rounded-lg text-sm">
                Docker + Nginx
              </div>
            </div>
          </div>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-4">Готовы начать?</h2>
          <p className="text-slate-400 mb-6">
            Пройдите симуляции и научитесь распознавать киберугрозы
          </p>
          <Link 
            href="/scenarios"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-4 rounded-xl transition transform hover:scale-105"
          >
            Выбрать сценарий →
          </Link>
        </div>
      </div>
    </main>
  )
}
