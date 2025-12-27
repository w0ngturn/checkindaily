"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface DashboardStats {
  totalUsers: number
  totalCheckins: number
  averageStreak: number
  activeTodayCount: number
  topTier: { tier: string; count: number }[]
}

interface UserData {
  fid: number
  username: string
  streak_count: number
  total_checkins: number
  total_points: number
  tier: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      const data = await response.json()
      setStats(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/dashboard/users")
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchStats(), fetchUsers()])
      setLoading(false)
    }

    loadData()
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground p-4 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
            <p className="mt-4 text-muted">Loading dashboard...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Production Dashboard</h1>
          <p className="text-muted mt-2">Real-time CHECKIN mini app statistics</p>
          <p className="text-xs text-muted mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>

        {stats && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="p-6 border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900">
              <div className="text-sm text-muted font-semibold">Total Users</div>
              <div className="mt-2 text-3xl font-bold text-cyan-400">{stats.totalUsers}</div>
            </Card>

            <Card className="p-6 border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900">
              <div className="text-sm text-muted font-semibold">Total Check-ins</div>
              <div className="mt-2 text-3xl font-bold text-cyan-400">{stats.totalCheckins}</div>
            </Card>

            <Card className="p-6 border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900">
              <div className="text-sm text-muted font-semibold">Average Streak</div>
              <div className="mt-2 text-3xl font-bold text-cyan-400">{stats.averageStreak.toFixed(1)} days</div>
            </Card>

            <Card className="p-6 border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900">
              <div className="text-sm text-muted font-semibold">Active Today</div>
              <div className="mt-2 text-3xl font-bold text-cyan-400">{stats.activeTodayCount}</div>
            </Card>
          </div>
        )}

        {stats && (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 mb-8">
            <Card className="p-6 border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 lg:col-span-3">
              <h2 className="text-lg font-bold text-foreground mb-4">Tier Distribution</h2>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                {stats.topTier.map((item) => (
                  <div key={item.tier} className="p-3 rounded-lg bg-blue-900/50 border border-blue-700">
                    <div className="text-xs text-muted uppercase font-semibold">{item.tier}</div>
                    <div className="mt-1 text-2xl font-bold text-cyan-400">{item.count}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        <Card className="border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900">
          <div className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Active Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-700">
                    <th className="text-left py-3 px-3 text-muted">FID</th>
                    <th className="text-left py-3 px-3 text-muted">Username</th>
                    <th className="text-left py-3 px-3 text-muted">Streak</th>
                    <th className="text-left py-3 px-3 text-muted">Total Check-ins</th>
                    <th className="text-left py-3 px-3 text-muted">Points</th>
                    <th className="text-left py-3 px-3 text-muted">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.fid} className="border-b border-blue-700 hover:bg-blue-900/50 transition-colors">
                      <td className="py-3 px-3 text-foreground">{user.fid}</td>
                      <td className="py-3 px-3 text-cyan-400 font-semibold">@{user.username}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-900 px-2 py-1 text-xs font-semibold">
                          🔥 {user.streak_count}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-foreground">{user.total_checkins}</td>
                      <td className="py-3 px-3 text-yellow-400 font-semibold">{user.total_points}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center rounded-full bg-cyan-400/20 px-2 py-1 text-xs font-semibold text-cyan-400">
                          {user.tier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
