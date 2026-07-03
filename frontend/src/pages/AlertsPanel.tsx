import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/StatusBadge'
import { AlertCircle, CheckCircle, Clock, ShieldAlert, CheckSquare } from 'lucide-react'

export const AlertsPanel: React.FC = () => {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const [siteFilter, setSiteFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)
  const [ackRemarks, setAckRemarks] = useState<string>('')

  // 1. Fetch branch sites
  const { data: sitesData } = useQuery({
    queryKey: ['alerts-sites'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/sites', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    }
  })

  // 2. Fetch alerts
  const { data: alertsData, isLoading, refetch } = useQuery({
    queryKey: ['alerts-list', siteFilter, statusFilter],
    queryFn: async () => {
      let url = '/api/v1/alerts?'
      if (siteFilter) url += `site_id=${siteFilter}&`
      if (statusFilter) url += `status=${statusFilter}&`
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    }
  })

  // 3. Acknowledge mutation
  const mutation = useMutation({
    mutationFn: async ({ alertId, remarks }: { alertId: string; remarks: string }) => {
      const response = await fetch(`/api/v1/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ remarks })
      })
      return response.json()
    },
    onSuccess: (result) => {
      if (result.success) {
        setSelectedAlertId(null)
        setAckRemarks('')
        queryClient.invalidateQueries({ queryKey: ['alerts-list'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      }
    }
  })

  const handleAcknowledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAlertId) return
    mutation.mutate({ alertId: selectedAlertId, remarks: ackRemarks })
  }

  const sites = sitesData?.data || []
  const alerts = alertsData?.data || []

  // Check if current user has operations access to acknowledge
  const canAcknowledge = user && ['Admin', 'NOC_Engineer'].includes(user.role)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-200">
              NOC Active Alerts Console
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Stateful alerts generated dynamically using business calculation rules.
            </p>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="p-4 rounded-2xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800/80 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Branch Sites</option>
            {sites.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name} Branch</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">Unresolved Alerts</option>
            <option value="Open">Open</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 transition-colors"
        >
          Force Sync
        </button>
      </div>

      {/* Main layout: Alerts List and Detail Overlay */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-white dark:bg-brand-dark/20 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4 glow-green" />
              <h3 className="text-md font-bold text-slate-700 dark:text-slate-300">All Operations Clear</h3>
              <p className="text-xs text-slate-400 mt-1">No pending status warnings flagged.</p>
            </div>
          ) : (
            alerts.map((alert: any) => (
              <div 
                key={alert.id}
                onClick={() => setSelectedAlertId(selectedAlertId === alert.id ? null : alert.id)}
                className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer bg-white dark:bg-brand-dark/40 ${
                  selectedAlertId === alert.id 
                    ? 'border-brand-blue ring-1 ring-brand-blue shadow-lg scale-[1.01]' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      alert.severity === 'Critical' ? 'bg-red-500 animate-ping' : 'bg-amber-500 animate-pulse'
                    }`} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {alert.site_name} Branch Outage
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">
                        Category: {alert.category} • Severity: {alert.severity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <StatusBadge status={alert.status} />
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-4">
                  {alert.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Raised: {new Date(alert.created_at).toLocaleString()}
                  </span>
                  <span>Instances: {alert.occurrence_count}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected alert operations detail panel */}
        <div className="h-fit sticky top-24 p-6 rounded-3xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider">
            Alert Resolution Center
          </h3>

          {selectedAlertId ? (
            (() => {
              const selectedAlert = alerts.find((a: any) => a.id === selectedAlertId)
              if (!selectedAlert) return <p className="text-xs text-slate-400">Select an alert to inspect details.</p>
              return (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Standard Diagnostic Recommendation
                    </h4>
                    <p className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      {selectedAlert.recommendation}
                    </p>
                  </div>

                  {/* History Logs list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Incident Event Logs
                    </h4>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {selectedAlert.history.map((h: any) => (
                        <div key={h.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40 text-[11px]">
                          <div className="flex justify-between font-mono text-slate-400 mb-1">
                            <span>Status: {h.status}</span>
                            <span>{new Date(h.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">{h.remarks}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Acknowledge actions */}
                  {selectedAlert.status === 'Open' && canAcknowledge && (
                    <form onSubmit={handleAcknowledgeSubmit} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                          Resolution Remarks / Action Log
                        </label>
                        <textarea
                          placeholder="e.g. Inspecting physical link on ground. Routing traffic over primary gateway."
                          value={ackRemarks}
                          onChange={(e) => setAckRemarks(e.target.value)}
                          required
                          rows={3}
                          className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-brand-blue"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full py-2.5 rounded-xl font-bold bg-brand-blue hover:bg-blue-600 text-white transition-all flex items-center justify-center gap-2 text-xs"
                      >
                        {mutation.isPending ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckSquare className="w-4 h-4" />
                            Acknowledge Alert
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )
            })()
          ) : (
            <div className="py-12 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-3" />
              <p className="text-xs">Click any active alert to inspect diagnostic resolutions and acknowledge actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
