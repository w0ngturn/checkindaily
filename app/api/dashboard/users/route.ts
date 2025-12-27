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

    // Get active users with their stats
    const { data: users } = await supabase
      .from("users_checkins")
      .select(`
        fid,
        username,
        streak_count,
        total_checkins,
        user_rewards:fid(total_points, tier)
      `)
      .order("streak_count", { ascending: false })
      .limit(50)

    // Flatten the nested data
    const flatUsers =
      users?.map((user: any) => ({
        fid: user.fid,
        username: user.username || "unknown",
        streak_count: user.streak_count || 0,
        total_checkins: user.total_checkins || 0,
        total_points: user.user_rewards?.[0]?.total_points || 0,
        tier: user.user_rewards?.[0]?.tier || "bronze",
      })) || []

    return Response.json({ users: flatUsers })
  } catch (error) {
    console.error("Dashboard users error:", error)
    return Response.json({ error: "Failed to fetch users", users: [] }, { status: 500 })
  }
}
