import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { processCheckin } from "@/lib/checkin-service"

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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { fid, username, displayName, pfpUrl } = body

    if (!fid || isNaN(Number(fid))) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 })
    }

    const supabase = await getSupabaseClient()

    // Update user info if provided
    if (username || displayName || pfpUrl) {
      await supabase.from("users_checkins").upsert(
        {
          fid,
          username: username || null,
          display_name: displayName || null,
          pfp_url: pfpUrl || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "fid" },
      )
    }

    const result = await processCheckin(fid)

    console.log("[v0] Check-in result for FID", fid, ":", result)

    if (result.alreadyCheckedIn) {
      return NextResponse.json(
        {
          success: true,
          alreadyCheckedIn: true,
          streak: result.streak,
          message: "Already checked in today!",
        },
        { status: 200 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        alreadyCheckedIn: false,
        streak: result.streak,
        pointsEarned: result.pointsEarned || 10,
        tier: result.tier,
        message: "Check-in successful!",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Client checkin error:", error)
    return NextResponse.json({ error: "Check-in failed", details: String(error) }, { status: 500 })
  }
}
