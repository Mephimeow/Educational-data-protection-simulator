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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

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
                  <div className="text-5xl">{scenario.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{scenario.title}</h2>
                    <p className="text-slate-400">{scenario.description}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Уровни:</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {scenario.levels?.map(level => (
                    <Link
                      key={level.id}
                      href={`/scenarios/${scenario.id}/${level.id}`}
                      className="bg-slate-700/30 border border-slate-600 rounded-xl p-4 hover:border-cyan-500/50 transition group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{level.icon}</span>
                        <span className="bg-cyan-500/20 text-cyan-400 text-xs px-3 py-1 rounded-full">
                          Уровень {level.order}
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
