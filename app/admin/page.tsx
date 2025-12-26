"use client"

import { useEffect, useState } from "react"

interface DashboardStats {
  totalUsers: number
  totalCheckIns: number
  totalPointsAwarded: number
  activeStreaks: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("[admin] Stats fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-6">
          <p className="text-muted text-sm">Total Users</p>
          <p className="text-4xl font-bold text-cyan-400 mt-2">{stats?.totalUsers || 0}</p>
        </div>
        <div className="rounded-lg border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-6">
          <p className="text-muted text-sm">Total Check-Ins</p>
          <p className="text-4xl font-bold text-cyan-400 mt-2">{stats?.totalCheckIns || 0}</p>
        </div>
        <div className="rounded-lg border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-6">
          <p className="text-muted text-sm">Points Awarded</p>
          <p className="text-4xl font-bold text-cyan-400 mt-2">{stats?.totalPointsAwarded || 0}</p>
        </div>
        <div className="rounded-lg border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-6">
          <p className="text-muted text-sm">Active Streaks</p>
          <p className="text-4xl font-bold text-cyan-400 mt-2">{stats?.activeStreaks || 0}</p>
        </div>
      </div>
    </div>
  )
}
