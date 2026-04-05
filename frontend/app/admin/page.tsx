'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { authService, isAdmin, User } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface AdminUser {
  id: number
  name: string
  email: string
  phone: string
  roles: string[]
  created_at?: string
}

interface LiveStats {
  total_users: number
  active_users_1h: number
  total_completions: number
  timestamp: number
}

export default function AdminPanel() {
  const { user, loading } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'stats'>('stats')
  
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && !isAdmin(user)) {
      setLoadingUsers(false)
      return
    }
    fetchUsers()
  }, [user, loading])

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats()
      const interval = setInterval(fetchStats, 10000)
      return () => clearInterval(interval)
    }
  }, [activeTab])

  const fetchStats = async () => {
    setLoadingStats(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/live-stats`)
      if (res.ok) {
        const data = await res.json()
        setLiveStats(data)
      }
    } catch (err) {
      console.error('Failed to load live stats')
    }
    setLoadingStats(false)
  }

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const token = authService.getAccessToken()
      const res = await fetch(`${API_URL}/api/v1/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }

  const deleteUser = async (id: number) => {
    if (!confirm('Удалить этого пользователя?')) return
    
    setDeletingId(id)
    try {
      const token = authService.getAccessToken()
      const res = await fetch(`${API_URL}/api/v1/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to delete user')
      setUsers(users.filter(u => u.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleRole = async (userId: number, roleName: string, currentlyHas: boolean) => {
    try {
      const token = authService.getAccessToken()
      const res = await fetch(`${API_URL}/api/v1/admin/users/${userId}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ roleName, granted: !currentlyHas }),
      })
      if (!res.ok) throw new Error('Failed to change role')
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change role')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

  if (!isAdmin(user)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Доступ запрещён</h1>
          <p className="text-slate-400 mb-6">У вас нет прав администратора</p>
          <Link href="/" className="text-cyan-400 hover:underline">
            ← На главную
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 text-white hover:text-cyan-400 transition">
            <span>←</span>
            <span className="text-2xl font-bold">CyberSimulator</span>
          </Link>
          <span className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm font-medium">
            Панель администратора
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Панель администратора</h1>
        </div>

        <div className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'stats'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 Статистика
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'users'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👥 Пользователи
          </button>
          <Link
            href="/admin/scenarios"
            className="px-4 py-2 font-medium text-slate-400 hover:text-white transition"
          >
            📚 Сценарии
          </Link>
        </div>

        {activeTab === 'stats' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Live статистика</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-slate-400 text-sm">Обновляется каждые 10 сек</span>
              </div>
            </div>

            {loadingStats ? (
              <div className="text-center text-slate-400 py-12">Загрузка статистики...</div>
            ) : liveStats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                    <div className="text-slate-400 text-sm mb-2">Всего пользователей</div>
                    <div className="text-4xl font-bold text-white">{liveStats.total_users}</div>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                    <div className="text-slate-400 text-sm mb-2">Активных за час</div>
                    <div className="text-4xl font-bold text-cyan-400">{liveStats.active_users_1h}</div>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                    <div className="text-slate-400 text-sm mb-2">Всего прохождений</div>
                    <div className="text-4xl font-bold text-purple-400">{liveStats.total_completions}</div>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden mb-8">
                  <iframe
                    src="http://localhost:3002/d-solo/000000012/system-monitoring?orgId=1&panelId=2"
                    className="w-full h-[500px] border-0"
                    title="Grafana Dashboard"
                  />
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 py-12">Нет данных</div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-white">Управление пользователями</h2>
              <button
                onClick={fetchUsers}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
              >
                Обновить
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {loadingUsers ? (
              <div className="text-center text-slate-400 py-12">Загрузка пользователей...</div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">ID</th>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Имя</th>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Email</th>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Телефон</th>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Роли</th>
                      <th className="text-left px-6 py-4 text-slate-300 font-medium">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {users.map((u) => {
                      const isCurrentUser = u.id === user?.id
                      const userRoles = u.roles || []
                      const hasAdmin = userRoles.includes('ADMIN')
                      const hasUser = userRoles.includes('USER')
                      
                      return (
                        <tr key={u.id} className="hover:bg-slate-700/30 transition">
                          <td className="px-6 py-4 text-slate-400">{u.id}</td>
                          <td className="px-6 py-4 text-white">{u.name || '-'}</td>
                          <td className="px-6 py-4 text-slate-300">{u.email}</td>
                          <td className="px-6 py-4 text-slate-300">{u.phone}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => toggleRole(u.id, 'USER', hasUser)}
                                disabled={isCurrentUser}
                                className={`px-3 py-1 rounded text-xs font-medium transition ${
                                  hasUser 
                                    ? 'bg-cyan-500/30 text-cyan-400 hover:bg-cyan-500/50' 
                                    : 'bg-slate-600/50 text-slate-400 hover:bg-slate-600'
                                } ${isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                USER {hasUser ? '✓' : '+'}
                              </button>
                              <button
                                onClick={() => toggleRole(u.id, 'ADMIN', hasAdmin)}
                                disabled={isCurrentUser}
                                className={`px-3 py-1 rounded text-xs font-medium transition ${
                                  hasAdmin 
                                    ? 'bg-purple-500/30 text-purple-400 hover:bg-purple-500/50' 
                                    : 'bg-slate-600/50 text-slate-400 hover:bg-slate-600'
                                } ${isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                ADMIN {hasAdmin ? '✓' : '+'}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => deleteUser(u.id)}
                              disabled={deletingId === u.id || isCurrentUser}
                              className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              {deletingId === u.id ? 'Удаление...' : 'Удалить'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center text-slate-400 py-12">Нет пользователей</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
