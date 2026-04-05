'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { authService } from '@/lib/auth'
import { useTheme } from '@/lib/ThemeContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface UserProfile {
  id: number
  name: string
  email: string
  phone: string
}

export default function ProfilePage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [gamificationStats, setGamificationStats] = useState<{xp: number, level: number, achievements: number} | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchProfile()
      fetchGamificationStats()
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false)
    }
  }, [authLoading, isAuthenticated])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const token = authService.getAccessToken()
      const res = await fetch(`${API_URL}/api/v1/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch profile')
      const data = await res.json()
      setProfile(data)
      setName(data.name || '')
      setPhone(data.phone || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchGamificationStats = async () => {
    try {
      const token = authService.getAccessToken()
      const res = await fetch(`${API_URL}/api/v1/gamification/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setGamificationStats({ xp: data.stats?.xp || 0, level: data.stats?.level || 1, achievements: data.achievements || 0 })
      }
    } catch (err) {
      console.error('Failed to load gamification stats')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const token = authService.getAccessToken()
      const res = await fetch(`${API_URL}/api/v1/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, phone }),
      })
      if (!res.ok) throw new Error('Failed to update profile')
      const data = await res.json()
      setProfile(data)
      setSuccess('Профиль успешно обновлён!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Войдите для просмотра профиля</h1>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-slate-400 hover:text-white transition flex items-center gap-2">
              <span>←</span>
              <span className="text-xl font-bold">CyberSimulator</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">👤 Мой профиль</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Редактирование профиля</h2>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
                  <p className="text-green-400">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-slate-500 text-xs mt-1">Email нельзя изменить</p>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                    Имя
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition"
                    placeholder="Ваше имя"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition"
                    placeholder="+79001234567"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
              <div className="w-24 h-24 mx-auto bg-cyan-500/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">👤</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{profile?.name || 'Пользователь'}</h3>
              <p className="text-slate-400 text-sm mb-4">{profile?.email}</p>
              {gamificationStats && (
                <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Уровень {gamificationStats.level}</span>
                    <span className="text-cyan-400">{gamificationStats.xp} XP</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${Math.min((gamificationStats.xp % 100), 100)}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">🏆 {gamificationStats.achievements} достижений</p>
                </div>
              )}
              <Link 
                href="/stats"
                className="inline-block bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg transition"
              >
                📊 Моя статистика
              </Link>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Настройки</h3>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 text-slate-300 hover:text-cyan-400 transition p-2 rounded-lg hover:bg-slate-700/50 w-full"
              >
                <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                <span>{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</span>
              </button>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Быстрые ссылки</h3>
              <div className="space-y-2">
                <Link 
                  href="/scenarios"
                  className="flex items-center gap-3 text-slate-300 hover:text-cyan-400 transition p-2 rounded-lg hover:bg-slate-700/50"
                >
                  <span>🎯</span>
                  <span>Сценарии</span>
                </Link>
                <Link 
                  href="/stats"
                  className="flex items-center gap-3 text-slate-300 hover:text-cyan-400 transition p-2 rounded-lg hover:bg-slate-700/50"
                >
                  <span>📈</span>
                  <span>Статистика</span>
                </Link>
                <Link 
                  href="/about"
                  className="flex items-center gap-3 text-slate-300 hover:text-cyan-400 transition p-2 rounded-lg hover:bg-slate-700/50"
                >
                  <span>ℹ️</span>
                  <span>О проекте</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
