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

    // Check if tables exist and have data
    const { data: usersData, error: usersError } = await supabase.from("users_checkins").select("*").limit(5)

    const { data: historyData, error: historyError } = await supabase.from("checkin_history").select("*").limit(5)

    const { data: rewardsData, error: rewardsError } = await supabase.from("user_rewards").select("*").limit(5)

    return Response.json({
      tables: {
        users_checkins: {
          count: usersData?.length || 0,
          error: usersError?.message,
          sample: usersData,
        },
        checkin_history: {
          count: historyData?.length || 0,
          error: historyError?.message,
          sample: historyData,
        },
        user_rewards: {
          count: rewardsData?.length || 0,
          error: rewardsError?.message,
          sample: rewardsData,
        },
      },
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
