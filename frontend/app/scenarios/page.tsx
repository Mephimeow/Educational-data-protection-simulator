'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Level {
  id: number
  name: string
  attack: string
  icon: string
  difficulty: string
  order: number
}

interface Scenario {
  id: string
  title: string
  description: string
  icon: string
  color: string
  levels?: Level[]
}

const colorMap: Record<string, { bg: string, border: string, gradient: string }> = {
  blue: { bg: 'from-blue-500/20', border: 'border-blue-500/30', gradient: 'from-blue-500 to-cyan-500' },
  green: { bg: 'from-green-500/20', border: 'border-green-500/30', gradient: 'from-green-500 to-emerald-500' },
  purple: { bg: 'from-purple-500/20', border: 'border-purple-500/30', gradient: 'from-purple-500 to-pink-500' },
  red: { bg: 'from-red-500/20', border: 'border-red-500/30', gradient: 'from-red-500 to-orange-500' },
  yellow: { bg: 'from-yellow-500/20', border: 'border-yellow-500/30', gradient: 'from-yellow-500 to-amber-500' },
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScenarios()
  }, [])

  const fetchScenarios = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/scenarios`)
      const data = await res.json()
      setScenarios(data.scenarios || [])
    } catch (err) {
      console.error('Failed to load scenarios:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-cyan-400 text-lg">Загрузка сценариев...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-4">
            <span className="text-xl">←</span>
            <span>На главную</span>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Выберите сценарий
            </span>
          </h1>
          <p className="text-slate-400 text-lg">Каждый сценарий содержит теорию и практические задания в интерактивной среде</p>
        </div>

        <div className="space-y-8">
          {scenarios.map((scenario, index) => {
            const colors = colorMap[scenario.color] || colorMap.blue
            return (
              <div 
                key={scenario.id}
                className={`bg-gradient-to-r ${colors.bg} to-transparent border ${colors.border} rounded-2xl overflow-hidden backdrop-blur-sm`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl animate-pulse">{scenario.icon}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{scenario.title}</h2>
                      <p className="text-slate-400">{scenario.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                    Уровни ({scenario.levels?.length || 0})
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {scenario.levels?.map(level => (
                      <Link
                        key={level.id}
                        href={`/scenarios/${scenario.id}/${level.order}`}
                        className="group bg-slate-800/50 border border-slate-600 hover:border-cyan-500/50 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/10"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl group-hover:scale-110 transition-transform">{level.icon}</span>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            level.difficulty === 'Легко' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {level.difficulty}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="text-cyan-400 text-sm font-medium">Уровень {level.order}</span>
                        </div>
                        <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors mb-1">
                          {level.name}
                        </h4>
                        <p className="text-slate-500 text-sm mb-3">{level.attack}</p>
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-center py-2 rounded-lg font-medium text-sm group-hover:shadow-lg transition-shadow">
                          Начать →
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="text-2xl">💡</span>
            Как это работает?
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📖</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Теория</h4>
              <p className="text-slate-400 text-sm">Изучите принципы работы угроз</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎮</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Практика</h4>
              <p className="text-slate-400 text-sm">Выполните задание в песочнице</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✅</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Проверка</h4>
              <p className="text-slate-400 text-sm">Получите обратную связь</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏆</span>
              </div>
              <h4 className="font-semibold text-white mb-2">XP</h4>
              <p className="text-slate-400 text-sm">Набирайте очки опыта</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}