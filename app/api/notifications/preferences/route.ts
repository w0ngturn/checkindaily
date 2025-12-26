import { NextResponse } from "next/server"
import { getNotificationPreferences } from "@/lib/notification-service"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const fid = url.searchParams.get("fid")

    if (!fid || isNaN(Number(fid))) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 })
    }

    const preferences = await getNotificationPreferences(Number(fid))

    return NextResponse.json(
      preferences || {
        fid: Number(fid),
        notificationsEnabled: false,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[notifications] Get preferences error:", error)
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
  }
}
