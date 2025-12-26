"use client"

import { useEffect, useState } from "react"
import { ShareStreak } from "./share-streak"

interface StreakData {
  fid: number
  streakCount: number
  totalCheckins: number
  lastCheckin: string | null
}

interface RewardsData {
  totalPoints: number
  tier: string
}

export function StreakDisplay({ fid }: { fid: number }) {
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [rewards, setRewards] = useState<RewardsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [streakRes, rewardsRes] = await Promise.all([
          fetch(`/api/user/streak?fid=${fid}`),
          fetch(`/api/user/rewards?fid=${fid}`),
        ])
        const streakData = await streakRes.json()
        const rewardsData = await rewardsRes.json()
        setStreak(streakData)
        setRewards(rewardsData)
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fid])

  if (loading) {
    return (
      <div className="rounded-4.5 border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-5.5 shadow-2xl">
        <div className="h-24 animate-pulse bg-blue-800 rounded-2xl" />
      </div>
    )
  }

  if (!streak || streak.streakCount === 0) {
    return (
      <div className="rounded-4.5 border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-5.5 shadow-2xl">
        <h3 className="text-lg font-bold text-foreground">No streak yet</h3>
        <p className="mt-2 text-muted">Check in today to start your streak!</p>
      </div>
    )
  }

  return (
    <div className="rounded-4.5 border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-5.5 shadow-2xl">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted">Current Streak</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-5xl font-bold text-cyan-400">{streak.streakCount}</span>
            <span className="text-xl text-foreground">days</span>
          </div>
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rounded-2xl bg-blue-900 p-3">
            <p className="text-xs text-muted">Total Check-ins</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{streak.totalCheckins}</p>
          </div>
          <div className="rounded-2xl bg-blue-900 p-3">
            <p className="text-xs text-muted">Last Check-in</p>
            <p className="mt-1 text-sm text-cyan-400">
              {streak.lastCheckin ? new Date(streak.lastCheckin).toLocaleDateString() : "Never"}
            </p>
          </div>
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-blue-900">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all"
            style={{ width: `${Math.min((streak.streakCount / 30) * 100, 100)}%` }}
          />
        </div>

        {rewards && (
          <ShareStreak
            fid={fid}
            streakCount={streak.streakCount}
            totalPoints={rewards.totalPoints}
            tier={rewards.tier}
          />
        )}
      </div>
    </div>
  )
}
