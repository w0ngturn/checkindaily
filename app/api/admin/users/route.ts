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

    const { data: users } = await supabase
      .from("users_checkins")
      .select("fid, username, display_name, streak_count, total_checkins, created_at")
      .order("streak_count", { ascending: false })
      .limit(100)

    return NextResponse.json({
      users: (users || []).map((user) => ({
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        streakCount: user.streak_count,
        totalCheckins: user.total_checkins,
        createdAt: user.created_at,
      })),
    })
  } catch (error) {
    console.error("[admin] Users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
