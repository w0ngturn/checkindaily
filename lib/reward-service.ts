import { createSupabaseServerClient } from "./supabase-server"

export interface UserRewards {
  fid: number
  totalPoints: number
  tier: string
  lastRewardDate: string | null
}

// Bronze: 0-149 pts, Silver: 150-499 pts, Gold: 500-999 pts, Platinum: 1000+ pts
export function getTierByPoints(totalPoints: number): string {
  if (totalPoints >= 1000) return "platinum"
  if (totalPoints >= 500) return "gold"
  if (totalPoints >= 150) return "silver"
  return "bronze"
}

export function getMultiplierByTier(tier: string): number {
  switch (tier) {
    case "platinum":
      return 3.0
    case "gold":
      return 2.0
    case "silver":
      return 1.5
    default:
      return 1.0
  }
}

/**
 * Calculate reward multiplier based on streak length
 * This still gives bonus for streaks, but tier is determined by total points
 */
export function calculateMultiplier(streak: number): { multiplier: number; tier: string } {
  let streakMultiplier = 1.0
  if (streak >= 30) {
    streakMultiplier = 1.5
  } else if (streak >= 15) {
    streakMultiplier = 1.3
  } else if (streak >= 7) {
    streakMultiplier = 1.2
  }

  // Tier is placeholder here, actual tier is calculated from total points
  return { multiplier: streakMultiplier, tier: "bronze" }
}

/**
 * Base points for check-in (before multiplier)
 */
const BASE_POINTS = 10

export async function calculateRewards(fid: number, streak: number): Promise<{ pointsEarned: number; tier: string }> {
  const { multiplier: streakMultiplier } = calculateMultiplier(streak)

  const userRewards = await getUserRewards(fid)
  const currentPoints = userRewards?.totalPoints || 0
  const currentTier = getTierByPoints(currentPoints)
  const tierMultiplier = getMultiplierByTier(currentTier)

  // Total multiplier = streak bonus * tier bonus
  const totalMultiplier = streakMultiplier * tierMultiplier
  const pointsEarned = Math.floor(BASE_POINTS * totalMultiplier)

  return { pointsEarned, tier: currentTier }
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
    const newTotalPoints = existingRewards.total_points + pointsEarned
    const newTier = getTierByPoints(newTotalPoints)

    const { data } = await supabase
      .from("user_rewards")
      .update({
        total_points: newTotalPoints,
        tier: newTier,
        last_reward_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("fid", fid)
      .select()
      .single()
    rewards = data
  } else {
    const tier = getTierByPoints(pointsEarned)

    const { data } = await supabase
      .from("user_rewards")
      .insert({
        fid,
        total_points: pointsEarned,
        tier: tier,
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
