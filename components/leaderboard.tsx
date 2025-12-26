"use client"

import { useEffect, useState } from "react"

interface LeaderboardUser {
  rank: number
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  streakCount: number
  totalCheckins: number
  totalPoints: number
  tier: string
}

const tierBadges: Record<string, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "👑",
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"streak" | "points">("streak")

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/leaderboard?limit=10&sortBy=${sortBy}`)
        const data = await response.json()
        setLeaderboard(data.leaderboard || [])
      } catch (error) {
        console.error("[v0] Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [sortBy])

  if (loading) {
    return (
      <div className="rounded-4.5 border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-5.5 shadow-2xl">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse bg-blue-800 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-4.5 border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-5.5 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Top Performers</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("streak")}
            className={`rounded-lg px-3 py-1 text-sm font-semibold transition-colors ${
              sortBy === "streak" ? "bg-cyan-400 text-slate-950" : "bg-blue-900 text-foreground hover:bg-blue-800"
            }`}
          >
            Streaks
          </button>
          <button
            onClick={() => setSortBy("points")}
            className={`rounded-lg px-3 py-1 text-sm font-semibold transition-colors ${
              sortBy === "points" ? "bg-cyan-400 text-slate-950" : "bg-blue-900 text-foreground hover:bg-blue-800"
            }`}
          >
            Points
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {leaderboard.map((user) => (
          <div key={user.fid} className="flex items-center justify-between rounded-2xl bg-blue-900 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 text-sm font-bold text-slate-950">
                {user.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {user.displayName || user.username || `User ${user.fid}`}
                </p>
                <p className="text-xs text-muted">@{user.username || user.fid}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-right">
              <span className="text-xl">{tierBadges[user.tier] || "🥉"}</span>
              <div>
                <p className="text-sm font-bold text-cyan-400">
                  {sortBy === "streak" ? user.streakCount : user.totalPoints}
                </p>
                <p className="text-xs text-muted">{sortBy === "streak" ? "days" : "pts"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <p className="py-8 text-center text-muted">No users on leaderboard yet. Be the first to check in!</p>
      )}
    </div>
  )
}
