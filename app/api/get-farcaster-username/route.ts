import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const fid = searchParams.get("fid")

    if (!fid || isNaN(Number(fid))) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 })
    }

    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        "x-api-key": process.env.NEYNAR_API_KEY || "",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Neynar API error" }, { status: response.status })
    }

    const data = await response.json()
    const user = data.users?.[0]

    if (user?.username) {
      return NextResponse.json({ username: user.username })
    }

    return NextResponse.json({ username: null })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: "Failed to fetch username" }, { status: 500 })
  }
}
