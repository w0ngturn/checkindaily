import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      },
    )

    // Get total users
    const { count: totalUsers } = await supabase.from("users_checkins").select("*", { count: "exact", head: true })

    // Get total checkins
    const { count: totalCheckins } = await supabase.from("checkin_history").select("*", { count: "exact", head: true })

    // Get average streak
    const { data: streakData } = await supabase.from("users_checkins").select("streak_count")
    const averageStreak =
      streakData && streakData.length > 0
        ? streakData.reduce((sum: number, u: any) => sum + (u.streak_count || 0), 0) / streakData.length
        : 0

    // Get active today count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: activeTodayCount } = await supabase
      .from("checkin_history")
      .select("*", { count: "exact", head: true })
      .gte("checked_in_at", today.toISOString())

    // Get tier distribution
    const { data: tierData } = await supabase.from("user_rewards").select("tier")
    const tierCounts: Record<string, number> = {}
    tierData?.forEach((user: any) => {
      const tier = user.tier || "unranked"
      tierCounts[tier] = (tierCounts[tier] || 0) + 1
    })
    const topTier = Object.entries(tierCounts)
      .map(([tier, count]) => ({ tier: tier.toUpperCase(), count }))
      .sort((a, b) => b.count - a.count)

    return Response.json({
      totalUsers: totalUsers || 0,
      totalCheckins: totalCheckins || 0,
      averageStreak: Math.round(averageStreak * 10) / 10,
      activeTodayCount: activeTodayCount || 0,
      topTier,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
