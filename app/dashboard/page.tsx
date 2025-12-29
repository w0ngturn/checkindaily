"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface DashboardStats {
  totalUsers: number
  totalCheckins: number
  averageStreak: number
  activeTodayCount: number
  topTier: { tier: string; count: number }[]
}

interface UserData {
  fid: number
  username: string | null
  pfp_url: string | null
  wallet: string | null
  streak_count: number
  total_checkins: number
  total_points: number
  tier: string
}

interface UserProfile {
  username: string
  pfp: string | null
  displayName: string | null
}

function truncateWallet(address: string | null): string {
  if (!address) return "-"
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [profiles, setProfiles] = useState<Record<number, UserProfile>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch stats
        const statsRes = await fetch("/api/dashboard/stats")
        if (!statsRes.ok) throw new Error("Failed to fetch stats")
        const statsData = await statsRes.json()
        setStats(statsData)

        // Fetch users
        const usersRes = await fetch("/api/dashboard/users")
        if (!usersRes.ok) throw new Error("Failed to fetch users")
        const usersData = await usersRes.json()
        const usersList = usersData.users || []
        setUsers(usersList)

        // Fetch profiles
        if (usersList.length > 0) {
          const fids = usersList.map((u: UserData) => u.fid)
          try {
            const profilesRes = await fetch(`/api/users?fids=${fids.join(",")}`)
            if (profilesRes.ok) {
              const profilesData = await profilesRes.json()
              setProfiles(profilesData)
            }
          } catch (e) {
            console.error("Failed to fetch profiles:", e)
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground p-4 sm:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Production Dashboard</h1>
            <p className="text-muted mt-2">Loading...</p>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 animate-pulse">
                <div className="h-4 bg-blue-800 rounded w-24 mb-2"></div>
                <div className="h-8 bg-blue-800 rounded w-16"></div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background text-foreground p-4 sm:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Production Dashboard</h1>
            <p className="text-red-400 mt-2">Error: {error}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Production Dashboard</h1>
          <p className="text-muted mt-2">Real-time CHECKIN mini app statistics</p>
          <p className="text-xs text-muted mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
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
              <div className="mt-2 text-3xl font-bold text-cyan-400">{stats.averageStreak?.toFixed(1) || 0} days</div>
            </Card>

            <Card className="p-6 border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900">
              <div className="text-sm text-muted font-semibold">Active Today</div>
              <div className="mt-2 text-3xl font-bold text-cyan-400">{stats.activeTodayCount}</div>
            </Card>
          </div>
        )}

        {stats?.topTier && stats.topTier.length > 0 && (
          <div className="grid gap-4 grid-cols-1 mb-8">
            <Card className="p-6 border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900">
              <h2 className="text-lg font-bold text-foreground mb-4">Tier Distribution</h2>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                {stats.topTier.map((item: { tier: string; count: number }) => (
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
                    <th className="text-left py-3 px-3 text-muted">Wallet</th>
                    <th className="text-left py-3 px-3 text-muted">Streak</th>
                    <th className="text-left py-3 px-3 text-muted">Total Check-ins</th>
                    <th className="text-left py-3 px-3 text-muted">Points</th>
                    <th className="text-left py-3 px-3 text-muted">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user: UserData) => {
                      const profile = profiles?.[user.fid]
                      const username = profile?.username || user.username
                      const pfp = profile?.pfp || user.pfp_url

                      return (
                        <tr key={user.fid} className="border-b border-blue-700 hover:bg-blue-900/50 transition-colors">
                          <td className="py-3 px-3 text-foreground">{user.fid}</td>
                          <td className="py-3 px-3 text-cyan-400 font-semibold">
                            <div className="flex items-center gap-2">
                              <img
                                src={pfp || "/avatar.png"}
                                alt={username || `fid_${user.fid}`}
                                className="w-6 h-6 rounded-full object-cover"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src = "/avatar.png"
                                }}
                              />
                              <a
                                href={
                                  username
                                    ? `https://warpcast.com/${username}`
                                    : `https://warpcast.com/~/profiles/${user.fid}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                @{username || `fid_${user.fid}`}
                              </a>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-foreground font-mono text-xs">
                            {user.wallet ? (
                              <a
                                href={`https://etherscan.io/address/${user.wallet}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-cyan-400 transition-colors"
                                title={user.wallet}
                              >
                                {truncateWallet(user.wallet)}
                              </a>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-900 px-2 py-1 text-xs font-semibold">
                              {user.streak_count}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-foreground">{user.total_checkins}</td>
                          <td className="py-3 px-3 text-yellow-400 font-semibold">{user.total_points}</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center rounded-full bg-cyan-400/20 px-2 py-1 text-xs font-semibold text-cyan-400 uppercase">
                              {user.tier}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 px-3 text-center text-muted">
                        No active users yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
