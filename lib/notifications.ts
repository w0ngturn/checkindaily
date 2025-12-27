import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Send notification to specific users
export async function sendNotificationToUsers(fids: number[], title: string, body: string, targetUrl?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "https://checkindaily.xyz"

  const response = await fetch(`${baseUrl}/api/notifications/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fids,
      title,
      body,
      targetUrl: targetUrl || "https://checkindaily.xyz/",
    }),
  })

  return response.json()
}

// Send notification to all users with active notifications
export async function sendNotificationToAll(title: string, body: string, targetUrl?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "https://checkindaily.xyz"

  const response = await fetch(`${baseUrl}/api/notifications/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      body,
      targetUrl: targetUrl || "https://checkindaily.xyz/",
    }),
  })

  return response.json()
}

// Check if a user has notifications enabled
export async function hasNotificationsEnabled(fid: number): Promise<boolean> {
  const { data } = await supabase
    .from("farcaster_notification_tokens")
    .select("id")
    .eq("fid", fid)
    .eq("is_active", true)
    .limit(1)
    .single()

  return !!data
}
