"use client"

import { useEffect, useState } from "react"

interface RewardsData {
  fid: number
  totalPoints: number
  tier: string
  lastRewardDate: string | null
}

const tierColors: Record<string, { bg: string; text: string; icon: string }> = {
  bronze: { bg: "bg-amber-950", text: "text-amber-400", icon: "🥉" },
  silver: { bg: "bg-slate-800", text: "text-slate-300", icon: "🥈" },
  gold: { bg: "bg-yellow-900", text: "text-yellow-400", icon: "🥇" },
  platinum: { bg: "bg-purple-900", text: "text-purple-300", icon: "👑" },
}

export function RewardsDisplay({ fid }: { fid: number }) {
  const [rewards, setRewards] = useState<RewardsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await fetch(`/api/user/rewards?fid=${fid}`)
        const data = await response.json()
        setRewards(data)
      } catch (error) {
        console.error("[v0] Error fetching rewards:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRewards()
  }, [fid])

  if (loading) {
    return (
      <div className="rounded-4.5 border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-5.5 shadow-2xl">
        <div className="h-20 animate-pulse bg-blue-800 rounded-2xl" />
      </div>
    )
  }

  if (!rewards) {
    return null
  }

  const tierInfo = tierColors[rewards.tier] || tierColors.bronze

  return (
    <div className={`rounded-4.5 border border-blue-600 ${tierInfo.bg} p-5.5 shadow-2xl`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Total Points</p>
            <div className="mt-2 flex items-end gap-2">
              <span className={`text-4xl font-bold ${tierInfo.text}`}>{rewards.totalPoints}</span>
              <span className="text-2xl">{tierInfo.icon}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Tier</p>
            <p className={`mt-1 text-xl font-bold uppercase ${tierInfo.text}`}>{rewards.tier}</p>
          </div>
        </div>

        <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rounded-2xl bg-blue-900 px-3 py-2">
            <p className="text-xs text-muted">Next Tier</p>
            <p className="mt-0.5 text-sm text-foreground">
              {rewards.tier === "platinum"
                ? "Max Tier"
                : rewards.tier === "gold"
                  ? "500 pts"
                  : rewards.tier === "silver"
                    ? "300 pts"
                    : "150 pts"}
            </p>
          </div>
          <div className="rounded-2xl bg-blue-900 px-3 py-2">
            <p className="text-xs text-muted">Rewards Rate</p>
            <p className="mt-0.5 text-sm text-cyan-400">
              {rewards.tier === "platinum"
                ? "3x"
                : rewards.tier === "gold"
                  ? "2x"
                  : rewards.tier === "silver"
                    ? "1.5x"
                    : "1x"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
