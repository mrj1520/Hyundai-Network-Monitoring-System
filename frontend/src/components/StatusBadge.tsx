import React from 'react'

interface StatusBadgeProps {
  status: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status.toUpperCase()) {
      case 'CONNECTED':
      case 'ON':
      case 'HEALTHY':
      case 'RESOLVED':
        return 'bg-green-500/10 border-green-500/30 text-green-500 glow-green'
      case 'OFFLINE':
      case 'OFF':
      case 'CRITICAL':
        return 'bg-red-500/10 border-red-500/30 text-red-500 glow-red animate-pulse border-red-500 blink-border-red'
      case 'WARNING':
      case 'DEGRADED':
      case 'UNSTABLE':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-500 glow-orange animate-pulse'
      case 'BACKUP':
      case 'MAINTENANCE':
        return 'bg-blue-500/10 border-blue-500/30 text-brand-blue glow-blue'
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-500'
    }
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStyle()} font-mono transition-all duration-300`}>
      {status}
    </span>
  )
}
