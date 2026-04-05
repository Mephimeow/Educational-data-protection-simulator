'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Level {
  id: number
  scenario_id: string
  name: string
  attack: string
  icon: string
  difficulty: string
  theory: string
  action: string
  correct_action: string
  hint: string
  sandbox: string
  sandbox_port: number
  order: number
}

interface Scenario {
  id: string
  title: string
  description: string
  icon: string
  levels?: Level[]
}

export default function ScenarioLevelPage() {
  const params = useParams()
  const scenarioId = params.id as string
  const levelOrderParam = params.level as string
  const levelOrder = parseInt(levelOrderParam)

  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [level, setLevel] = useState<Level | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTheory, setShowTheory] = useState(true)
  const [sandboxStatus] = useState<'running'>('running')
  const [labCompleted, setLabCompleted] = useState(false)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'lab-completed') {
        setLabCompleted(true)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (scenarioId && levelOrder) {
      fetch(`${API_URL}/api/v1/scenarios/${scenarioId}`)
        .then(res => res.json())
        .then(data => {
          const scenarioData = data.scenario || data
          setScenario(scenarioData)
          const levels = scenarioData.levels || []
          console.log('Levels:', levels.map((l: Level) => ({ order: l.order, name: l.name })))
          const found = levels.find((l: Level) => l.order === levelOrder)
          console.log('Looking for order:', levelOrder, 'Found:', found)
          setLevel(found || null)
        })
        .catch(err => console.error('Error:', err))
        .finally(() => setLoading(false))
    }
  }, [scenarioId, levelOrder])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

  if (!level) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4 text-white">Уровень не найден</h1>
          <Link href="/scenarios" className="text-cyan-400 hover:underline">
            ← Вернуться к сценариям
          </Link>
          <p className="text-slate-400 mt-2">scenarioId: {scenarioId}, order: {levelOrder}</p>
        </div>
      </div>
    )
  }

  const sandboxUrl = `http://localhost:${level.sandbox_port}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/scenarios" className="text-slate-400 hover:text-white transition">
                ← Сценарии
              </Link>
              <span className="text-slate-600">/</span>
              <Link href={`/scenarios/${scenarioId}`} className="text-slate-400 hover:text-white transition">
                {scenario?.title}
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-white">Уровень {level.order}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-sm font-medium">
                {level.attack}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden">
              <button 
                onClick={() => setShowTheory(!showTheory)}
                className="w-full p-4 bg-slate-700/50 flex items-center justify-between text-white hover:bg-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📚</span>
                  <span className="font-semibold">Теория</span>
                </div>
                <span>{showTheory ? '▼' : '▶'}</span>
              </button>
              {showTheory && (
                <div className="p-6 text-slate-300 leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: level.theory }} />
                </div>
              )}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-semibold text-white mb-2">Задание</h4>
                  <p className="text-slate-300">{level.action}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h4 className="font-semibold text-white mb-2">Правильный ответ</h4>
                  <p className="text-slate-300">{level.correct_action}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="font-semibold text-white mb-2">Важно!</h4>
                  <p className="text-slate-300">
                    {labCompleted 
                      ? '✅ Задание в песочнице выполнено! Теперь можете получить XP.'
                      : '❌ Сначала выполните задание в интерактивной среде (справа), затем нажмите кнопку "Задание выполнено" внутри песочницы.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                if (!labCompleted) {
                  alert('Сначала выполните задание в интерактивной среде!')
                  return
                }
                try {
                  const token = localStorage.getItem('accessToken')
                  if (!token) {
                    alert('Для сохранения прогресса необходимо войти в систему')
                    return
                  }
                  const res = await fetch(`${API_URL}/api/v1/gamification/complete-level`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      level_id: level.id,
                      scenario_id: scenarioId,
                      time_seconds: 120,
                    }),
                  })
                  const data = await res.json()
                  if (res.ok) {
                    alert(`Поздравляем! Вы получили ${data.xp_earned} XP!\nВсего: ${data.total_xp} XP\nУровень: ${data.level}`)
                    setLabCompleted(false)
                  } else {
                    alert('Ошибка при сохранении: ' + (data.error || 'Неизвестная ошибка'))
                  }
                } catch (err) {
                  console.error('Error:', err)
                  alert('Ошибка при сохранении прогресса')
                }
              }}
              disabled={!labCompleted}
              className={`w-full font-semibold py-4 px-6 rounded-xl transition flex items-center justify-center gap-2 ${
                labCompleted 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-slate-600 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>🎉</span>
              {labCompleted ? 'Получить XP' : 'Сначала выполните лабораторную'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Интерактивная среда</h3>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Активно
                </span>
              </div>
            </div>
            <div className="h-[600px] bg-slate-900 rounded-xl overflow-hidden">
              <iframe
                src={sandboxUrl}
                className="w-full h-full border-0"
                title="Interactive Sandbox"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}