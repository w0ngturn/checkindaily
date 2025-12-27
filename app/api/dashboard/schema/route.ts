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

    // Get all data from users_checkins to inspect structure
    const { data: allUsers, error: allUsersError } = await supabase.from("users_checkins").select("*")

    // Get count
    const { count: totalCount, error: countError } = await supabase
      .from("users_checkins")
      .select("*", { count: "exact", head: true })

    return Response.json({
      totalUsers: totalCount,
      countError: countError?.message,
      sampleUsers: allUsers?.slice(0, 5),
      columns: allUsers && allUsers.length > 0 ? Object.keys(allUsers[0]) : [],
      allUsersError: allUsersError?.message,
      dbConnected: !allUsersError,
    })
  } catch (error) {
    console.error("Schema debug error:", error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
