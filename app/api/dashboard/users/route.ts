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

    const { data: users, error: usersError } = await supabase
      .from("users_checkins")
      .select("fid, username, display_name, streak_count, total_checkins")
      .order("streak_count", { ascending: false })
      .limit(50)

    if (usersError) {
      console.error("[v0] Users query error:", usersError)
    }

    if (!users || users.length === 0) {
      console.log("[v0] No users found in database")
      return Response.json({ users: [] })
    }

    console.log("[v0] Found users:", users.length)

    // Get rewards data for these users
    const fids = users.map((u: any) => u.fid)
    const { data: rewards, error: rewardsError } = await supabase
      .from("user_rewards")
      .select("fid, total_points, tier")
      .in("fid", fids)

    if (rewardsError) {
      console.error("[v0] Rewards query error:", rewardsError)
    }

    const rewardsMap = new Map(rewards?.map((r: any) => [r.fid, r]) || [])

    const flatUsers = users.map((user: any) => ({
      fid: user.fid,
      username: user.username || user.display_name || `fid_${user.fid}`,
      streak_count: user.streak_count || 0,
      total_checkins: user.total_checkins || 0,
      total_points: rewardsMap.get(user.fid)?.total_points || 0,
      tier: rewardsMap.get(user.fid)?.tier || "bronze",
    }))

    console.log("[v0] Returning flattened users:", flatUsers.length)
    return Response.json({ users: flatUsers })
  } catch (error) {
    console.error("[v0] Dashboard users error:", error)
    return Response.json({ error: "Failed to fetch users", users: [] }, { status: 500 })
  }
}
