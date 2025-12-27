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

    console.log("[v0] Fetching users from users_checkins table...")

    // Get active users with their stats
    const { data: users, error: usersError } = await supabase
      .from("users_checkins")
      .select("fid, username, display_name, streak_count, total_checkins")
      .order("streak_count", { ascending: false })
      .limit(50)

    console.log("[v0] Users query result:", { count: users?.length, error: usersError?.message })

    if (!users || users.length === 0) {
      console.log("[v0] No users found in users_checkins table")
      return Response.json({ users: [] })
    }

    // Get rewards data for these users
    const fids = users.map((u: any) => u.fid)
    const { data: rewards, error: rewardsError } = await supabase
      .from("user_rewards")
      .select("fid, total_points, tier")
      .in("fid", fids)

    console.log("[v0] Rewards query result:", { count: rewards?.length, error: rewardsError?.message })

    const rewardsMap = new Map(rewards?.map((r: any) => [r.fid, r]) || [])

    const flatUsers = users.map((user: any) => {
      let displayName = "unknown"
      if (user.display_name && user.display_name !== "unknown") {
        displayName = user.display_name
      } else if (user.username && user.username !== "unknown") {
        displayName = user.username
      } else {
        displayName = `@fid_${user.fid}`
      }

      return {
        fid: user.fid,
        username: displayName,
        streak_count: user.streak_count || 0,
        total_checkins: user.total_checkins || 0,
        total_points: rewardsMap.get(user.fid)?.total_points || 0,
        tier: rewardsMap.get(user.fid)?.tier || "bronze",
      }
    })

    console.log("[v0] Returning flattened users:", { count: flatUsers.length })
    return Response.json({ users: flatUsers })
  } catch (error) {
    console.error("[v0] Dashboard users error:", error)
    return Response.json({ error: "Failed to fetch users", users: [] }, { status: 500 })
  }
}
