import { NextResponse } from "next/server"
import { getAnalytics } from "@/lib/analytics-service"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const fid = url.searchParams.get("fid")

    if (!fid || isNaN(Number(fid))) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 })
    }

    const stats = await getAnalytics(Number(fid))

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error("[analytics] Error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
