import { createSupabaseServerClient } from "./supabase-server"
import { calculateRewards, awardRewards } from "./reward-service"

const DAY = 24 * 60 * 60 * 1000

export interface UserCheckin {
  fid: number
  lastCheckin: string
  streakCount: number
  totalCheckins: number
}

export async function getUserCheckin(fid: number): Promise<UserCheckin | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("users_checkins")
    .select("fid, last_checkin, streak_count, total_checkins")
    .eq("fid", fid)
    .single()

  if (error || !data) return null

  return {
    fid: data.fid,
    lastCheckin: data.last_checkin,
    streakCount: data.streak_count,
    totalCheckins: data.total_checkins,
  }
}

export async function processCheckin(
  fid: number,
): Promise<{ streak: number; alreadyCheckedIn: boolean; pointsEarned?: number; tier?: string }> {
  const supabase = await createSupabaseServerClient()

  const user = await getUserCheckin(fid)
  const now = new Date()

  if (user) {
    const lastCheckinTime = new Date(user.lastCheckin).getTime()
    const nowTime = now.getTime()
    const diff = nowTime - lastCheckinTime

    // Already checked in within the last 24 hours
    if (diff < DAY) {
      return { streak: user.streakCount, alreadyCheckedIn: true }
    }

    // Update streak
    let newStreak = user.streakCount
    if (diff < DAY * 2) {
      newStreak = user.streakCount + 1
    } else {
      newStreak = 1
    }

    const { error } = await supabase
      .from("users_checkins")
      .update({
        last_checkin: now.toISOString(),
        streak_count: newStreak,
        total_checkins: user.totalCheckins + 1,
        updated_at: now.toISOString(),
      })
      .eq("fid", fid)

    if (!error) {
      const { pointsEarned, tier } = await calculateRewards(fid, newStreak)
      const { multiplier } = await calculateRewards(fid, newStreak)
      const multiplierValue = (multiplier || {}).multiplier || 1.0

      await awardRewards(fid, pointsEarned, newStreak, multiplierValue)

      // Log to history
      await supabase.from("checkin_history").insert({
        fid,
        checked_in_at: now.toISOString(),
        streak_at_time: newStreak,
      })

      return { streak: newStreak, alreadyCheckedIn: false, pointsEarned, tier }
    }

    return { streak: newStreak, alreadyCheckedIn: false }
  }

  // New user first check-in
  const { error } = await supabase.from("users_checkins").insert({
    fid,
    last_checkin: now.toISOString(),
    streak_count: 1,
    total_checkins: 1,
  })

  if (!error) {
    const { pointsEarned, tier } = await calculateRewards(fid, 1)
    await awardRewards(fid, pointsEarned, 1, 1.0)

    await supabase.from("checkin_history").insert({
      fid,
      checked_in_at: now.toISOString(),
      streak_at_time: 1,
    })

    return { streak: 1, alreadyCheckedIn: false, pointsEarned, tier }
  }

  return { streak: 1, alreadyCheckedIn: false }
}
