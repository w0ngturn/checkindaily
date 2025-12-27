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

interface UserProfile {
  username: string
  pfp: string | null
  displayName: string | null
}

async function getDashboardData() {
  try {
    const statsRes = await fetch("http://localhost:3000/api/dashboard/stats", {
      cache: "no-store",
    })
    const stats = await statsRes.json()

    const usersRes = await fetch("http://localhost:3000/api/dashboard/users", {
      cache: "no-store",
    })
    const usersData = await usersRes.json()
    const users = usersData.users || []

    const fids = users.map((u: UserData) => u.fid)
    let profiles: Record<number, UserProfile> = {}

    if (fids.length > 0) {
      const profilesRes = await fetch(`http://localhost:3000/api/users?fids=${fids.join(",")}`, {
        cache: "no-store",
      })
      profiles = await profilesRes.json()
    }

    return { stats, users, profiles }
  } catch (error) {
    console.error("[v0] Dashboard data fetch error:", error)
    return { stats: null, users: [], profiles: {} }
  }
}

export default async function Dashboard() {
  const { stats, users, profiles } = await getDashboardData()

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
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
                  {users.map((user: UserData) => {
                    const profile = profiles?.[user.fid]

                    return (
                      <tr key={user.fid} className="border-b border-blue-700 hover:bg-blue-900/50 transition-colors">
                        <td className="py-3 px-3 text-foreground">{user.fid}</td>
                        <td className="py-3 px-3 text-cyan-400 font-semibold">
                          <div className="flex items-center gap-2">
                            <img
                              src={profile?.pfp ?? "/avatar.png"}
                              alt={`${profile?.username || `fid_${user.fid}`}`}
                              className="w-6 h-6 rounded-full"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).src = "/avatar.png"
                              }}
                            />
                            <a
                              href={profile?.username ? `https://warpcast.com/${profile.username}` : "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              @{profile?.username ?? `fid_${user.fid}`}
                            </a>
                          </div>
                        </td>
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
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
