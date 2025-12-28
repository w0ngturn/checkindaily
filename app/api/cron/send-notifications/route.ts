import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  // Verify cron secret
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get("secret")

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all users who haven't checked in today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get users with active notification tokens who haven't checked in today
    const { data: tokensData, error: tokensError } = await supabase
      .from("farcaster_notification_tokens")
      .select("fid, token, notification_url")
      .eq("is_active", true)

    if (tokensError || !tokensData || tokensData.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active notification tokens",
        sent: 0,
      })
    }

    // Get users who already checked in today
    const { data: checkedInToday } = await supabase
      .from("users_checkins")
      .select("fid")
      .gte("last_checkin", today.toISOString())

    const checkedInFids = new Set((checkedInToday || []).map((u) => u.fid))

    // Filter tokens to only users who haven't checked in
    const tokensToNotify = tokensData.filter((t) => !checkedInFids.has(t.fid))

    if (tokensToNotify.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All users have already checked in today",
        sent: 0,
      })
    }

    // Reminder messages
    const reminderMessages = [
      { title: "Don't break your streak!", body: "Check in now to keep your streak alive" },
      { title: "Daily Check-in Reminder", body: "Your streak is waiting for you" },
      { title: "Time to check in!", body: "Build your streak, earn rewards" },
      { title: "Hey! You haven't checked in", body: "Don't miss out on today's points" },
      { title: "Streak Alert", body: "Check in to maintain your progress" },
    ]

    const randomMessage = reminderMessages[Math.floor(Math.random() * reminderMessages.length)]

    // Group tokens by notification URL
    const tokensByUrl: Record<string, { fid: number; token: string }[]> = {}
    for (const t of tokensToNotify) {
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

    const notificationId = `checkin-reminder-${Date.now()}`

    // Send notifications to each URL endpoint
    for (const [url, urlTokens] of Object.entries(tokensByUrl)) {
      // Batch tokens (max 100 per request)
      for (let i = 0; i < urlTokens.length; i += 100) {
        const batch = urlTokens.slice(i, i + 100)

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              notificationId,
              title: randomMessage.title,
              body: randomMessage.body,
              targetUrl: "https://checkindaily.xyz",
              tokens: batch.map((t) => t.token),
            }),
          })

          if (response.ok) {
            const result = await response.json()
            results.successful += result.successfulTokens?.length || batch.length
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
          console.error(`Error sending to ${url}:`, e)
        }
      }
    }

    // Log notifications
    for (const t of tokensToNotify) {
      await supabase.from("notification_history").insert({
        fid: t.fid,
        title: randomMessage.title,
        message: randomMessage.body,
        notification_type: "push_reminder",
        sent_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      message: "Reminder notifications sent",
      sent: results.successful,
      invalid: results.invalid,
      rateLimited: results.rateLimited,
      total: tokensToNotify.length,
    })
  } catch (error) {
    console.error("Cron notification error:", error)
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 })
  }
}
