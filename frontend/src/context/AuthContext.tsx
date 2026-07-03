import React, { createContext, useContext, useState, useEffect } from 'react'

export interface User {
  id: string
  email: string
  role: 'Admin' | 'User'
  favorite_dashboard: string
  theme: 'light' | 'dark'
  sidebar_collapsed: boolean
}

interface AuthContextType {
  token: string | null
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
  syncPreferences: (prefs: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  };

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  };

  const syncPreferences = async (prefs: Partial<User>) => {
    if (!token || !user) return
    
    // Update local state
    const updatedUser = { ...user, ...prefs }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))

    // Sync to database
    try {
      await fetch('/api/v1/config/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          theme: prefs.theme,
          sidebar_collapsed: prefs.sidebar_collapsed,
          favorite_dashboard: prefs.favorite_dashboard
        })
      })
    } catch (e) {
      console.error('Failed to sync preferences to database', e)
    }
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated, syncPreferences }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
