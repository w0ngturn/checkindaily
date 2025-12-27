import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const fids = searchParams.get("fids")

  if (!fids) {
    return NextResponse.json({ users: [] })
  }

  try {
    const res = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fids}`, {
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY!,
      },
    })

    if (!res.ok) {
      console.error("[v0] Neynar API error:", res.status, res.statusText)
      return NextResponse.json({ users: [] }, { status: res.status })
    }

    const data = await res.json()

    const usersByFid = Object.fromEntries(
      data.users.map((u: any) => [
        u.fid,
        {
          fid: u.fid,
          username: u.username,
          displayName: u.display_name,
          pfp: u.pfp_url,
        },
      ]),
    )

    return NextResponse.json(usersByFid)
  } catch (error) {
    console.error("[v0] Users endpoint error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
