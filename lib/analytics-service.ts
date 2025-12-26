import { createSupabaseServerClient } from "./supabase-server"

export interface CheckinEntry {
  checkedInAt: string
  streakAtTime: number
  pointsEarned?: number
}

export interface AnalyticsStats {
  fid: number
  totalCheckIns: number
  currentStreak: number
  longestStreak: number
  averagePointsPerDay: number
  totalPointsEarned: number
  checkInRate: number // percentage of days checked in
  thisWeekCheckIns: number
  thisMonthCheckIns: number
}

export async function getCheckInHistory(fid: number, days = 30): Promise<CheckinEntry[]> {
  const supabase = await createSupabaseServerClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from("checkin_history")
    .select("checked_in_at, streak_at_time")
    .eq("fid", fid)
    .gte("checked_in_at", startDate.toISOString())
    .order("checked_in_at", { ascending: false })

  if (error || !data) return []

  return data.map((entry: any) => ({
    checkedInAt: entry.checked_in_at,
    streakAtTime: entry.streak_at_time,
  }))
}

export async function getAnalytics(fid: number): Promise<AnalyticsStats> {
  const supabase = await createSupabaseServerClient()

  // Get user checkin data
  const { data: userCheckin } = await supabase
    .from("users_checkins")
    .select("streak_count, total_checkins")
    .eq("fid", fid)
    .single()

  // Get reward data
  const { data: rewards } = await supabase.from("user_rewards").select("total_points").eq("fid", fid).single()

  // Get check-in history for this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { data: weekCheckIns } = await supabase
    .from("checkin_history")
    .select("id")
    .eq("fid", fid)
    .gte("checked_in_at", weekAgo.toISOString())

  // Get check-in history for this month
  const monthAgo = new Date()
  monthAgo.setDate(monthAgo.getDate() - 30)

  const { data: monthCheckIns } = await supabase
    .from("checkin_history")
    .select("id")
    .eq("fid", fid)
    .gte("checked_in_at", monthAgo.toISOString())

  // Get reward history for average calculation
  const { data: rewardHistory } = await supabase
    .from("reward_history")
    .select("points_earned")
    .eq("fid", fid)
    .order("earned_at", { ascending: false })
    .limit(50)

  const totalPoints = rewards?.total_points || 0
  const totalCheckIns = userCheckin?.total_checkins || 0
  const currentStreak = userCheckin?.streak_count || 0

  const daysActive = totalCheckIns
  const averagePointsPerDay = daysActive > 0 ? Math.floor(totalPoints / daysActive) : 0
  const checkInRate = daysActive > 0 ? Math.min((daysActive / 365) * 100, 100) : 0

  return {
    fid,
    totalCheckIns,
    currentStreak,
    longestStreak: currentStreak, // This would require more complex tracking
    averagePointsPerDay,
    totalPointsEarned: totalPoints,
    checkInRate: Math.round(checkInRate),
    thisWeekCheckIns: weekCheckIns?.length || 0,
    thisMonthCheckIns: monthCheckIns?.length || 0,
  }
}
