import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../hooks/useSocket'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line 
} from 'recharts'
import { 
  Wifi, Power, ArrowDown, ArrowUp, Activity, RefreshCw, Zap, Cpu 
} from 'lucide-react'

interface DashboardProps {
  siteId: string
}

export const CtoDashboard: React.FC<DashboardProps> = ({ siteId }) => {
  const { token } = useAuth()
  const [activeChartTab, setActiveChartTab] = useState<'speeds' | 'latency' | 'bandwidth'>('speeds')

  useSocket(siteId)

  // 1. Fetch Executive Summary Stats
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

  // 2. Fetch Chart Timeline Data
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

  const loading = summaryLoading || chartsLoading
  if (loading || !summaryData?.data || !chartsData?.data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white dark:bg-brand-dark/20 border border-slate-200 dark:border-slate-800 rounded-3xl" />
          ))}
        </div>
        <div className="h-96 bg-white dark:bg-brand-dark/20 border border-slate-200 dark:border-slate-800 rounded-3xl" />
      </div>
    )
  }

  const summary = summaryData.data
  const charts = chartsData.data
  const timeline = charts.timeline || []

  // Generate sparkline values
  const getSparklineData = (key: string) => {
    return timeline.slice(-10).map((pt: any) => ({ value: pt[key] }))
  }

  // Last metric sample
  const latestMetric = timeline[timeline.length - 1] || {
    download_speed: 0,
    upload_speed: 0,
    ping: 0,
    jitter: 0,
    packet_loss: 0,
    bandwidth_utilization: 0,
  }

  const chartTimeline = timeline.map((pt: any) => ({
    ...pt,
    timeLabel: new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }))

  return (
    <div className="space-y-6">
      {/* 1. KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Download Speed"
          value={latestMetric.download_speed}
          unit="Mbps"
          icon={ArrowDown}
          color="blue"
          sparklineData={getSparklineData('download_speed')}
        />
        <KpiCard
          title="Upload Speed"
          value={latestMetric.upload_speed}
          unit="Mbps"
          icon={ArrowUp}
          color="cyan"
          sparklineData={getSparklineData('upload_speed')}
        />
        <KpiCard
          title="Latency (Ping)"
          value={latestMetric.ping}
          unit="ms"
          icon={Activity}
          color={latestMetric.ping > 100 ? 'orange' : 'green'}
          sparklineData={getSparklineData('ping')}
        />
        <KpiCard
          title="Packet Loss"
          value={latestMetric.packet_loss}
          unit="%"
          icon={Zap}
          color={latestMetric.packet_loss > 1.0 ? 'red' : 'green'}
          sparklineData={getSparklineData('packet_loss')}
        />
      </div>

      {/* 2. Interactive Charts Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">
              Technical Performance Trends
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Select variables to render detailed line graphs
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl self-start">
            <button
              onClick={() => setActiveChartTab('speeds')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeChartTab === 'speeds' ? 'bg-white dark:bg-brand-navy shadow-md text-brand-blue' : 'text-slate-500'
              }`}
            >
              Speeds
            </button>
            <button
              onClick={() => setActiveChartTab('latency')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeChartTab === 'latency' ? 'bg-white dark:bg-brand-navy shadow-md text-brand-blue' : 'text-slate-500'
              }`}
            >
              Latency
            </button>
            <button
              onClick={() => setActiveChartTab('bandwidth')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeChartTab === 'bandwidth' ? 'bg-white dark:bg-brand-navy shadow-md text-brand-blue' : 'text-slate-500'
              }`}
            >
              Utilization
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartTab === 'speeds' ? (
              <AreaChart data={chartTimeline}>
                <defs>
                  <linearGradient id="colorDl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415511" />
                <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} unit=" M" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="download_speed" name="Download" stroke="#3B82F6" fillOpacity={1} fill="url(#colorDl)" strokeWidth={2} />
                <Area type="monotone" dataKey="upload_speed" name="Upload" stroke="#06B6D4" fillOpacity={1} fill="url(#colorUl)" strokeWidth={2} />
              </AreaChart>
            ) : activeChartTab === 'latency' ? (
              <LineChart data={chartTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415511" />
                <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} unit=" ms" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="ping" name="Latency (Ping)" stroke="#10B981" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="jitter" name="Jitter" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
              </LineChart>
            ) : (
              <AreaChart data={chartTimeline}>
                <defs>
                  <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415511" />
                <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="bandwidth_utilization" name="Bandwidth Utilization" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorUtil)" strokeWidth={2} />
                <Area type="monotone" dataKey="packet_loss" name="Packet Loss" stroke="#EF4444" fillOpacity={0.1} strokeWidth={1.5} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
