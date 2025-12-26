import { NextResponse } from "next/server"
import { unsubscribeFromNotifications } from "@/lib/notification-service"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { fid } = body

    if (!fid) {
      return NextResponse.json({ error: "Missing fid" }, { status: 400 })
    }

    await unsubscribeFromNotifications(fid)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[notifications] Unsubscribe error:", error)
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 })
  }
}
