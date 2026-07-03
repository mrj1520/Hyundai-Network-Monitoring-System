import React from 'react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string | number
  unit?: string
  trend?: {
    direction: 'up' | 'down' | 'stable'
    value: string
  }
  sparklineData?: Array<{ value: number }>
  icon: React.ComponentType<any>
  color?: string
  onClick?: () => void
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit = '',
  trend,
  sparklineData,
  icon: Icon,
  color = 'blue',
  onClick
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'green': return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'orange': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      case 'red': return 'text-red-500 bg-red-500/10 border-red-500/20 glow-red blink-border-red animate-pulse'
      case 'cyan': return 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20'
      default: return 'text-brand-blue bg-brand-blue/10 border-brand-blue/20'
    }
  }

  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-2xl border transition-all duration-300 bg-white dark:bg-brand-dark/40 border-slate-200 dark:border-slate-800 ${
        onClick ? 'cursor-pointer hover:scale-[1.02] hover:-translate-y-1' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
              {value}
            </span>
            {unit && (
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-mono">
                {unit}
              </span>
            )}
          </div>
        </div>

        <div className={`p-3 rounded-xl border ${getColorClass()}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
        {trend ? (
          <div className="flex items-center gap-1">
            {trend.direction === 'up' && (
              <span className="flex items-center text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {trend.value}
              </span>
            )}
            {trend.direction === 'down' && (
              <span className="flex items-center text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {trend.value}
              </span>
            )}
            {trend.direction === 'stable' && (
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                Stable
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs font-semibold text-slate-400 font-mono">Real-time telemetry</span>
        )}

        {sparklineData && sparklineData.length > 0 && (
          <div className="w-24 h-10 overflow-hidden opacity-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color === 'red' ? '#EF4444' : color === 'green' ? '#22C55E' : color === 'orange' ? '#F59E0B' : '#3B82F6'} 
                  fill={color === 'red' ? 'rgba(239, 68, 68, 0.1)' : color === 'green' ? 'rgba(34, 197, 94, 0.1)' : '#3B82F611'}
                  strokeWidth={1.5}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
