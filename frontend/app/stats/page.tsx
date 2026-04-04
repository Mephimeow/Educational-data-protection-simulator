'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { getUserStats, UserStats } from '@/lib/auth'

const SCENARIO_NAMES: Record<string, string> = {
  office: '🏢 Офис',
  home: '🏠 Дом',
  public: '📶 Общественный Wi-Fi'
}

const TOTAL_LEVELS_PER_SCENARIO: Record<string, number> = {
  office: 3,
  home: 3,
  public: 3
}

function getLeague(successRate: number, completed: number): { name: string; icon: string; color: string } {
  if (completed === 0) return { name: 'Новичок', icon: '🌱', color: 'text-slate-400' }
  if (successRate >= 90 && completed >= 9) return { name: 'Мастер', icon: '👑', color: 'text-amber-400' }
  if (successRate >= 80 && completed >= 6) return { name: 'Эксперт', icon: '⭐', color: 'text-purple-400' }
  if (successRate >= 70 && completed >= 3) return { name: 'Знаток', icon: '🎓', color: 'text-blue-400' }
  return { name: 'Новичок', icon: '🌱', color: 'text-green-400' }
}

function getAchievements(stats: UserStats): { name: string; icon: string; earned: boolean; description: string }[] {
  const completedLevels = stats.completed_levels || 0
  const successRate = stats.success_rate || 0
  const progress = stats.progress || []
  
  return [
    { name: 'Первая победа', icon: '🏆', earned: completedLevels >= 1, description: 'Пройдите первый уровень' },
    { name: 'Охотник за фишингом', icon: '🎣', earned: progress.some(s => s.scenario_id === 'office' && s.completed >= 3), description: 'Пройдите все уровни офиса' },
    { name: 'Домашний защитник', icon: '🏠', earned: progress.some(s => s.scenario_id === 'home' && s.completed >= 3), description: 'Пройдите все уровни дома' },
    { name: 'Путешественник', icon: '🌍', earned: progress.filter(p => p.completed > 0).length >= 2, description: 'Пройдите 2 разных сценария' },
    { name: 'Снайпер', icon: '🎯', earned: successRate >= 90, description: 'Добейтесь 90% успешных попыток' },
    { name: 'Мастер', icon: '👑', earned: successRate >= 90 && completedLevels >= 9, description: 'Пройдите все уровни с 90% успехом' },
  ]
}

export default function StatsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchStats()
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false)
    }
  }, [authLoading, isAuthenticated])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await getUserStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>Загрузка статистики...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Войдите для просмотра статистики</h1>
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition">
              Войти
            </Link>
            <Link href="/register" className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition">
              Регистрация
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={fetchStats} className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition">
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  const league = getLeague(stats?.success_rate || 0, stats?.completed_levels || 0)
  const achievements = getAchievements(stats!)
  const totalPossibleLevels = stats?.total_scenarios || 9

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-slate-400 hover:text-white transition flex items-center gap-2">
              <span>←</span>
              <span className="text-xl font-bold">CyberSimulator</span>
            </Link>
            <span className="text-slate-300">👤 {user?.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">📊 Ваша статистика</h1>
        <p className="text-slate-400 mb-8">Отслеживайте свой прогресс в изучении кибербезопасности</p>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.completed_levels || 0}/{totalPossibleLevels}
            </div>
            <div className="text-slate-400 text-sm">Пройдено уровней</div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">{league.icon}</div>
            <div className={`text-2xl font-bold mb-1 ${league.color}`}>{league.name}</div>
            <div className="text-slate-400 text-sm">Текущий ранг</div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">📈</div>
            <div className={`text-3xl font-bold mb-1 ${stats?.success_rate && stats.success_rate >= 80 ? 'text-green-400' : 'text-amber-400'}`}>
              {stats?.success_rate?.toFixed(0) || 0}%
            </div>
            <div className="text-slate-400 text-sm">Успешных попыток</div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-3xl font-bold text-cyan-400 mb-1">
              {achievements.filter(a => a.earned).length}
            </div>
            <div className="text-slate-400 text-sm">Достижений</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📚</span> Прогресс по сценариям
            </h2>
            <div className="space-y-4">
              {Object.keys(TOTAL_LEVELS_PER_SCENARIO).map(scenarioId => {
                const scenario = stats?.progress?.find(s => s.scenario_id === scenarioId)
                const completed = scenario?.completed || 0
                const total = TOTAL_LEVELS_PER_SCENARIO[scenarioId]
                const percentage = total > 0 ? (completed / total) * 100 : 0
                
                return (
                  <div key={scenarioId} className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{SCENARIO_NAMES[scenarioId]}</span>
                      <span className="text-slate-400 text-sm">{completed}/{total}</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          percentage === 100 ? 'bg-green-500' : percentage >= 50 ? 'bg-cyan-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🏅</span> Достижения
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {achievements.map((ach, index) => (
                <div 
                  key={index}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition ${
                    ach.earned 
                      ? 'bg-cyan-500/20 border-2 border-cyan-500 hover:bg-cyan-500/30 cursor-help'
                      : 'bg-slate-700/50 border-2 border-slate-600 opacity-50'
                  }`}
                  title={`${ach.description}`}
                >
                  <span className="text-3xl mb-1">{ach.icon}</span>
                  <span className="text-xs text-center px-1 text-slate-300">{ach.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📜</span> Прогресс по сценариям
          </h2>
          {stats?.progress && stats.progress.length > 0 ? (
            <div className="space-y-3">
              {stats.progress.map((p, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between bg-slate-700/30 rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">
                      {p.completed === p.total_levels ? '✅' : p.completed > 0 ? '🔄' : '⏳'}
                    </span>
                    <div>
                      <div className="text-white font-medium">
                        {p.scenario_name || p.scenario_id}
                      </div>
                      <div className="text-slate-400 text-sm">Уровней: {p.completed}/{p.total_levels}</div>
                    </div>
                  </div>
                  <span className={`text-sm ${p.success > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                    {p.success} успешно
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>Пока нет прогресса</p>
              <p className="text-sm mt-2">Начните проходить уровни, чтобы увидеть здесь свои результаты!</p>
            </div>
          )}
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
    </div>
  )
}
