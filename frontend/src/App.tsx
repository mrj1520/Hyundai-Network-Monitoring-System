import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { DashboardLayout } from './layouts/DashboardLayout'
import { Login } from './pages/Login'
import { DashboardLoader } from './pages/DashboardLoader'
import { DataEntry } from './pages/DataEntry'
import { AlertsPanel } from './pages/AlertsPanel'
import { ReportsPanel } from './pages/ReportsPanel'
import { SettingsPanel } from './pages/SettingsPanel'
import { IncidentsPanel } from './pages/IncidentsPanel'

// Route protector checks if user is logged in
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Role protector checks if user role matches allowed roles
const RoleRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const { user } = useAuth()
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardLoader />} />
          
          <Route path="entry" element={
            <RoleRoute allowedRoles={['Admin']}>
              <DataEntry />
            </RoleRoute>
          } />
          
          <Route path="incidents" element={<IncidentsPanel />} />
          <Route path="alerts" element={<AlertsPanel />} />
          <Route path="reports" element={<ReportsPanel />} />
          
          <Route path="settings" element={
            <RoleRoute allowedRoles={['Admin']}>
              <SettingsPanel />
            </RoleRoute>
          } />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  )
}
