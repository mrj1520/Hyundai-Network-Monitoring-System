import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../hooks/useSocket'
import { StatusBadge } from '../../components/StatusBadge'
import { KpiCard } from '../../components/KpiCard'
import { 
  Heart, Wifi, Power, FileCheck, ShieldAlert, Clock, ChevronRight 
} from 'lucide-react'

interface DashboardProps {
  siteId: string
}

export const CeoDashboard: React.FC<DashboardProps> = ({ siteId }) => {
  const { token } = useAuth()
  
  // Real-time socket subscriptions bind automatically
  useSocket(siteId)

  // Fetch summary endpoint via react-query
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['dashboard-summary', siteId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/dashboard/summary?site_id=${siteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    },
    enabled: !!siteId
  })

  if (isLoading || !summaryData?.data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-white dark:bg-brand-dark/20 border border-slate-200 dark:border-slate-800" />
        ))}
      </div>
    )
  }

  const data = summaryData.data

  return (
    <div className="space-y-6">
      {/* 1. Hero Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-brand-blue/90 to-brand-cyan/90 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute w-64 h-64 bg-white/5 rounded-full -top-20 -right-20 pointer-events-none" />
          
          <div className="space-y-4 max-w-md">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
              Executive Overview
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Enterprise Infrastructure Status is Optimal
            </h1>
            <p className="text-white/80 text-sm leading-relaxed">
              Branch operations are functioning normally. All primary SLA guidelines are currently in compliance.
            </p>
            <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/70" />
                <span className="text-xs text-white/80 font-mono">
                  Checked: {new Date(data.last_updated).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 flex-shrink-0 relative">
            {/* Health radial score progress visual */}
            <div className="w-32 h-32 rounded-full border-[10px] border-white/20 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-[10px] border-white border-t-transparent animate-spin-slow duration-5000 opacity-30" />
              <span className="text-4xl font-black">{Math.round(data.health_score)}%</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/90">
              Composite Health
            </span>
          </div>
        </div>

        {/* Status card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Active Carrier Networks
            </h3>
            
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-brand-blue" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">ISP Status</span>
              </div>
              <StatusBadge status={data.internet_status} />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <Power className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Power Status</span>
              </div>
              <StatusBadge status={data.power_status} />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>SLA Compliance Code</span>
            <span className="font-semibold text-green-500">{data.today_sla >= 99.0 ? 'Exceeded' : 'Degraded'}</span>
          </div>
        </div>
      </div>

      {/* 2. Executive KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Internet Availability"
          value={data.availability_internet}
          unit="%"
          icon={Wifi}
          color="green"
        />
        
        <KpiCard
          title="SLA Compliance"
          value={data.today_sla}
          unit="%"
          icon={FileCheck}
          color="cyan"
        />

        <KpiCard
          title="Power Availability"
          value={data.availability_power}
          unit="%"
          icon={Power}
          color="orange"
        />

        <KpiCard
          title="Active Alerts"
          value={data.active_alerts_count}
          icon={ShieldAlert}
          color={data.active_alerts_count > 0 ? 'red' : 'green'}
        />
      </div>

      {/* 3. High-level Summary Insights */}
      <div className="p-6 rounded-3xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">
          Executive Operations Analysis
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Accumulated Outages Today</span>
            <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
              {data.today_downtime_minutes} Minutes
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Network SLA Rating</span>
            <span className="font-bold text-green-500">
              Excellent
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
