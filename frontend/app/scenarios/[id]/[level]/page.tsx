'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useAuth } from "@/lib/AuthContext"
import { isAdmin } from "@/lib/auth"
import { recordLevelComplete } from "@/lib/auth"

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
  const levelIdParam = params.level as string
  const levelId = parseInt(levelIdParam)

  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [level, setLevel] = useState<Level | null>(null)
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<{success: boolean; message: string} | null>(null)
  const [showTheory, setShowTheory] = useState(true)
  const { isAuthenticated, user } = useAuth()
  const isAdminUser = isAdmin(user)
  const [sandboxStatus, setSandboxStatus] = useState<'stopped' | 'starting' | 'running' | 'stopping'>('stopped')
  const [iframeKey, setIframeKey] = useState(0)

  useEffect(() => {
    fetchData()
  }, [scenarioId])

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/scenarios/${scenarioId}`)
      if (!res.ok) throw new Error('Not found')
      const data: Scenario = await res.json()
      setScenario(data)
      const foundLevel = data.levels?.find(l => l.id === levelId)
      setLevel(foundLevel || null)
    } catch (err) {
      console.error('Failed to load level:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'sandbox-result') {
        setResult(event.data)
        if (isAuthenticated && level) {
          recordLevelComplete(scenarioId, level.id, event.data.success).catch(console.error)
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [scenarioId, level, isAuthenticated])

  const startSandbox = async () => {
    if (!level) return
    setSandboxStatus('starting')
    try {
      const res = await fetch(`${API_URL}/api/v1/sandbox/start/${level.sandbox}`, {
        method: 'POST'
      })
      const data = await res.json()
      if (res.ok) {
        setSandboxStatus('running')
        setIframeKey(prev => prev + 1)
      } else {
        console.error('Failed to start sandbox:', data.error)
        setSandboxStatus('stopped')
      }
    } catch (err) {
      console.error('Failed to start sandbox:', err)
      setSandboxStatus('stopped')
    }
  }

  const stopSandbox = async () => {
    if (!level) return
    setSandboxStatus('stopping')
    try {
      const res = await fetch(`${API_URL}/api/v1/sandbox/stop/${level.sandbox}`, {
        method: 'POST'
      })
      if (res.ok) {
        setSandboxStatus('stopped')
        setIframeKey(prev => prev + 1)
      }
    } catch (err) {
      console.error('Failed to stop sandbox:', err)
      setSandboxStatus('running')
    }
  }

  const terminateSandbox = async () => {
    if (!level) return
    setSandboxStatus('stopping')
    try {
      const res = await fetch(`${API_URL}/api/v1/sandbox/terminate/${level.sandbox}`, {
        method: 'POST'
      })
      if (res.ok) {
        setSandboxStatus('stopped')
        setIframeKey(prev => prev + 1)
      }
    } catch (err) {
      console.error('Failed to terminate sandbox:', err)
      setSandboxStatus('running')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

  if (!scenario || !level) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">Уровень не найден</h1>
          <Link href="/scenarios" className="text-cyan-400 hover:underline">
            ← Вернуться к сценариям
          </Link>
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
                {scenario.title}
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
                  <h4 className="font-semibold text-amber-400 mb-1">Задание:</h4>
                  <p className="text-slate-300">{level.action}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h4 className="font-semibold text-green-400 mb-1">Правильное решение:</h4>
                  <p className="text-slate-300">{level.correct_action}</p>
                </div>
              </div>
            </div>

            {result && (
              <div className={`rounded-xl p-4 ${
                result.success 
                  ? 'bg-green-500/20 border border-green-500/50' 
                  : 'bg-red-500/20 border border-red-500/50'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{result.success ? '🎉' : '😕'}</span>
                  <div>
                    <h4 className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      {result.success ? 'Отлично!' : 'Неверно'}
                    </h4>
                    <p className="text-slate-300">{result.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="bg-slate-700/50 px-4 py-3 flex items-center justify-between">
              <span className="text-slate-400 text-sm">
                Интерактивная среда — {level.sandbox}
              </span>
              <div className="flex items-center gap-2">
                {sandboxStatus === 'stopped' && (
                  <button 
                    onClick={startSandbox}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm hover:bg-green-500/30 transition flex items-center gap-1"
                  >
                    <span>▶</span> Запустить
                  </button>
                )}
                {sandboxStatus === 'starting' && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">
                    Запуск...
                  </span>
                )}
                {sandboxStatus === 'running' && (
                  <button 
                    onClick={stopSandbox}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition flex items-center gap-1"
                  >
                    <span>⬛</span> Стоп
                  </button>
                )}
                {sandboxStatus === 'stopping' && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">
                    Остановка...
                  </span>
                )}
                {sandboxStatus === 'running' && isAdminUser && (
                  <button 
                    onClick={terminateSandbox}
                    className="px-3 py-1 bg-red-500/80 text-white rounded text-sm hover:bg-red-600 transition flex items-center gap-1"
                    title="Полностью остановить и удалить контейнер"
                  >
                    ✕ Terminate
                  </button>
                )}
              </div>
            </div>
            <div className="h-[600px] bg-slate-900">
              {sandboxStatus === 'running' ? (
                <iframe
                  key={iframeKey}
                  src={sandboxUrl}
                  className="w-full h-full border-0"
                  title="Interactive Sandbox"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                  <span className="text-6xl mb-4">🛑</span>
                  <p className="text-lg">Среда остановлена</p>
                  <p className="text-sm mt-2">Нажмите "Запустить" для начала работы</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
