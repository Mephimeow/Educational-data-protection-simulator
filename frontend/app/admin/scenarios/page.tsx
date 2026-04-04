'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { authService, isAdmin } from '@/lib/auth'

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
  color: string
  threat_type: string
  threat_level: string
  levels?: Level[]
}

export default function AdminScenariosPage() {
  const { user, loading } = useAuth()
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null)
  const [editingLevel, setEditingLevel] = useState<Level | null>(null)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && isAdmin(user)) {
      fetchScenarios()
    } else if (!loading && !isAdmin(user)) {
      setLoadingData(false)
    }
  }, [user, loading])

  const fetchScenarios = async () => {
    try {
      setLoadingData(true)
      const res = await fetch(`${API_URL}/api/v1/scenarios`)
      const data = await res.json()
      setScenarios(data.scenarios || [])
    } catch (err) {
      setError('Failed to load scenarios')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSaveScenario = async (scenario: Partial<Scenario>) => {
    try {
      const method = editingScenario?.id ? 'PUT' : 'POST'
      const url = editingScenario?.id 
        ? `${API_URL}/api/v1/scenarios/${editingScenario.id}`
        : `${API_URL}/api/v1/scenarios`
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario),
      })
      
      if (!res.ok) throw new Error('Failed to save scenario')
      setEditingScenario(null)
      fetchScenarios()
    } catch (err) {
      setError('Failed to save scenario')
    }
  }

  const handleDeleteScenario = async (id: string) => {
    if (!confirm('Удалить этот сценарий и все его уровни?')) return
    
    try {
      await fetch(`${API_URL}/api/v1/scenarios/${id}`, { method: 'DELETE' })
      fetchScenarios()
    } catch (err) {
      setError('Failed to delete scenario')
    }
  }

  const handleSaveLevel = async (level: Partial<Level>) => {
    try {
      const method = editingLevel?.id ? 'PUT' : 'POST'
      const url = editingLevel?.id 
        ? `${API_URL}/api/v1/levels/${editingLevel.id}`
        : `${API_URL}/api/v1/levels`
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(level),
      })
      
      if (!res.ok) throw new Error('Failed to save level')
      setEditingLevel(null)
      fetchScenarios()
    } catch (err) {
      setError('Failed to save level')
    }
  }

  const handleDeleteLevel = async (id: number) => {
    if (!confirm('Удалить этот уровень?')) return
    
    try {
      await fetch(`${API_URL}/api/v1/levels/${id}`, { method: 'DELETE' })
      fetchScenarios()
    } catch (err) {
      setError('Failed to delete level')
    }
  }

  if (loading || loadingData) {
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
          <Link href="/" className="text-cyan-400 hover:underline">← На главную</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-slate-400 hover:text-white transition">
              ← Админка
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium">Управление сценариями</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">📚 Управление сценариями</h1>
          <button
            onClick={() => setEditingScenario({} as Scenario)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition"
          >
            + Новый сценарий
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {editingScenario !== null && !editingLevel && (
          <ScenarioEditor
            scenario={editingScenario}
            onSave={handleSaveScenario}
            onCancel={() => setEditingScenario(null)}
          />
        )}

        {editingLevel !== null && (
          <LevelEditor
            level={editingLevel}
            scenarios={scenarios}
            onSave={handleSaveLevel}
            onCancel={() => setEditingLevel(null)}
          />
        )}

        <div className="space-y-6">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="p-6 bg-slate-700/30 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{scenario.icon}</span>
                    <div>
                      <h2 className="text-xl font-bold text-white">{scenario.title}</h2>
                      <p className="text-slate-400 text-sm">{scenario.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingScenario(scenario)
                        setActiveTab(scenario.id)
                      }}
                      className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteScenario(scenario.id)}
                      className="bg-red-600/50 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Уровни ({scenario.levels?.length || 0})</h3>
                  <button
                    onClick={() => setEditingLevel({ scenario_id: scenario.id } as Level)}
                    className="bg-green-600/50 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    + Добавить уровень
                  </button>
                </div>
                
                {scenario.levels && scenario.levels.length > 0 ? (
                  <div className="grid gap-3">
                    {scenario.levels.map((level) => (
                      <div key={level.id} className="bg-slate-700/30 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{level.icon}</span>
                          <div>
                            <div className="text-white font-medium">{level.name}</div>
                            <div className="text-slate-400 text-sm">
                              {level.attack} • {level.difficulty} • {level.sandbox}:{level.sandbox_port}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingLevel(level)}
                            className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDeleteLevel(level.id)}
                            className="bg-red-600/50 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">Нет уровней</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScenarioEditor({ 
  scenario, 
  onSave, 
  onCancel 
}: { 
  scenario: Scenario | null
  onSave: (s: Partial<Scenario>) => void
  onCancel: () => void 
}) {
  const [form, setForm] = useState<Partial<Scenario>>(scenario || {
    id: '',
    title: '',
    description: '',
    icon: '🏢',
    color: 'blue',
    threat_type: 'phishing',
    threat_level: 'medium',
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold text-white mb-6">
          {scenario?.id ? 'Редактировать сценарий' : 'Новый сценарий'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">ID (slug)</label>
            <input
              type="text"
              value={form.id || ''}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              disabled={!!scenario?.id}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
              placeholder="office"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Название</label>
            <input
              type="text"
              value={form.title || ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              placeholder="🏢 Офис"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Описание</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Иконка</label>
              <input
                type="text"
                value={form.icon || ''}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Цвет</label>
              <select
                value={form.color || 'blue'}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="blue">Синий</option>
                <option value="green">Зелёный</option>
                <option value="purple">Фиолетовый</option>
                <option value="red">Красный</option>
                <option value="amber">Оранжевый</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Уровень угрозы</label>
              <select
                value={form.threat_level || 'medium'}
                onChange={(e) => setForm({ ...form, threat_level: e.target.value as any })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
                <option value="critical">Критический</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="px-4 py-2 text-slate-300 hover:text-white">
            Отмена
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}

function LevelEditor({ 
  level, 
  scenarios,
  onSave, 
  onCancel 
}: { 
  level: Level | null
  scenarios: Scenario[]
  onSave: (l: Partial<Level>) => void
  onCancel: () => void 
}) {
  const [form, setForm] = useState<Partial<Level>>(level || {
    scenario_id: scenarios[0]?.id || '',
    name: '',
    attack: '',
    icon: '📧',
    difficulty: 'Легко',
    theory: '',
    action: '',
    correct_action: '',
    sandbox: 'phishing',
    sandbox_port: 9081,
    order: 1,
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6">
          {level?.id ? 'Редактировать уровень' : 'Новый уровень'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Сценарий</label>
            <select
              value={form.scenario_id || ''}
              onChange={(e) => setForm({ ...form, scenario_id: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Название</label>
              <input
                type="text"
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Тип атаки</label>
              <input
                type="text"
                value={form.attack || ''}
                onChange={(e) => setForm({ ...form, attack: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Иконка</label>
              <input
                type="text"
                value={form.icon || ''}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Сложность</label>
              <select
                value={form.difficulty || 'Легко'}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="Легко">Легко</option>
                <option value="Средне">Средне</option>
                <option value="Сложно">Сложно</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Sandbox</label>
              <input
                type="text"
                value={form.sandbox || ''}
                onChange={(e) => setForm({ ...form, sandbox: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Порт</label>
              <input
                type="number"
                value={form.sandbox_port || 9081}
                onChange={(e) => setForm({ ...form, sandbox_port: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Теория (HTML)</label>
            <textarea
              value={form.theory || ''}
              onChange={(e) => setForm({ ...form, theory: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm"
              rows={6}
              placeholder="<h3>Заголовок</h3><p>Текст теории...</p>"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Задание</label>
            <input
              type="text"
              value={form.action || ''}
              onChange={(e) => setForm({ ...form, action: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Правильное решение</label>
            <input
              type="text"
              value={form.correct_action || ''}
              onChange={(e) => setForm({ ...form, correct_action: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Порядок</label>
            <input
              type="number"
              value={form.order || 1}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
              className="w-24 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="px-4 py-2 text-slate-300 hover:text-white">
            Отмена
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}
