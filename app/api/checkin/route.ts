import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { processCheckin } from "@/lib/checkin-service"
import { validateFarcaster } from "@/lib/farcaster-validator"

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

    const validatedData = await validateFarcaster(body)

    if (!validatedData) {
      console.log("[v0] Failed to validate Farcaster data")
      return NextResponse.json({
        frame: {
          image: "https://checkindaily.xyz/error.png",
          buttons: [{ label: "Invalid frame data" }],
        },
      })
    }

    const { fid, address, username, displayName, pfpUrl } = validatedData
    const supabase = await getSupabaseClient()

    await supabase.from("users_checkins").upsert(
      {
        fid,
        wallet_address: address,
        username: username || null,
        display_name: displayName || null,
        pfp_url: pfpUrl || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "fid" },
    )

    const result = await processCheckin(fid)

    if (result.alreadyCheckedIn) {
      return NextResponse.json({
        frame: {
          image: "https://checkindaily.xyz/already.png",
          buttons: [{ label: `Already checked in! Streak: ${result.streak}` }],
        },
      })
    }

    return NextResponse.json({
      frame: {
        image: "https://checkindaily.xyz/success.png",
        buttons: [{ label: `🔥 Streak: ${result.streak} days` }, { label: `+${result.pointsEarned || 10} points` }],
      },
    })
  } catch (error) {
    console.error("[v0] Check-in error:", error)
    return NextResponse.json({
      frame: {
        image: "https://checkindaily.xyz/error.png",
        buttons: [{ label: "Error occurred" }],
      },
    })
  }
}
