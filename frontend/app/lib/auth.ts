const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[\s\-\(\)]/g, '')
  if (normalized.startsWith('7') && !normalized.startsWith('+')) {
    normalized = '+' + normalized
  } else if (normalized.startsWith('8') && !normalized.startsWith('+')) {
    normalized = '+7' + normalized.slice(1)
  }
  return normalized
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  phone: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
  roles: string[]
  created_at: string
}

class AuthService {
  private accessToken: string | null = null

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Login failed' }))
      throw new Error(error.error || 'Login failed')
    }

    const response: AuthResponse = await res.json()
    this.accessToken = response.access_token
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.access_token)
      localStorage.setItem('refreshToken', response.refresh_token)
    }
    return response
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        phone: normalizePhone(data.phone),
      }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Registration failed' }))
      throw new Error(error.error || 'Registration failed')
    }

    const response: AuthResponse = await res.json()
    this.accessToken = response.access_token
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.access_token)
      localStorage.setItem('refreshToken', response.refresh_token)
    }
    return response
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken()
    if (refreshToken) {
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
    }
    this.accessToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  async refresh(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token')
    }

    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!res.ok) {
      this.accessToken = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
      throw new Error('Refresh failed')
    }

    const response: AuthResponse = await res.json()
    this.accessToken = response.access_token
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.access_token)
      localStorage.setItem('refreshToken', response.refresh_token)
    }
    return response
  }

  async getCurrentUser(): Promise<User> {
    const token = this.getAccessToken()
    if (!token) {
      throw new Error('Not authenticated')
    }

    const res = await fetch(`${API_URL}/api/v1/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      throw new Error('Failed to get user')
    }

    return res.json()
  }

  getAccessToken(): string | null {
    if (this.accessToken) return this.accessToken
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken')
    }
    return null
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken')
    }
    return null
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null
  }
}

export const authService = new AuthService()

export function getRoles(user: User | null): string[] {
  return user?.roles || []
}

export function hasRole(user: User | null, role: string): boolean {
  return getRoles(user).includes(role)
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'ADMIN')
}

export function isUser(user: User | null): boolean {
  return hasRole(user, 'USER')
}

export interface ScenarioProgress {
  scenario_id: string
  scenario_name: string
  total_levels: number
  completed: number
  success: number
}

export interface UserStats {
  total_scenarios: number
  completed_levels: number
  success_rate: number
  progress: ScenarioProgress[]
}

export async function getUserStats(): Promise<UserStats> {
  const token = authService.getAccessToken()
  if (!token) throw new Error('Not authenticated')
  
  const res = await fetch(`${API_URL}/api/v1/stats/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export async function recordLevelComplete(scenarioId: string, levelId: number, success: boolean): Promise<void> {
  const token = authService.getAccessToken()
  if (!token) throw new Error('Not authenticated')
  
  const res = await fetch(`${API_URL}/api/v1/stats/complete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scenario_id: scenarioId, level_id: levelId, success }),
  })
  
  if (!res.ok) throw new Error('Failed to record progress')
}