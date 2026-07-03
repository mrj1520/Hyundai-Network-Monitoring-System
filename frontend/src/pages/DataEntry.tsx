import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { 
  Database, MapPin, Network, Power, Wifi, CheckCircle2, ChevronRight, ChevronLeft, ArrowRight, ShieldCheck 
} from 'lucide-react'

export const DataEntry: React.FC = () => {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  
  // Stepper state
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form values state
  const [formData, setFormData] = useState({
    site_id: '',
    isp_id: '',
    download_speed: '95.5',
    upload_speed: '45.2',
    ping: '12.4',
    jitter: '1.2',
    packet_loss: '0.0',
    bandwidth_utilization: '48.5',
    internet_status: 'Connected',
    power_status: 'ON',
    remarks: ''
  })

  // 1. Fetch sites and ISPs lists
  const { data: sitesData } = useQuery({
    queryKey: ['entry-sites'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/sites', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    }
  })

  const { data: ispsData } = useQuery({
    queryKey: ['entry-isps'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/isps', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    }
  })

  const sites = sitesData?.data || []
  const isps = ispsData?.data || []

  // 2. Metric submission mutation
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch('/api/v1/metrics/input', {
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
        setSuccessMsg("Hyundai NOC Telemetry metrics published successfully. Dashboards updated in real-time.")
        setFormData({
          site_id: '',
          isp_id: '',
          download_speed: '95.5',
          upload_speed: '45.2',
          ping: '12.4',
          jitter: '1.2',
          packet_loss: '0.0',
          bandwidth_utilization: '48.5',
          internet_status: 'Connected',
          power_status: 'ON',
          remarks: ''
        })
        setCurrentStep(1)
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-charts'] })
        queryClient.invalidateQueries({ queryKey: ['incidents-list'] })
      } else {
        setErrorMsg(result.detail || "Metrics submission failed.")
      }
    },
    onError: () => {
      setErrorMsg("Failed to submit telemetry parameters. Verify backend server.")
    }
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    // Basic step validation
    if (currentStep === 1) {
      if (!formData.site_id || !formData.isp_id) {
        setErrorMsg("Please select both a Branch Site and telecom ISP carrier.")
        return
      }
    }
    setErrorMsg(null)
    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    setErrorMsg(null)
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg(null)
    setErrorMsg(null)
    
    // Parse speed values to float representation
    const payload = {
      site_id: formData.site_id,
      isp_id: formData.isp_id,
      download_speed: parseFloat(formData.download_speed),
      upload_speed: parseFloat(formData.upload_speed),
      ping: parseFloat(formData.ping),
      jitter: parseFloat(formData.jitter),
      packet_loss: parseFloat(formData.packet_loss),
      bandwidth_utilization: parseFloat(formData.bandwidth_utilization),
      internet_status: formData.internet_status,
      power_status: formData.power_status
    }

    mutation.mutate(payload)
  }

  const selectedSite = sites.find((s: any) => s.id === formData.site_id)
  const selectedIsp = isps.find((i: any) => i.id === formData.isp_id)

  const stepsList = [
    { num: 1, label: 'General Info', icon: MapPin },
    { num: 2, label: 'Network Metrics', icon: Network },
    { num: 3, label: 'Power Info', icon: Power },
    { num: 4, label: 'Remarks & Status', icon: Wifi },
    { num: 5, label: 'Review & Submit', icon: ShieldCheck }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-brand-blue/10 text-brand-blue animate-pulse">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-200">
            Daily Monitoring Entry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hyundai NOC Stepper Form. Publish daily performance telemetry.
          </p>
        </div>
      </div>

      {/* 5-Step Progress Stepper Header */}
      <div className="p-4 rounded-3xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800 flex justify-between items-center overflow-x-auto gap-4">
        {stepsList.map((s) => {
          const StepIcon = s.icon
          const isActive = currentStep === s.num
          const isCompleted = currentStep > s.num
          return (
            <div key={s.num} className="flex items-center gap-2.5 flex-shrink-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${
                isActive 
                  ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/20 scale-105' 
                  : isCompleted 
                    ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}>
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs font-semibold hidden md:inline ${
                isActive ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
              {s.num < 5 && <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block" />}
            </div>
          )
        })}
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl flex items-start gap-3 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 text-sm glow-green">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-500" />
          <p>{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-sm glow-red animate-pulse">
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Stepper Card Body */}
      <div className="p-8 rounded-3xl bg-white dark:bg-brand-dark/40 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[320px] flex flex-col justify-between">
        
        {/* STEP 1: GENERAL INFO */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Step 1: General Branch Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Monitoring Branch Site
                </label>
                <select
                  name="site_id"
                  value={formData.site_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                >
                  <option value="">Select site branch...</option>
                  {sites.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} Branch</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Primary Telecom Carrier ISP
                </label>
                <select
                  name="isp_id"
                  value={formData.isp_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                >
                  <option value="">Select carrier ISP...</option>
                  {isps.map((i: any) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: NETWORK METRICS */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Step 2: Network Latency & Bandwidth Speeds
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Download Speed (Mbps)</label>
                <input
                  type="number"
                  step="0.01"
                  name="download_speed"
                  value={formData.download_speed}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Upload Speed (Mbps)</label>
                <input
                  type="number"
                  step="0.01"
                  name="upload_speed"
                  value={formData.upload_speed}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Ping Latency (ms)</label>
                <input
                  type="number"
                  step="0.1"
                  name="ping"
                  value={formData.ping}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Jitter (ms)</label>
                <input
                  type="number"
                  step="0.1"
                  name="jitter"
                  value={formData.jitter}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Packet Loss (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="packet_loss"
                  value={formData.packet_loss}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Bandwidth Utilization (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="bandwidth_utilization"
                  value={formData.bandwidth_utilization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: POWER INFORMATION */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Step 3: Power Grid telemetry
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Power Grid Status</label>
                <select
                  name="power_status"
                  value={formData.power_status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 text-xs focus:outline-none"
                >
                  <option value="ON">ON (Active main grid power)</option>
                  <option value="OFF">OFF (Power failure / blackout)</option>
                  <option value="Backup">Backup (UPS / generator grid)</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: AVAILABILITY & REMARKS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Step 4: Internet Status & Operators Remarks
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Internet Line Status</label>
                <select
                  name="internet_status"
                  value={formData.internet_status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 text-xs focus:outline-none"
                >
                  <option value="Connected">Connected</option>
                  <option value="Disconnected">Disconnected</option>
                  <option value="Unstable">Unstable</option>
                  <option value="Degraded">Degraded</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Remarks / Observations</label>
                <textarea
                  name="remarks"
                  placeholder="Insert notes regarding network stability, carrier work, or weather changes."
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-4 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & SUBMIT */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Step 5: Review NOC Parameter Sheet
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1 border-slate-200/55 dark:border-slate-850">
                  <span className="text-slate-400 text-xs">Branch:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedSite?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-slate-200/55 dark:border-slate-850">
                  <span className="text-slate-400 text-xs">ISP Provider:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedIsp?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-slate-200/55 dark:border-slate-850">
                  <span className="text-slate-400 text-xs">Download Speed:</span>
                  <span className="font-mono font-bold text-brand-blue">{formData.download_speed} Mbps</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-slate-200/55 dark:border-slate-850">
                  <span className="text-slate-400 text-xs">Upload Speed:</span>
                  <span className="font-mono font-bold text-brand-blue">{formData.upload_speed} Mbps</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-slate-200/55 dark:border-slate-850">
                  <span className="text-slate-400 text-xs">Ping Latency:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-350">{formData.ping} ms</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1 border-slate-200/55 dark:border-slate-850">
                  <span className="text-slate-400 text-xs">Jitter:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-350">{formData.jitter} ms</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-slate-200/55 dark:border-slate-850">
                  <span className="text-slate-400 text-xs">Packet Loss:</span>
                  <span className={`font-mono font-bold ${parseFloat(formData.packet_loss) > 0 ? 'text-red-500' : 'text-green-500'}`}>{formData.packet_loss}%</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-slate-200/55 dark:border-slate-850">
                  <span className="text-slate-400 text-xs">Line Utilization:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-350">{formData.bandwidth_utilization}%</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-slate-200/55 dark:border-slate-850">
                  <span className="text-slate-400 text-xs">Carrier Line:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.internet_status}</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-slate-200/55 dark:border-slate-850">
                  <span className="text-slate-400 text-xs">Power Status:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.power_status}</span>
                </div>
              </div>

              {formData.remarks && (
                <div className="col-span-1 md:col-span-2 pt-2 space-y-1">
                  <span className="text-slate-500 text-xs">Remarks:</span>
                  <p className="p-3 bg-white dark:bg-brand-navy rounded-xl border border-slate-100 dark:border-slate-850 text-xs italic text-slate-600 dark:text-slate-400">
                    {formData.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form control actions at bottom */}
        <div className="flex justify-between items-center pt-6 mt-8 border-t border-slate-100 dark:border-slate-800/80">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-xs font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-brand-blue/15"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-green-500/15"
            >
              {mutation.isPending ? "Publishing..." : (
                <>
                  Publish NOC Telemetry
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
