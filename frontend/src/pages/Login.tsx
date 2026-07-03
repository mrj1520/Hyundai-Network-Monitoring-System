import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Cpu, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  username: z.string().email({ message: "Invalid email address format." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." })
})

type LoginFormFields = z.infer<typeof loginSchema>

export const Login: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormFields>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormFields) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      
      if (result.success) {
        // Log user details and token in context
        login(result.data.token, result.data.user)
        navigate('/dashboard')
      } else {
        setErrorMsg(result.error?.message || result.message || "Invalid username or password.")
      }
    } catch (err) {
      setErrorMsg("Failed to connect to authentication server. Verify server is online.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 bg-cover bg-center px-4 relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-blue/10 blur-[100px] -top-40 -left-40 animate-pulse" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-cyan/10 blur-[100px] -bottom-40 -right-40 animate-pulse duration-4000" />

      {/* Glass login card */}
      <div className="w-full max-w-md p-8 rounded-3xl border bg-white/5 dark:bg-brand-navy/60 border-white/10 dark:border-white/10 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-blue/30 mb-4">
            <Cpu className="w-7 h-7 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Hyundai NOC
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-wider">
            NOC Monitoring Dashboard
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Operator Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                placeholder="admin@netpulse.com"
                {...register('username')}
                className="w-full pl-12 pr-4 py-3 rounded-xl border bg-white/5 border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
              />
            </div>
            {errors.username && (
              <p className="text-red-400 text-xs mt-1.5">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Security Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="w-full pl-12 pr-12 py-3 rounded-xl border bg-white/5 border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold bg-brand-blue hover:bg-blue-600 active:scale-[0.98] text-white shadow-lg shadow-brand-blue/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

        <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-400 space-y-1.5">
          <p className="font-semibold text-slate-300">Demo Operator Logins:</p>
          <div className="flex justify-between">
            <span>Admin: <strong className="text-slate-200">admin1@hyundai.com</strong></span>
            <span>Pass: <strong className="text-slate-200">admin123</strong></span>
          </div>
          <div className="flex justify-between">
            <span>User: <strong className="text-slate-200">user1@hyundai.com</strong></span>
            <span>Pass: <strong className="text-slate-200">user123</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}
