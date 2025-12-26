import { createSupabaseServerClient } from "./supabase-server"

export interface NotificationPreferences {
  fid: number
  pushEndpoint?: string
  emailAddress?: string
  notificationsEnabled: boolean
}

export async function subscribeToNotifications(
  fid: number,
  subscription: {
    endpoint: string
    keys: {
      auth: string
      p256dh: string
    }
  },
): Promise<void> {
  const supabase = await createSupabaseServerClient()

  await supabase.from("notification_preferences").upsert(
    {
      fid,
      push_endpoint: subscription.endpoint,
      push_auth_key: subscription.keys.auth,
      push_p256dh_key: subscription.keys.p256dh,
      notifications_enabled: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "fid" },
  )
}

export async function unsubscribeFromNotifications(fid: number): Promise<void> {
  const supabase = await createSupabaseServerClient()

  await supabase
    .from("notification_preferences")
    .update({
      notifications_enabled: false,
      updated_at: new Date().toISOString(),
    })
    .eq("fid", fid)
}

export async function getNotificationPreferences(fid: number): Promise<NotificationPreferences | null> {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from("notification_preferences")
    .select("fid, push_endpoint, email_address, notifications_enabled")
    .eq("fid", fid)
    .single()

  if (!data) return null

  return {
    fid: data.fid,
    pushEndpoint: data.push_endpoint,
    emailAddress: data.email_address,
    notificationsEnabled: data.notifications_enabled,
  }
}

export async function sendNotification(fid: number, type: string, title: string, message: string): Promise<void> {
  const supabase = await createSupabaseServerClient()

  // Log notification
  await supabase.from("notification_history").insert({
    fid,
    notification_type: type,
    title,
    message,
    sent_at: new Date().toISOString(),
  })
}

export async function checkStreakMilestones(fid: number, streak: number): Promise<void> {
  const milestones = [7, 14, 30, 60, 90, 365]
  if (milestones.includes(streak)) {
    await sendNotification(fid, "streak_milestone", "Milestone Reached!", `You've reached a ${streak} day streak!`)
  }
}
