'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthContext'
import { useTheme } from './ThemeContext'

export function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  if (pathname?.startsWith('/(auth)')) return null

  return (
    <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-cyan-400 hover:text-cyan-300 transition">
            🛡️ CyberSimulator
          </Link>

          <nav className="flex items-center gap-4">
            <Link 
              href="/scenarios" 
              className="text-slate-300 hover:text-cyan-400 transition"
            >
              Сценарии
            </Link>
            <Link 
              href="/leaderboard" 
              className="text-slate-300 hover:text-cyan-400 transition"
            >
              Рейтинг
            </Link>
            
            <button
              onClick={toggleTheme}
              className="text-slate-300 hover:text-cyan-400 transition p-2"
              title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/profile" 
                  className="text-slate-300 hover:text-cyan-400 transition"
                >
                  👤 {user?.name || 'Профиль'}
                </Link>
                {user?.roles?.includes('ADMIN') && (
                  <Link 
                    href="/admin" 
                    className="text-slate-300 hover:text-cyan-400 transition"
                  >
                    ⚙️ Админ
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  Выход
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="text-slate-300 hover:text-cyan-400 transition"
                >
                  Войти
                </Link>
                <Link 
                  href="/register" 
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}