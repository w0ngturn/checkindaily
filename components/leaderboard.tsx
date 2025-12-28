"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

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

type SortBy = "streak" | "points" | "checkins"
type TimeFrame = "all" | "weekly" | "monthly"

const tierBadges: Record<string, { icon: string; color: string }> = {
  bronze: { icon: "🥉", color: "text-amber-600" },
  silver: { icon: "🥈", color: "text-gray-300" },
  gold: { icon: "🥇", color: "text-yellow-400" },
  platinum: { icon: "👑", color: "text-purple-400" },
}

const rankStyles: Record<number, string> = {
  1: "bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-900",
  2: "bg-gradient-to-br from-gray-300 to-gray-400 text-slate-900",
  3: "bg-gradient-to-br from-amber-600 to-amber-700 text-white",
}

interface LeaderboardProps {
  currentUserFid?: number
}

export function Leaderboard({ currentUserFid }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortBy>("streak")
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("all")
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/leaderboard?limit=10&sortBy=${sortBy}&timeFrame=${timeFrame}`)
        const data = await response.json()
        setLeaderboard(data.leaderboard || [])

        if (currentUserFid && data.leaderboard) {
          const userInLeaderboard = data.leaderboard.find((u: LeaderboardUser) => u.fid === currentUserFid)
          if (userInLeaderboard) {
            setCurrentUserRank(userInLeaderboard)
          } else if (data.currentUserRank) {
            setCurrentUserRank(data.currentUserRank)
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [sortBy, timeFrame, currentUserFid])

  const getSortLabel = (sort: SortBy) => {
    switch (sort) {
      case "streak":
        return "Streak"
      case "points":
        return "Points"
      case "checkins":
        return "Check-ins"
    }
  }

  const getSortValue = (user: LeaderboardUser) => {
    switch (sortBy) {
      case "streak":
        return user.streakCount
      case "points":
        return user.totalPoints
      case "checkins":
        return user.totalCheckins
    }
  }

  const getSortUnit = (sort: SortBy) => {
    switch (sort) {
      case "streak":
        return "days"
      case "points":
        return "pts"
      case "checkins":
        return "total"
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-4 shadow-2xl">
        <div className="mb-4 h-8 w-40 animate-pulse rounded-lg bg-blue-800" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-blue-800" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-4 shadow-2xl">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground mb-3">Community Leaderboard</h3>

        <div className="flex gap-1 mb-3 bg-blue-900/50 rounded-lg p-1">
          {(["all", "weekly", "monthly"] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                timeFrame === tf ? "bg-cyan-400 text-slate-950" : "text-muted hover:text-foreground"
              }`}
            >
              {tf === "all" ? "All Time" : tf === "weekly" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>

        {/* Sort buttons */}
        <div className="flex gap-1 bg-blue-900/50 rounded-lg p-1">
          {(["streak", "points", "checkins"] as SortBy[]).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                sortBy === sort ? "bg-cyan-400 text-slate-950" : "text-muted hover:text-foreground"
              }`}
            >
              {getSortLabel(sort)}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {leaderboard.map((user, index) => {
          const isCurrentUser = currentUserFid === user.fid
          const tierInfo = tierBadges[user.tier] || tierBadges.bronze

          return (
            <div
              key={user.fid}
              className={`flex items-center gap-3 rounded-2xl p-3 transition-all ${
                isCurrentUser ? "bg-cyan-400/20 border border-cyan-400/50" : "bg-blue-900/70 hover:bg-blue-800/70"
              }`}
            >
              {/* Rank Badge */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  rankStyles[user.rank] || "bg-blue-700 text-foreground"
                }`}
              >
                {user.rank}
              </div>

              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-blue-600">
                <Image
                  src={user.pfpUrl || "/avatar.png"}
                  alt={user.displayName}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = "/avatar.png"
                  }}
                />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.displayName || user.username || `User ${user.fid}`}
                  </p>
                  <span className={tierInfo.color}>{tierInfo.icon}</span>
                </div>
                <a
                  href={`https://warpcast.com/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 hover:underline"
                >
                  @{user.username || user.fid}
                </a>
              </div>

              {/* Stats */}
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-cyan-400">{getSortValue(user).toLocaleString()}</p>
                <p className="text-xs text-muted">{getSortUnit(sortBy)}</p>
              </div>
            </div>
          )
        })}
      </div>

      {currentUserRank && !leaderboard.find((u) => u.fid === currentUserFid) && (
        <div className="mt-4 pt-4 border-t border-blue-700">
          <p className="text-xs text-muted mb-2">Your Position</p>
          <div className="flex items-center gap-3 rounded-2xl bg-cyan-400/20 border border-cyan-400/50 p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-foreground">
              {currentUserRank.rank}
            </div>
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-cyan-400">
              <Image
                src={currentUserRank.pfpUrl || "/avatar.png"}
                alt={currentUserRank.displayName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{currentUserRank.displayName} (You)</p>
              <p className="text-xs text-cyan-400">@{currentUserRank.username}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-cyan-400">{getSortValue(currentUserRank).toLocaleString()}</p>
              <p className="text-xs text-muted">{getSortUnit(sortBy)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {leaderboard.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-muted mb-2">No users on leaderboard yet</p>
          <p className="text-xs text-muted">Be the first to check in!</p>
        </div>
      )}
    </div>
  )
}
