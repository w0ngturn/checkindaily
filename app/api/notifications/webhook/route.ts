import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Webhook events from Farcaster clients
type WebhookEvent = {
  event: "miniapp_added" | "miniapp_removed" | "notifications_enabled" | "notifications_disabled"
  notificationDetails?: {
    url: string
    token: string
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()

    // Parse the JSON Farcaster Signature header
    const header = request.headers.get("x-farcaster-signature")

    let fid: number | null = null

    // Try to extract FID from signature header
    if (header) {
      try {
        const parsed = JSON.parse(atob(header.split(".")[0]))
        fid = parsed.fid
      } catch (e) {
        console.log("[v0] Could not parse signature header")
      }
    }

    // If no FID from header, try to get from body
    if (!fid && body.fid) {
      fid = body.fid
    }

    if (!fid) {
      console.log("[v0] No FID found in webhook request")
      return NextResponse.json({ success: false, error: "No FID found" }, { status: 400 })
    }

    const event = body as WebhookEvent
    console.log(`[v0] Notification webhook event: ${event.event} for FID: ${fid}`)

    switch (event.event) {
      case "miniapp_added":
      case "notifications_enabled":
        if (event.notificationDetails) {
          // Save the notification token
          const { error } = await supabase.from("farcaster_notification_tokens").upsert(
            {
              fid,
              token: event.notificationDetails.token,
              notification_url: event.notificationDetails.url,
              is_active: true,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "fid,token",
            },
          )

          if (error) {
            console.error("[v0] Error saving notification token:", error)
          } else {
            console.log(`[v0] Saved notification token for FID: ${fid}`)
          }
        }
        break

      case "miniapp_removed":
      case "notifications_disabled":
        // Deactivate all tokens for this FID
        const { error } = await supabase
          .from("farcaster_notification_tokens")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("fid", fid)

        if (error) {
          console.error("[v0] Error deactivating notification tokens:", error)
        } else {
          console.log(`[v0] Deactivated notification tokens for FID: ${fid}`)
        }
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 })
  }
}

// GET endpoint to check webhook status
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "CHECKIN notification webhook is active",
  })
}
