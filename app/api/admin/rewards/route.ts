import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { multipliers, basePoints } = body

    // For now, this endpoint validates the configuration
    if (!multipliers || !basePoints) {
      return NextResponse.json({ error: "Invalid configuration" }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Rewards configured" }, { status: 200 })
  } catch (error) {
    console.error("[admin] Rewards error:", error)
    return NextResponse.json({ error: "Failed to save rewards config" }, { status: 500 })
  }
}
