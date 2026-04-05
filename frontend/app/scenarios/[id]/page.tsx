'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from "next/navigation"

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

export default function ScenarioPage() {
  const params = useParams()
  const scenarioId = params.id as string
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScenario()
  }, [scenarioId])

  const fetchScenario = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/scenarios/${scenarioId}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      setScenario(data)
    } catch (err) {
      console.error('Failed to load scenario:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">Сценарий не найден</h1>
          <Link href="/scenarios" className="text-cyan-400 hover:underline">
            ← Вернуться к сценариям
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/scenarios" className="text-slate-400 hover:text-white transition">
              ← Сценарии
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="text-6xl">{scenario.icon}</div>
          <div>
            <h1 className="text-3xl font-bold text-white">{scenario.title}</h1>
            <p className="text-slate-400">{scenario.description}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {scenario.levels?.map(level => (
            <Link
              key={level.id}
              href={`/scenarios/${scenarioId}/${level.order}`}
              className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{level.icon}</span>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  level.difficulty === 'Легко' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {level.difficulty}
                </span>
              </div>
              <div className="mb-2">
                <span className="text-cyan-400 text-sm">Уровень {level.order}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition">
                {level.name}
              </h3>
              <p className="text-slate-400 text-sm mb-4">{level.attack}</p>
              <div className="bg-cyan-500/10 text-cyan-400 text-center py-2 rounded-lg font-medium">
                Начать →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-slate-800/30 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>💡</span> Советы по сценарию
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-slate-400">
            <div className="flex gap-3">
              <span>📖</span>
              <p>Сначала изучите теорию, чтобы понять принципы атак</p>
            </div>
            <div className="flex gap-3">
              <span>🎮</span>
              <p>Внимательно изучайте каждый элемент интерфейса</p>
            </div>
            <div className="flex gap-3">
              <span>🔍</span>
              <p>Ищите подозрительные признаки и аномалии</p>
            </div>
            <div className="flex gap-3">
              <span>✅</span>
              <p>Принимайте обдуманные решения</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
