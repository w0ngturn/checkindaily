import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { processCheckin } from "@/lib/checkin-service"
import { getFarcasterUsername } from "@/lib/farcaster-username"

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

    const userUpdateData: any = {
      fid,
      updated_at: new Date().toISOString(),
    }

    let realUsername = username
    if (!realUsername || realUsername === "User" || realUsername === "unknown") {
      const neynarUsername = await getFarcasterUsername(Number(fid))
      if (neynarUsername) {
        realUsername = neynarUsername
      }
    }

    // Only update fields if they're provided and not empty
    if (realUsername && realUsername !== "User" && realUsername !== "unknown") {
      userUpdateData.username = realUsername
    }
    if (displayName && displayName !== "User" && displayName !== "unknown") {
      userUpdateData.display_name = displayName
    }
    if (pfpUrl && pfpUrl !== "null") {
      userUpdateData.pfp_url = pfpUrl
    }

    // Check if user exists first to preserve existing data
    const { data: existingUser } = await supabase
      .from("users_checkins")
      .select("username, display_name, pfp_url")
      .eq("fid", fid)
      .single()

    // Merge with existing data if user exists
    if (existingUser) {
      userUpdateData.username = userUpdateData.username || existingUser.username
      userUpdateData.display_name = userUpdateData.display_name || existingUser.display_name
      userUpdateData.pfp_url = userUpdateData.pfp_url || existingUser.pfp_url
    }

    console.log("[v0] Updating user with data:", userUpdateData)

    await supabase.from("users_checkins").upsert(userUpdateData, { onConflict: "fid" })

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
