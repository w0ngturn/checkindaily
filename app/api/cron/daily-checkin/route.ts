export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY
const SIGNER_UUID = process.env.NEYNAR_SIGNER_UUID // Signer UUID for @checkinxyz account

// Daily reminder messages - will rotate randomly
const REMINDER_MESSAGES = [
  "GM! Don't forget to check in today and keep your streak alive! 🔥\n\nBuild your streak. Earn rewards.",
  "Rise and grind! Your daily check-in is waiting ✅\n\nEvery check-in counts towards your rewards.",
  "Another day, another opportunity to grow your streak! 🚀\n\nCheck in now and climb the leaderboard.",
  "Hey Farcaster fam! Time for your daily check-in 💪\n\nConsistency is key to earning more points.",
  "Your streak is calling! Don't let it reset today 📈\n\nCheck in and stay on top.",
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secretParam = searchParams.get("secret")
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret) {
      const isValidSecret = secretParam === cronSecret || authHeader === `Bearer ${cronSecret}`
      if (!isValidSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    if (!NEYNAR_API_KEY) {
      return NextResponse.json({ error: "NEYNAR_API_KEY not configured" }, { status: 500 })
    }

    if (!SIGNER_UUID) {
      return NextResponse.json({ error: "NEYNAR_SIGNER_UUID not configured" }, { status: 500 })
    }

    // Pick a random reminder message
    const randomMessage = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)]

    // Post cast using Neynar API
    const response = await fetch("https://api.neynar.com/v2/farcaster/cast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": NEYNAR_API_KEY,
      },
      body: JSON.stringify({
        signer_uuid: SIGNER_UUID,
        text: randomMessage,
        embeds: [
          {
            url: "https://checkindaily.xyz",
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Neynar API error:", errorData)
      return NextResponse.json(
        {
          error: "Failed to post cast",
          details: errorData,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Daily check-in reminder posted",
      cast: data.cast,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Cron job error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
