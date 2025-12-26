import { NextResponse } from "next/server"
import { getUserCheckin } from "@/lib/checkin-service"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const fid = url.searchParams.get("fid")

    if (!fid || isNaN(Number(fid))) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 })
    }

    const user = await getUserCheckin(Number(fid))

    if (!user) {
      return NextResponse.json(
        {
          fid: Number(fid),
          streakCount: 0,
          totalCheckins: 0,
          lastCheckin: null,
        },
        { status: 200 },
      )
    }

    return NextResponse.json(
      {
        fid: user.fid,
        streakCount: user.streakCount,
        totalCheckins: user.totalCheckins,
        lastCheckin: user.lastCheckin,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[streak] Error:", error)
    return NextResponse.json({ error: "Failed to fetch streak" }, { status: 500 })
  }
}
