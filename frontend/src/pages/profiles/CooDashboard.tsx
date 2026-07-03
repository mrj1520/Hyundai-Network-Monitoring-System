import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../hooks/useSocket'
import { StatusBadge } from '../../components/StatusBadge'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Wifi, Power, Clock, AlertTriangle, ShieldCheck } from 'lucide-react'

interface DashboardProps {
  siteId: string
}

export const CooDashboard: React.FC<DashboardProps> = ({ siteId }) => {
  const { token } = useAuth()
  
  useSocket(siteId)

  // Fetch summary stats
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary', siteId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/dashboard/summary?site_id=${siteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    },
    enabled: !!siteId
  })

  // Fetch alerts list
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts-list', siteId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/alerts?site_id=${siteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    },
    enabled: !!siteId
  })

  // Fetch chart timeline
  const { data: chartsData, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard-charts', siteId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/dashboard/charts?site_id=${siteId}&days=7`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    },
    enabled: !!siteId
  })

  const loading = summaryLoading || alertsLoading || chartsLoading
  if (loading || !summaryData?.data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-white dark:bg-brand-dark/20 border border-slate-200 dark:border-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white dark:bg-brand-dark/20 border border-slate-200 dark:border-slate-800 rounded-3xl" />
          <div className="h-64 bg-white dark:bg-brand-dark/20 border border-slate-200 dark:border-slate-800 rounded-3xl" />
        </div>
      </div>
    )
  }

  const summary = summaryData.data
  const alerts = alertsData?.data || []
  const timeline = chartsData?.data?.timeline || []

  // Format date labels for chart ticks
  const chartTimeline = timeline.map((pt: any) => ({
    ...pt,
    timeLabel: new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }))

  return (
    <div className="space-y-6">
      {/* Top metric strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl border bg-white dark:bg-brand-dark/40 border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Composite Health</p>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2 font-mono">{summary.health_score}%</p>
        </div>
        <div className="p-6 rounded-2xl border bg-white dark:bg-brand-dark/40 border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Downtime (Today)</p>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2 font-mono">{summary.today_downtime_minutes} Min</p>
        </div>
        <div className="p-6 rounded-2xl border bg-white dark:bg-brand-dark/40 border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Alert Flags</p>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2 font-mono">{summary.active_alerts_count}</p>
        </div>
        <div className="p-6 rounded-2xl border bg-white dark:bg-brand-dark/40 border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">SLA Availability</p>
          <p className="text-3xl font-black text-green-500 mt-2 font-mono">{summary.today_sla}%</p>
        </div>
      </div>

      {/* Main operational view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA and performance trend chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider">
            Operational Bandwidth Load Trend
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415522" />
                <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="bandwidth_utilization" 
                  name="Bandwidth Utilization"
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents / Alerts listing */}
        <div className="p-6 rounded-3xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">
              NOC Active Alerts
            </h3>
            
            {alerts.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-3 glow-green">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All Operations Green</p>
                <p className="text-xs text-slate-400 mt-1">No active network warnings generated.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[280px] pr-1">
                {alerts.map((alert: any) => (
                  <div 
                    key={alert.id} 
                    className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 flex items-start gap-3"
                  >
                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      alert.severity === 'Critical' ? 'text-red-500 animate-pulse' : 'text-amber-500'
                    }`} />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{alert.description}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Critical Alerts</span>
            <span className="font-bold text-red-500">
              {alerts.filter((a: any) => a.severity === 'Critical').length} Open
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
