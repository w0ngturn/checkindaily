"use client"

import { useEffect, useState } from "react"

interface AnalyticsStats {
  fid: number
  totalCheckIns: number
  currentStreak: number
  longestStreak: number
  averagePointsPerDay: number
  totalPointsEarned: number
  checkInRate: number
  thisWeekCheckIns: number
  thisMonthCheckIns: number
}

export function AnalyticsPanel({ fid }: { fid: number }) {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/analytics/stats?fid=${fid}`)
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("[v0] Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [fid])

  if (loading) {
    return (
      <div className="rounded-4.5 border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-5.5 shadow-2xl">
        <div className="space-y-3">
          <div className="h-12 animate-pulse bg-blue-800 rounded-2xl" />
          <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="h-16 animate-pulse bg-blue-800 rounded-lg" />
            <div className="h-16 animate-pulse bg-blue-800 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="rounded-4.5 border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-5.5 shadow-2xl">
      <h3 className="text-lg font-bold text-foreground">Your Analytics</h3>

      <div className="mt-4 grid gap-3" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="rounded-2xl bg-blue-900 p-3">
          <p className="text-xs text-muted">This Week</p>
          <p className="mt-1 text-2xl font-bold text-cyan-400">{stats.thisWeekCheckIns}</p>
          <p className="text-xs text-muted mt-0.5">check-ins</p>
        </div>

        <div className="rounded-2xl bg-blue-900 p-3">
          <p className="text-xs text-muted">This Month</p>
          <p className="mt-1 text-2xl font-bold text-cyan-400">{stats.thisMonthCheckIns}</p>
          <p className="text-xs text-muted mt-0.5">check-ins</p>
        </div>

        <div className="rounded-2xl bg-blue-900 p-3">
          <p className="text-xs text-muted">Avg Points/Day</p>
          <p className="mt-1 text-2xl font-bold text-yellow-400">{stats.averagePointsPerDay}</p>
          <p className="text-xs text-muted mt-0.5">points</p>
        </div>

        <div className="rounded-2xl bg-blue-900 p-3">
          <p className="text-xs text-muted">Check-in Rate</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{stats.checkInRate}%</p>
          <p className="text-xs text-muted mt-0.5">days active</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-blue-900 p-3">
        <p className="text-xs text-muted">Total Points Earned</p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-3xl font-bold text-cyan-400">{stats.totalPointsEarned}</p>
          <p className="text-sm text-foreground">from {stats.totalCheckIns} check-ins</p>
        </div>
      </div>
    </div>
  )
}
