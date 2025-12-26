import { createSupabaseServerClient } from "./supabase-server"

export interface UserRewards {
  fid: number
  totalPoints: number
  tier: string
  lastRewardDate: string | null
}

/**
 * Calculate reward multiplier based on streak length
 * Bronze (0-6 days): 1.0x
 * Silver (7-14 days): 1.5x
 * Gold (15-29 days): 2.0x
 * Platinum (30+ days): 3.0x
 */
export function calculateMultiplier(streak: number): { multiplier: number; tier: string } {
  if (streak >= 30) {
    return { multiplier: 3.0, tier: "platinum" }
  }
  if (streak >= 15) {
    return { multiplier: 2.0, tier: "gold" }
  }
  if (streak >= 7) {
    return { multiplier: 1.5, tier: "silver" }
  }
  return { multiplier: 1.0, tier: "bronze" }
}

/**
 * Base points for check-in (before multiplier)
 */
const BASE_POINTS = 10

export async function calculateRewards(fid: number, streak: number): Promise<{ pointsEarned: number; tier: string }> {
  const { multiplier, tier } = calculateMultiplier(streak)
  const pointsEarned = Math.floor(BASE_POINTS * multiplier)

  return { pointsEarned, tier }
}

export async function awardRewards(
  fid: number,
  pointsEarned: number,
  streak: number,
  multiplier: number,
): Promise<UserRewards | null> {
  const supabase = await createSupabaseServerClient()

  // Update or create user rewards
  const { data: existingRewards } = await supabase.from("user_rewards").select("*").eq("fid", fid).single()

  let rewards: any
  if (existingRewards) {
    const { data } = await supabase
      .from("user_rewards")
      .update({
        total_points: existingRewards.total_points + pointsEarned,
        tier: calculateMultiplier(streak).tier,
        last_reward_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("fid", fid)
      .select()
      .single()
    rewards = data
  } else {
    const { data } = await supabase
      .from("user_rewards")
      .insert({
        fid,
        total_points: pointsEarned,
        tier: calculateMultiplier(streak).tier,
        last_reward_date: new Date().toISOString(),
      })
      .select()
      .single()
    rewards = data
  }

  // Log reward in history
  await supabase.from("reward_history").insert({
    fid,
    points_earned: pointsEarned,
    streak_at_time: streak,
    multiplier,
  })

  if (!rewards) return null

  return {
    fid: rewards.fid,
    totalPoints: rewards.total_points,
    tier: rewards.tier,
    lastRewardDate: rewards.last_reward_date,
  }
}

export async function getUserRewards(fid: number): Promise<UserRewards | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("user_rewards")
    .select("fid, total_points, tier, last_reward_date")
    .eq("fid", fid)
    .single()

  if (error || !data) {
    return {
      fid,
      totalPoints: 0,
      tier: "bronze",
      lastRewardDate: null,
    }
  }

  return {
    fid: data.fid,
    totalPoints: data.total_points,
    tier: data.tier,
    lastRewardDate: data.last_reward_date,
  }
}
