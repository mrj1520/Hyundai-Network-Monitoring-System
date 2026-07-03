import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/StatusBadge'
import { 
  ShieldAlert, UserCheck, CheckCircle2, Clock, AlertTriangle, User, RefreshCw, X 
} from 'lucide-react'

export const IncidentsPanel: React.FC = () => {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null)
  
  // Assign modal state
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false)
  const [assignUserId, setAssignUserId] = useState<string>('')
  
  // Resolve modal state
  const [showResolveModal, setShowResolveModal] = useState<boolean>(false)
  const [resolutionRemarks, setResolutionRemarks] = useState<string>('')
  const [resolutionStatus, setResolutionStatus] = useState<string>('Resolved')

  // 1. Fetch incidents
  const { data: incidentsData, isLoading, refetch } = useQuery({
    queryKey: ['incidents-list'],
    queryFn: async () => {
      const response = await fetch('/api/v1/incidents', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    }
  })

  // 2. Assign mutation
  const assignMutation = useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const response = await fetch(`/api/v1/incidents/${id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assigned_to_user_id: userId })
      })
      return response.json()
    },
    onSuccess: (result) => {
      if (result.success) {
        setShowAssignModal(false)
        setSelectedIncidentId(null)
        setAssignUserId('')
        queryClient.invalidateQueries({ queryKey: ['incidents-list'] })
      }
    }
  })

  // 3. Resolve mutation
  const resolveMutation = useMutation({
    mutationFn: async ({ id, resolution, status }: { id: string; resolution: string; status: string }) => {
      const response = await fetch(`/api/v1/incidents/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resolution, status })
      })
      return response.json()
    },
    onSuccess: (result) => {
      if (result.success) {
        setShowResolveModal(false)
        setSelectedIncidentId(null)
        setResolutionRemarks('')
        queryClient.invalidateQueries({ queryKey: ['incidents-list'] })
      }
    }
  })

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIncidentId || !assignUserId) return
    assignMutation.mutate({ id: selectedIncidentId, userId: assignUserId })
  }

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIncidentId || !resolutionRemarks) return
    resolveMutation.mutate({ id: selectedIncidentId, resolution: resolutionRemarks, status: resolutionStatus })
  }

  const incidents = incidentsData?.data || []
  const operators = incidentsData?.meta?.operators || []
  const selectedIncident = incidents.find((i: any) => i.id === selectedIncidentId)
  const isAdmin = user?.role === 'Admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-brand-blue/10 text-brand-blue">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-200">
              Hyundai Incident Management Panel
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track operational troubleshooting lifecycles for branch threshold violations.
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4.5 h-4.5 text-slate-500" />
        </button>
      </div>

      {/* Main incidents table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="space-y-4 py-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : incidents.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4 glow-green" />
            <h3 className="text-md font-bold text-slate-700 dark:text-slate-200">Zero Open Incidents</h3>
            <p className="text-xs mt-1">Hyundai infrastructure is operating within standard parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="pb-3">Site Branch</th>
                  <th className="pb-3">Severity</th>
                  <th className="pb-3">Incident Description</th>
                  <th className="pb-3">Assignee</th>
                  <th className="pb-3">Ticket Status</th>
                  <th className="pb-3">Date Raised</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {incidents.map((incident: any) => (
                  <tr 
                    key={incident.id} 
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors ${
                      selectedIncidentId === incident.id ? 'bg-slate-50 dark:bg-slate-900/40' : ''
                    }`}
                    onClick={() => setSelectedIncidentId(incident.id)}
                  >
                    <td className="py-4 font-semibold text-slate-800 dark:text-slate-200">{incident.site_name}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        incident.severity === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="py-4 max-w-xs truncate text-slate-600 dark:text-slate-300 font-medium">
                      {incident.description}
                    </td>
                    <td className="py-4 text-slate-500 font-mono text-[10px]">{incident.assigned_to_email}</td>
                    <td className="py-4">
                      <StatusBadge status={incident.status} />
                    </td>
                    <td className="py-4 font-mono text-[10px] text-slate-400">
                      {new Date(incident.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {isAdmin && incident.status === 'Open' && (
                        <button
                          onClick={() => {
                            setSelectedIncidentId(incident.id)
                            setShowAssignModal(true)
                          }}
                          className="px-3 py-1.5 rounded-lg bg-brand-blue text-white text-[10px] font-bold hover:bg-blue-600 transition-colors inline-flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          Assign
                        </button>
                      )}
                      {isAdmin && ['Open', 'Acknowledged', 'In Progress'].includes(incident.status) && (
                        <button
                          onClick={() => {
                            setSelectedIncidentId(incident.id)
                            setShowResolveModal(true)
                          }}
                          className="ml-2 px-3 py-1.5 rounded-lg bg-green-500 text-white text-[10px] font-bold hover:bg-green-600 transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Resolve
                        </button>
                      )}
                      {!isAdmin && (
                        <span className="text-[10px] text-slate-400 italic">View Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected ticket details preview pane */}
      {selectedIncident && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ticket Details Inspector
            </h3>
            <span className="text-[10px] font-mono text-slate-400">ID: {selectedIncident.id}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p className="text-slate-500 text-xs">Alert Metric Description:</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedIncident.description}</p>
              
              <p className="text-slate-500 text-xs pt-2">Diagnostic Resolution Steps:</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-brand-navy p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {selectedIncident.recommendation}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500 text-xs">Assigned Technician:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono text-xs">{selectedIncident.assigned_to_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-xs">Troubleshooting Status:</span>
                <StatusBadge status={selectedIncident.status} />
              </div>
              {selectedIncident.resolution && (
                <div className="space-y-1">
                  <span className="text-slate-500 text-xs">Closing Resolution Notes:</span>
                  <p className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-950/30 text-xs text-green-700 dark:text-green-300 font-medium">
                    {selectedIncident.resolution}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal overlay */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button 
              onClick={() => setShowAssignModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-md font-bold text-slate-800 dark:text-slate-200 mb-4">
              Assign Incident Ticket
            </h3>
            
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Select Operator Account</label>
                <select
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                >
                  <option value="">Choose operator...</option>
                  {operators.map((op: any) => (
                    <option key={op.id} value={op.id}>{op.email}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={assignMutation.isPending}
                className="w-full py-2.5 rounded-xl font-bold bg-brand-blue hover:bg-blue-600 text-white text-xs transition-all flex justify-center"
              >
                {assignMutation.isPending ? "Assigning..." : "Acknowledge and Assign"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Resolution Modal overlay */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button 
              onClick={() => setShowResolveModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-md font-bold text-slate-800 dark:text-slate-200 mb-4">
              Resolve Incident Ticket
            </h3>
            
            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Resolution Action Log</label>
                <textarea
                  placeholder="e.g. Swapped router cables. Contacted StormFiber carrier. Restored secondary fiber link."
                  value={resolutionRemarks}
                  onChange={(e) => setResolutionRemarks(e.target.value)}
                  required
                  rows={4}
                  className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Ticket Target Status</label>
                  <select
                    value={resolutionStatus}
                    onChange={(e) => setResolutionStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                  >
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={resolveMutation.isPending}
                className="w-full py-2.5 rounded-xl font-bold bg-green-500 hover:bg-green-600 text-white text-xs transition-all flex justify-center"
              >
                {resolveMutation.isPending ? "Submitting..." : "Submit Resolution Action"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
