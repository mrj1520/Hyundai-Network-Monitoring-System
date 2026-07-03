import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { 
  FileText, Download, Calendar, Printer, RefreshCw, AlertCircle 
} from 'lucide-react'

export const ReportsPanel: React.FC = () => {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [reportType, setReportType] = useState<string>('SLA')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // 1. Fetch branch sites dropdown
  const { data: sitesData } = useQuery({
    queryKey: ['reports-sites'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/sites', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    }
  })

  // 2. Fetch historically generated reports
  const { data: reportsData, isLoading: reportsLoading, refetch } = useQuery({
    queryKey: ['reports-list'],
    queryFn: async () => {
      const response = await fetch('/api/v1/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    }
  })

  // 3. Trigger export mutation
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch('/api/v1/reports/export', {
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
        setSuccessMsg(`Report generated successfully: "${result.data.title}". Download started.`)
        // Auto-download exported file
        const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:8000' : ''
        window.open(`${backendUrl}${result.data.file_url}`, '_blank')
        queryClient.invalidateQueries({ queryKey: ['reports-list'] })
      } else {
        setErrorMsg(result.detail || "Failed to generate report.")
      }
    },
    onError: () => {
      setErrorMsg("Connection error exporting reports. Verify server.")
    }
  })

  const handleExportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg(null)
    setErrorMsg(null)
    
    mutation.mutate({
      site_id: selectedSiteId ? selectedSiteId : null,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate + 'T23:59:59Z').toISOString(),
      report_type: reportType
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const sites = sitesData?.data || []
  const reports = reportsData?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-brand-blue/10 text-brand-blue">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-200">
              SLA Compliance & SLA Exporter
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Compile historical SLA averages and download metric audits.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300"
        >
          <Printer className="w-4 h-4" />
          Print View
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl flex items-start gap-3 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 text-sm glow-green">
          <p>{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-sm glow-red">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compiler Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider">
            Report Exporter Form
          </h3>

          <form onSubmit={handleExportSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Site Branch Filter
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
              >
                <option value="">All branches</option>
                {sites.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} Branch</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Report Blueprint
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
              >
                <option value="SLA">SLA Compliance Report</option>
                <option value="Network">Network Performance Breakdown</option>
                <option value="Executive">NOC Executive Summary</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-3 mt-4 rounded-xl font-bold bg-brand-blue hover:bg-blue-600 text-white shadow-lg shadow-brand-blue/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              {mutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  "Export Sheet data"
                </>
              )}
            </button>
          </form>
        </div>

        {/* History table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Historically Compiled Reports
              </h3>
              <button 
                onClick={() => refetch()}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {reportsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 dark:bg-slate-900/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-3 text-slate-500" />
                <p className="text-xs">No historical export archives found.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[300px]">
                {reports.map((report: any) => {
                  const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:8000' : ''
                  return (
                    <div 
                      key={report.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{report.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Format: {report.report_type} • Compiler: {report.generated_by} • {new Date(report.timestamp).toLocaleDateString()}
                        </p>
                      </div>

                      <a
                        href={`${backendUrl}${report.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-brand-blue transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
