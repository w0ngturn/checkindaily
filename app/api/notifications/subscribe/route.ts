import { NextResponse } from "next/server"
import { subscribeToNotifications } from "@/lib/notification-service"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { fid, subscription } = body

    if (!fid || !subscription) {
      return NextResponse.json({ error: "Missing fid or subscription" }, { status: 400 })
    }

    await subscribeToNotifications(fid, subscription)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[notifications] Subscribe error:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
