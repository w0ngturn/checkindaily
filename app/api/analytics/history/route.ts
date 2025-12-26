import { NextResponse } from "next/server"
import { getCheckInHistory } from "@/lib/analytics-service"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const fid = url.searchParams.get("fid")
    const days = url.searchParams.get("days") || "30"

    if (!fid || isNaN(Number(fid))) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 })
    }

    const history = await getCheckInHistory(Number(fid), Number(days))

    return NextResponse.json({ fid: Number(fid), history }, { status: 200 })
  } catch (error) {
    console.error("[history] Error:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
