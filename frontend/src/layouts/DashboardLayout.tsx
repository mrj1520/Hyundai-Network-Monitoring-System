import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSocket } from '../hooks/useSocket'
import { 
  LayoutDashboard, AlertTriangle, FileBarChart, Settings, 
  LogOut, PlusCircle, Menu, Moon, Sun, ShieldAlert, Cpu 
} from 'lucide-react'

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme, sidebarCollapsed, setSidebarCollapsed } = useTheme()
  const { connected } = useSocket()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Determine available sidebar links based on user permissions
  const menuItems = [
    { 
      path: '/dashboard', 
      label: 'Hyundai Dashboard', 
      icon: LayoutDashboard,
      roles: ['Admin', 'User']
    },
    { 
      path: '/entry', 
      label: 'GUI Data Entry', 
      icon: PlusCircle,
      roles: ['Admin'] 
    },
    { 
      path: '/incidents', 
      label: 'Incident Tickets', 
      icon: ShieldAlert,
      roles: ['Admin', 'User']
    },
    { 
      path: '/alerts', 
      label: 'Alert Panel', 
      icon: AlertTriangle,
      roles: ['Admin', 'User']
    },
    { 
      path: '/reports', 
      label: 'SLA Reports', 
      icon: FileBarChart,
      roles: ['Admin', 'User']
    },
    { 
      path: '/settings', 
      label: 'Config Settings', 
      icon: Settings,
      roles: ['Admin'] 
    }
  ]

  const allowedMenuItems = menuItems.filter(item => user && item.roles.includes(user.role))

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      {/* 1. Top Navbar */}
      <header className="h-16 sticky top-0 z-50 flex items-center justify-between px-6 border-b bg-white/70 dark:bg-brand-navy/80 border-slate-200 dark:border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
          
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-brand-blue animate-pulse" />
            <span className="text-lg font-bold bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">
              Hyundai NOC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Connection status tag */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800">
            <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-500 animate-ping' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-slate-600 dark:text-slate-300">
              {connected ? 'Real-time Linked' : 'Connecting...'}
            </span>
          </div>

          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-slate-600" />
            ) : (
              <Sun className="w-5 h-5 text-slate-300" />
            )}
          </button>

          {/* User profile brief */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.email}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-brand-blue to-brand-cyan text-white font-bold text-sm">
              {user?.email.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 2. Collapsible Left Sidebar */}
        <aside 
          className={`h-[calc(100vh-64px)] sticky top-16 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 bg-white/50 dark:bg-brand-navy/30 backdrop-blur-sm ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <nav className="p-4 flex flex-col justify-between h-full">
            <div className="flex flex-col gap-2">
              {allowedMenuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 scale-[1.02]' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Link>
                )
              })}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-sm font-semibold">Exit Session</span>
              )}
            </button>
          </nav>
        </aside>

        {/* 3. Page viewport outlet container */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-brand-navy/10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
