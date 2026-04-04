const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8080'

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
  accessToken: string
}

export interface UserRoleResponse {
  id: number
  roleName: string
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
  userRoles: UserRoleResponse[]
}

class AuthService {
  private accessToken: string | null = null

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await fetch(`${AUTH_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Login failed' }))
      throw new Error(error.message || 'Login failed')
    }

    const response: AuthResponse = await res.json()
    this.accessToken = response.accessToken
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.accessToken)
    }
    return response
  }

  async register(data: RegisterRequest): Promise<void> {
    const res = await fetch(`${AUTH_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...data,
        phone: normalizePhone(data.phone),
      }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Registration failed' }))
      throw new Error(error.message || 'Registration failed')
    }
  }

  async logout(): Promise<void> {
    await fetch(`${AUTH_API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    this.accessToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
    }
  }

  async refresh(): Promise<AuthResponse> {
    const res = await fetch(`${AUTH_API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!res.ok) {
      this.accessToken = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
      }
      throw new Error('Refresh failed')
    }

    const response: AuthResponse = await res.json()
    this.accessToken = response.accessToken
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.accessToken)
    }
    return response
  }

  async getCurrentUser(): Promise<User> {
    const token = this.getAccessToken()
    if (!token) {
      throw new Error('Not authenticated')
    }

    const res = await fetch(`${AUTH_API_URL}/api/users/whoami`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
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

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null
  }
}

export const authService = new AuthService()

export function getRoles(user: User | null): string[] {
  return user?.userRoles?.map(r => r.roleName) || []
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
