import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type SendNotificationRequest = {
  fids?: number[]
  title: string
  body: string
  targetUrl?: string
  notificationId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SendNotificationRequest = await request.json()

    // Validate required fields
    if (!body.title || !body.body) {
      return NextResponse.json(
        {
          success: false,
          error: "title and body are required",
        },
        { status: 400 },
      )
    }

    // Get active notification tokens
    let query = supabase
      .from("farcaster_notification_tokens")
      .select("fid, token, notification_url")
      .eq("is_active", true)

    // Filter by specific FIDs if provided
    if (body.fids && body.fids.length > 0) {
      query = query.in("fid", body.fids)
    }

    const { data: tokens, error } = await query

    if (error) {
      console.error("[v0] Error fetching notification tokens:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch tokens",
        },
        { status: 500 },
      )
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: "No active notification tokens found",
      })
    }

    // Group tokens by notification URL
    const tokensByUrl: Record<string, { fid: number; token: string }[]> = {}
    for (const t of tokens) {
      if (!tokensByUrl[t.notification_url]) {
        tokensByUrl[t.notification_url] = []
      }
      tokensByUrl[t.notification_url].push({ fid: t.fid, token: t.token })
    }

    const results = {
      successful: 0,
      invalid: 0,
      rateLimited: 0,
    }

    const notificationId = body.notificationId || `checkin-${Date.now()}`
    const targetUrl = body.targetUrl || "https://checkindaily.xyz/"

    // Send notifications to each URL endpoint
    for (const [url, urlTokens] of Object.entries(tokensByUrl)) {
      // Batch tokens (max 100 per request)
      const batches = []
      for (let i = 0; i < urlTokens.length; i += 100) {
        batches.push(urlTokens.slice(i, i + 100))
      }

      for (const batch of batches) {
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              notificationId,
              title: body.title.slice(0, 32),
              body: body.body.slice(0, 128),
              targetUrl,
              tokens: batch.map((t) => t.token),
            }),
          })

          if (response.ok) {
            const result = await response.json()
            results.successful += result.successfulTokens?.length || 0
            results.invalid += result.invalidTokens?.length || 0
            results.rateLimited += result.rateLimitedTokens?.length || 0

            // Deactivate invalid tokens
            if (result.invalidTokens && result.invalidTokens.length > 0) {
              await supabase
                .from("farcaster_notification_tokens")
                .update({ is_active: false })
                .in("token", result.invalidTokens)
            }
          }
        } catch (e) {
          console.error(`[v0] Error sending to ${url}:`, e)
        }
      }
    }

    // Log notification to history
    const fidsList = tokens.map((t) => t.fid)
    for (const fid of [...new Set(fidsList)]) {
      await supabase.from("notification_history").insert({
        fid,
        title: body.title,
        message: body.body,
        notification_type: "push",
        sent_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      sent: results.successful,
      invalid: results.invalid,
      rateLimited: results.rateLimited,
      total: tokens.length,
    })
  } catch (error) {
    console.error("[v0] Send notification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal error",
      },
      { status: 500 },
    )
  }
}
