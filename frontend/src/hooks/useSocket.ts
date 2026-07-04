import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'

export interface RealtimePayload {
  site_id: string
  site_name: string
  metric: {
    id: string
    download_speed: number
    upload_speed: number
    ping: number
    jitter: number
    packet_loss: number
    bandwidth_utilization: number
    internet_status: string
    power_status: string
    timestamp: string
  }
  health: {
    score: number
    internet_score: number
    power_score: number
    performance_score: number
  }
  availability: {
    internet: number
    power: number
  }
  alerts: Array<{
    id: string
    category: string
    severity: string
    status: string
    description: string
    created_at: string
  }>
}

export const useSocket = (siteId?: string) => {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState<boolean>(false)

  useEffect(() => {
    if (!token) return

    // Connect to backend Socket.IO server
    // FastAPI mounts socketio under /ws or standard root depending on configurations
    // In our app.main: sio_asgi wraps app, meaning standard client path is used
    const socketUrl = (import.meta.env.VITE_API_URL as string) || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin)
    const socketIo = io(socketUrl, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    })

    socketIo.on('connect', () => {
      setConnected(true)
      console.log('Socket.IO connection established.')
    })

    socketIo.on('disconnect', () => {
      setConnected(false)
      console.log('Socket.IO connection lost.')
    })

    // Listen for live KPI updates
    socketIo.on('kpi_updated', (payload: RealtimePayload) => {
      if (siteId && payload.site_id !== siteId) return

      console.log('Live KPI update received via Socket:', payload)

      // 1. Instantly update dashboard summary cache in react-query
      queryClient.setQueryData(['dashboard-summary', payload.site_id], (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          data: {
            ...oldData.data,
            health_score: payload.health.score,
            internet_status: payload.metric.internet_status,
            power_status: payload.metric.power_status,
            availability_internet: payload.availability.internet,
            availability_power: payload.availability.power,
            today_sla: payload.availability.internet,
            active_alerts_count: payload.alerts.length,
            last_updated: payload.metric.timestamp
          }
        }
      })

      // 2. Append data point to timeseries charts cache
      queryClient.setQueryData(['dashboard-charts', payload.site_id], (oldData: any) => {
        if (!oldData || !oldData.data) return oldData
        
        // Convert to Recharts point structure
        const newPoint = {
          timestamp: payload.metric.timestamp,
          download_speed: payload.metric.download_speed,
          upload_speed: payload.metric.upload_speed,
          ping: payload.metric.ping,
          jitter: payload.metric.jitter,
          packet_loss: payload.metric.packet_loss,
          bandwidth_utilization: payload.metric.bandwidth_utilization
        }

        const newTimeline = [...oldData.data.timeline, newPoint]
        // Cap timeline length at 50 points to prevent DOM memory bloating
        if (newTimeline.length > 50) {
          newTimeline.shift()
        }

        return {
          ...oldData,
          data: {
            ...oldData.data,
            timeline: newTimeline
          }
        }
      })

      // 3. Update alert listings cache
      queryClient.setQueryData(['alerts-list', payload.site_id], (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          data: payload.alerts
        }
      })
    })

    setSocket(socketIo)

    return () => {
      socketIo.disconnect()
    }
  }, [token, siteId, queryClient])

  return { socket, connected }
}
