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
  const requestId = `checkin-${Date.now()}-${Math.random().toString(36).substring(7)}`
  console.log(`[v0] [${requestId}] Check-in request started`)

  try {
    const body = await req.json()
    console.log(`[v0] [${requestId}] Request body received:`, { fid: body.fid || body.untrustedData?.fid })

    const validatedData = await validateFarcaster(body)

    if (!validatedData) {
      console.log(`[v0] [${requestId}] Failed to validate Farcaster data`)
      return NextResponse.json({
        frame: {
          image: "https://checkindaily.xyz/error.png",
          buttons: [{ label: "Invalid frame data" }],
        },
      })
    }

    const { fid, address, username, displayName, pfpUrl } = validatedData
    console.log(`[v0] [${requestId}] Validated user: fid=${fid}, username=${username}`)

    const supabase = await getSupabaseClient()

    const { error: upsertError } = await supabase.from("users_checkins").upsert(
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

    if (upsertError) {
      console.error(`[v0] [${requestId}] Upsert error:`, upsertError)
    }

    console.log(`[v0] [${requestId}] Processing check-in for fid=${fid}`)
    const result = await processCheckin(fid)
    console.log(`[v0] [${requestId}] Check-in result:`, result)

    if (result.alreadyCheckedIn) {
      console.log(`[v0] [${requestId}] User already checked in today`)
      return NextResponse.json({
        frame: {
          image: "https://checkindaily.xyz/already.png",
          buttons: [{ label: `Already checked in! Streak: ${result.streak}` }],
        },
      })
    }

    console.log(`[v0] [${requestId}] Check-in successful: streak=${result.streak}, points=${result.pointsEarned}`)
    return NextResponse.json({
      frame: {
        image: "https://checkindaily.xyz/success.png",
        buttons: [{ label: `🔥 Streak: ${result.streak} days` }, { label: `+${result.pointsEarned || 10} points` }],
      },
    })
  } catch (error) {
    console.error(`[v0] [${requestId}] Check-in error:`, error)
    return NextResponse.json({
      frame: {
        image: "https://checkindaily.xyz/error.png",
        buttons: [{ label: "Error occurred" }],
      },
    })
  }
}
