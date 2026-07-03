import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { CeoDashboard } from './profiles/CeoDashboard'
import { CooDashboard } from './profiles/CooDashboard'
import { CtoDashboard } from './profiles/CtoDashboard'
import { MapPin, RefreshCw } from 'lucide-react'

export const DashboardLoader: React.FC = () => {
  const { user, token } = useAuth()
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')

  // 1. Fetch available branch sites
  const { data: sitesData, isLoading: sitesLoading, refetch: refetchSites } = useQuery({
    queryKey: ['dashboard-sites'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/sites', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    }
  })

  const sites = sitesData?.data || []
  
  // Set default selected site
  React.useEffect(() => {
    if (sites.length > 0 && !selectedSiteId) {
      setSelectedSiteId(sites[0].id)
    }
  }, [sites, selectedSiteId])

  if (sitesLoading || !selectedSiteId) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading branch sites...</p>
        </div>
      </div>
    )
  }

  const selectedSite = sites.find((s: any) => s.id === selectedSiteId)

  return (
    <div className="space-y-6">
      {/* Branch selector panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-blue/10 text-brand-blue">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-md font-bold text-slate-800 dark:text-slate-200">
              Branch Monitor Station
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Refreshed dynamically via websocket pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:border-brand-blue text-slate-700 dark:text-slate-300"
          >
            {sites.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name} Branch (Health: {s.health_score}%)
              </option>
            ))}
          </select>

          <button
            onClick={() => refetchSites()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Render sub-dashboards depending on user role profiles */}
      {user?.role === 'Admin' && <CtoDashboard siteId={selectedSiteId} />}
      {user?.role === 'User' && <CeoDashboard siteId={selectedSiteId} />}
    </div>
  )
}
