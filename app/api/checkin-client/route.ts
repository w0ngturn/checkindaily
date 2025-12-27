import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { processCheckin } from "@/lib/checkin-service"

async function getFarcasterUserData(fid: number) {
  try {
    const res = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY as string,
      },
    })

    if (!res.ok) return null

    const json = await res.json()
    const user = json.users?.[0]

    if (!user) return null

    return {
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      verifiedAddress: user.verified_addresses?.eth_addresses?.[0] ?? null,
      custodyAddress: user.custody_address ?? null,
    }
  } catch (error) {
    console.error("[v0] Error fetching Farcaster user data:", error)
    return null
  }
}

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

    const farcasterData = await getFarcasterUserData(Number(fid))

    const userUpdateData: any = {
      fid,
      updated_at: new Date().toISOString(),
    }

    // Use Neynar data if available, otherwise fall back to provided data
    const realUsername = farcasterData?.username || username
    const realDisplayName = farcasterData?.displayName || displayName
    const realPfpUrl = farcasterData?.pfpUrl || pfpUrl

    if (realUsername && realUsername !== "User" && realUsername !== "unknown") {
      userUpdateData.username = realUsername
    }
    if (realDisplayName && realDisplayName !== "User" && realDisplayName !== "unknown") {
      userUpdateData.display_name = realDisplayName
    }
    if (realPfpUrl && realPfpUrl !== "null") {
      userUpdateData.pfp_url = realPfpUrl
    }

    if (farcasterData?.verifiedAddress) {
      userUpdateData.verified_address = farcasterData.verifiedAddress
    }
    if (farcasterData?.custodyAddress) {
      userUpdateData.custody_address = farcasterData.custodyAddress
    }

    // Check if user exists first to preserve existing data
    const { data: existingUser } = await supabase
      .from("users_checkins")
      .select("username, display_name, pfp_url, verified_address, custody_address")
      .eq("fid", fid)
      .single()

    // Merge with existing data if user exists
    if (existingUser) {
      userUpdateData.username = userUpdateData.username || existingUser.username
      userUpdateData.display_name = userUpdateData.display_name || existingUser.display_name
      userUpdateData.pfp_url = userUpdateData.pfp_url || existingUser.pfp_url
      userUpdateData.verified_address = userUpdateData.verified_address || existingUser.verified_address
      userUpdateData.custody_address = userUpdateData.custody_address || existingUser.custody_address
    }

    await supabase.from("users_checkins").upsert(userUpdateData, { onConflict: "fid" })

    const result = await processCheckin(fid)

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
