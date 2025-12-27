import { NextResponse } from "next/server"
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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { fid } = body

    if (!fid || isNaN(Number(fid))) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 })
    }

    const profileData = await getFarcasterUserData(Number(fid))

    const result = await processCheckin(Number(fid), profileData || undefined)

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
