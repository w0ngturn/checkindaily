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

export async function GET() {
  try {
    const supabase = await getSupabaseClient()

    const { count: totalUsers } = await supabase.from("users_checkins").select("*", { count: "exact", head: true })

    const { count: totalCheckIns } = await supabase.from("checkin_history").select("*", { count: "exact", head: true })

    const { data: pointsData } = await supabase
      .from("user_rewards")
      .select("total_points")
      .then((res) => ({
        data: res.data?.reduce((sum, user) => sum + (user.total_points || 0), 0),
      }))

    const { count: activeStreaks } = await supabase
      .from("users_checkins")
      .select("*", { count: "exact", head: true })
      .gt("streak_count", 0)

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalCheckIns: totalCheckIns || 0,
      totalPointsAwarded: pointsData || 0,
      activeStreaks: activeStreaks || 0,
    })
  } catch (error) {
    console.error("[admin] Stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
