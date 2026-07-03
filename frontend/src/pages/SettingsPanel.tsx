import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { 
  Settings, Save, Key, Sliders, Database, AlertCircle, CheckCircle2, UserPlus 
} from 'lucide-react'

export const SettingsPanel: React.FC = () => {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // User management form state
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [userRole, setUserRole] = useState('User')

  // 1. Fetch Thresholds
  const { data: thresholdsData, isLoading: thresholdsLoading } = useQuery({
    queryKey: ['settings-thresholds'],
    queryFn: async () => {
      const response = await fetch('/api/v1/config/thresholds', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    }
  })

  // 2. Fetch Audit Logs
  const { data: auditsData, isLoading: auditsLoading } = useQuery({
    queryKey: ['settings-audits'],
    queryFn: async () => {
      const response = await fetch('/api/v1/config/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    }
  })

  // 3. Update threshold mutation
  const thresholdMutation = useMutation({
    mutationFn: async ({ metric, good, warning, critical }: { metric: string; good: number; warning: number; critical: number }) => {
      const response = await fetch(`/api/v1/config/thresholds/${metric}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ good, warning, critical })
      })
      return response.json()
    },
    onSuccess: (result) => {
      if (result.success) {
        setSuccessMsg("Threshold parameter updated. Audit trail recorded.")
        queryClient.invalidateQueries({ queryKey: ['settings-thresholds'] })
        queryClient.invalidateQueries({ queryKey: ['settings-audits'] })
      } else {
        setErrorMsg(result.detail || "Failed to update threshold.")
      }
    }
  })

  // 4. Create User mutation
  const userMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch('/api/v1/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      return response.json()
    },
    onSuccess: (result) => {
      if (result.success) {
        setSuccessMsg(result.message)
        setUserEmail('')
        setUserPassword('')
        setUserRole('User')
        queryClient.invalidateQueries({ queryKey: ['settings-audits'] })
      } else {
        setErrorMsg(result.detail || "Failed to create user.")
      }
    }
  })

  const handleThresholdSave = (metric: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSuccessMsg(null)
    setErrorMsg(null)
    const formData = new FormData(e.currentTarget)
    const good = parseFloat(formData.get('good') as string)
    const warning = parseFloat(formData.get('warning') as string)
    const critical = parseFloat(formData.get('critical') as string)
    
    thresholdMutation.mutate({ metric, good, warning, critical })
  }

  const handleUserCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg(null)
    setErrorMsg(null)
    userMutation.mutate({ email: userEmail, password: userPassword, role: userRole })
  }

  const thresholds = thresholdsData?.data || []
  const auditLogs = auditsData?.data || []

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-brand-blue/10 text-brand-blue">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-200">
            Hyundai NOC Configuration Panel
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Modify corporate threshold guidelines, manage user roles, and inspect audit logs.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl flex items-start gap-3 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 text-sm glow-green">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-500" />
          <p>{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-sm glow-red">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Threshold Configs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {thresholdsLoading ? (
          <div className="col-span-2 h-48 bg-white dark:bg-brand-dark/20 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse" />
        ) : (
          thresholds.map((t: any) => (
            <div 
              key={t.metric}
              className="p-6 rounded-2xl border bg-white dark:bg-brand-dark/40 border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {t.metric.replace('_', ' ')} Boundaries
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">Threshold definition levels</p>
              </div>

              <form onSubmit={(e) => handleThresholdSave(t.metric, e)} className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1">Good Limit</label>
                  <input
                    type="number"
                    step="0.01"
                    name="good"
                    defaultValue={t.good}
                    className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Warning Limit</label>
                  <input
                    type="number"
                    step="0.01"
                    name="warning"
                    defaultValue={t.warning}
                    className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Critical Limit</label>
                  <input
                    type="number"
                    step="0.01"
                    name="critical"
                    defaultValue={t.critical}
                    className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="col-span-3 py-2 rounded-xl text-xs font-semibold bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white transition-all flex items-center justify-center gap-1.5 mt-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Parameters
                </button>
              </form>
            </div>
          ))
        )}
      </div>

      {/* User Creation and Management Console */}
      <div className="p-6 rounded-3xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-6">
        <div>
          <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">
            Create Operator Account
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Register new Admin or regular User profiles.
          </p>
        </div>

        <form onSubmit={handleUserCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Operator Email</label>
            <input
              type="email"
              placeholder="operator@hyundai.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Security Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">User Authorization Role</label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
            >
              <option value="Admin">Admin (Full edit / data stepper)</option>
              <option value="User">User (Read-only dashboards)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={userMutation.isPending}
            className="w-full py-2.5 rounded-xl font-bold bg-brand-blue hover:bg-blue-600 text-white text-xs transition-all flex items-center justify-center gap-1.5"
          >
            {userMutation.isPending ? "Creating..." : (
              <>
                <UserPlus className="w-4 h-4" />
                Register Operator
              </>
            )}
          </button>
        </form>
      </div>

      {/* Audit Logs Table Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">
              System Audit Trail Logs
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Read-only immutable logs capturing administrative overrides
            </p>
          </div>
        </div>

        {auditsLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-slate-900/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-mono">
            No audit trails captured.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Operator</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">IP Address</th>
                  <th className="pb-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {auditLogs.map((log: any) => (
                  <tr key={log.id} className="text-slate-700 dark:text-slate-300">
                    <td className="py-3.5 font-mono text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 font-semibold">{log.user_email}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-[10px] font-mono text-slate-500">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-slate-400">{log.ip}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.result === 'Success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
