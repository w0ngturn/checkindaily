import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

async function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase config")
  }

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  })
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get("limit")) || 10
    const sortBy = url.searchParams.get("sortBy") || "streak"

    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
      .from("users_checkins")
      .select(
        `fid, username, display_name, pfp_url, streak_count, total_checkins,
         user_rewards(total_points, tier)`,
      )
      .limit(limit * 2) // Fetch extra to account for filtering

    if (error) {
      console.error("[leaderboard] Error:", error)
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
    }

    let sorted = data.sort((a: any, b: any) => {
      if (sortBy === "points") {
        const pointsA = a.user_rewards?.[0]?.total_points || 0
        const pointsB = b.user_rewards?.[0]?.total_points || 0
        return pointsB - pointsA
      } else {
        return (b.streak_count || 0) - (a.streak_count || 0)
      }
    })

    // Trim to requested limit after sorting
    sorted = sorted.slice(0, limit)

    const leaderboard = sorted.map((user: any, index: number) => ({
      rank: index + 1,
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      streakCount: user.streak_count,
      totalCheckins: user.total_checkins,
      totalPoints: user.user_rewards?.[0]?.total_points || 0,
      tier: user.user_rewards?.[0]?.tier || "bronze",
    }))

    return NextResponse.json({ leaderboard }, { status: 200 })
  } catch (error) {
    console.error("[leaderboard] Error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
