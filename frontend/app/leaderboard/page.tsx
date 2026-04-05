'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface LeaderboardEntry {
  rank: number
  user_id: number
  user_name: string
  xp: number
  level: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/gamification/leaderboard`)
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data.leaderboard || [])
      }
    } catch (err) {
      console.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-slate-400 hover:text-white transition flex items-center gap-2 mb-2">
              ← На главную
            </Link>
            <h1 className="text-3xl font-bold text-white">🏆 Таблица лидеров</h1>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-slate-400">Загрузка...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <p className="text-4xl mb-4">😔</p>
            <p>Пока никто не участвует в рейтинге</p>
            <Link href="/scenarios" className="text-cyan-400 hover:underline mt-4 inline-block">
              Стать первым!
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.user_id}
                className={`flex items-center gap-4 p-4 rounded-xl border ${
                  entry.rank <= 3
                    ? 'bg-slate-800/50 border-yellow-500/30'
                    : 'bg-slate-800/30 border-slate-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  entry.rank === 1 ? 'bg-yellow-500 text-black' :
                  entry.rank === 2 ? 'bg-gray-400 text-black' :
                  entry.rank === 3 ? 'bg-orange-600 text-white' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {entry.rank}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{entry.user_name}</div>
                  <div className="text-sm text-slate-400">Уровень {entry.level}</div>
                </div>
                <div className="text-xl font-bold text-cyan-400">
                  {entry.xp} XP
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}