import { NextResponse } from "next/server"
import { getUserRewards } from "@/lib/reward-service"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const fid = url.searchParams.get("fid")

    if (!fid || isNaN(Number(fid))) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 })
    }

    const rewards = await getUserRewards(Number(fid))

    return NextResponse.json(rewards, { status: 200 })
  } catch (error) {
    console.error("[rewards] Error:", error)
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 })
  }
}
