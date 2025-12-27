import { NextResponse } from "next/server"

export const runtime = "nodejs" // Added explicit runtime for external API calls

type NeynarUser = {
  fid: number
  username: string
  display_name?: string
  pfp_url?: string
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const fidsParam = searchParams.get("fids")

    if (!fidsParam) {
      return NextResponse.json({}, { status: 200 })
    }

    const fids = Array.from(
      new Set(
        fidsParam
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
      ),
    )

    if (fids.length === 0) {
      return NextResponse.json({}, { status: 200 })
    }

    // Fetch from Neynar bulk API
    const neynarRes = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fids.join(",")}`, {
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY as string,
      },
    })

    if (!neynarRes.ok) {
      const text = await neynarRes.text()
      console.error("[v0] Neynar API error:", neynarRes.status, text)
      return NextResponse.json({ error: "Neynar error", detail: text }, { status: neynarRes.status })
    }

    const json = await neynarRes.json()

    const usersByFid: Record<number, { username: string; pfp: string | null; displayName: string | null }> = {}
    ;(json.users as NeynarUser[]).forEach((u) => {
      usersByFid[u.fid] = {
        username: u.username,
        pfp: u.pfp_url ?? null,
        displayName: u.display_name ?? null,
      }
    })

    return NextResponse.json(usersByFid, { status: 200 })
  } catch (error: any) {
    console.error("[v0] Users endpoint error:", error)
    return NextResponse.json({ error: "Internal error", message: error?.message }, { status: 500 })
  }
}
