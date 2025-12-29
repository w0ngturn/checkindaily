import { createSupabaseServerClient } from "./supabase-server"
import { calculateRewards, awardRewards, getTierByPoints, getUserRewards } from "./reward-service"

// Helper function to check if last check-in was before today's UTC midnight
function hasCheckedInToday(lastCheckin: string): boolean {
  const lastCheckinDate = new Date(lastCheckin)
  const now = new Date()

  // Get UTC dates (year, month, day only)
  const lastCheckinUTC = Date.UTC(
    lastCheckinDate.getUTCFullYear(),
    lastCheckinDate.getUTCMonth(),
    lastCheckinDate.getUTCDate(),
  )
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

  return lastCheckinUTC === todayUTC
}

// Helper function to check if streak should continue (checked in yesterday UTC)
function shouldContinueStreak(lastCheckin: string): boolean {
  const lastCheckinDate = new Date(lastCheckin)
  const now = new Date()

  // Get UTC dates
  const lastCheckinUTC = Date.UTC(
    lastCheckinDate.getUTCFullYear(),
    lastCheckinDate.getUTCMonth(),
    lastCheckinDate.getUTCDate(),
  )
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

  // Check if last check-in was yesterday (1 day difference)
  const oneDayMs = 24 * 60 * 60 * 1000
  const daysDiff = (todayUTC - lastCheckinUTC) / oneDayMs

  return daysDiff === 1
}

export interface UserCheckin {
  fid: number
  lastCheckin: string
  streakCount: number
  totalCheckins: number
}

export interface UserProfileData {
  username?: string
  displayName?: string
  pfpUrl?: string
  verifiedAddress?: string
  custodyAddress?: string
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
  profileData?: UserProfileData,
): Promise<{ streak: number; alreadyCheckedIn: boolean; pointsEarned?: number; tier?: string }> {
  const logPrefix = `[v0] [processCheckin:${fid}]`
  console.log(`${logPrefix} Starting check-in process`)

  const supabase = await createSupabaseServerClient()

  const user = await getUserCheckin(fid)
  const now = new Date()

  console.log(
    `${logPrefix} User data:`,
    user ? { lastCheckin: user.lastCheckin, streak: user.streakCount, total: user.totalCheckins } : "New user",
  )

  if (user) {
    const alreadyCheckedInToday = hasCheckedInToday(user.lastCheckin)

    console.log(
      `${logPrefix} Last check-in: ${user.lastCheckin}, Already checked in today (UTC): ${alreadyCheckedInToday}`,
    )

    if (alreadyCheckedInToday) {
      console.log(`${logPrefix} Already checked in today (UTC midnight reset)`)
      return { streak: user.streakCount, alreadyCheckedIn: true }
    }

    let newStreak = user.streakCount
    const continueStreak = shouldContinueStreak(user.lastCheckin)

    if (continueStreak) {
      newStreak = user.streakCount + 1
      console.log(`${logPrefix} Continuing streak (checked in yesterday): ${user.streakCount} -> ${newStreak}`)
    } else {
      newStreak = 1
      console.log(`${logPrefix} Streak reset (missed a day): ${user.streakCount} -> 1`)
    }

    // Insert to checkin_history first
    console.log(`${logPrefix} Inserting checkin_history record`)
    const { error: historyError, data: historyData } = await supabase
      .from("checkin_history")
      .insert({
        fid,
        checked_in_at: now.toISOString(),
        streak_at_time: newStreak,
      })
      .select()

    if (historyError) {
      console.error(`${logPrefix} FAILED to insert checkin_history:`, historyError)
      return { streak: user.streakCount, alreadyCheckedIn: false }
    }
    console.log(`${logPrefix} checkin_history inserted successfully:`, historyData)

    // Get accurate count from checkin_history
    const { count: actualCount, error: countError } = await supabase
      .from("checkin_history")
      .select("*", { count: "exact", head: true })
      .eq("fid", fid)

    if (countError) {
      console.error(`${logPrefix} Error counting checkin_history:`, countError)
    }
    console.log(`${logPrefix} Actual checkin count from history: ${actualCount}`)

    const updateData: any = {
      last_checkin: now.toISOString(),
      last_seen: now.toISOString(),
      streak_count: newStreak,
      total_checkins: actualCount || user.totalCheckins + 1,
      updated_at: now.toISOString(),
    }

    // Add profile data if provided
    if (profileData?.username) updateData.username = profileData.username
    if (profileData?.displayName) updateData.display_name = profileData.displayName
    if (profileData?.pfpUrl) updateData.pfp_url = profileData.pfpUrl
    if (profileData?.verifiedAddress) updateData.verified_address = profileData.verifiedAddress
    if (profileData?.custodyAddress) updateData.custody_address = profileData.custodyAddress

    console.log(`${logPrefix} Updating users_checkins:`, updateData)
    const { error, data: updateResult } = await supabase
      .from("users_checkins")
      .update(updateData)
      .eq("fid", fid)
      .select()

    if (error) {
      console.error(`${logPrefix} FAILED to update users_checkins:`, error)
      return { streak: newStreak, alreadyCheckedIn: false }
    }

    console.log(`${logPrefix} users_checkins updated successfully:`, updateResult)

    const userRewards = await getUserRewards(fid)
    const currentPoints = userRewards?.totalPoints || 0

    const { pointsEarned } = await calculateRewards(fid, newStreak)
    const newTotalPoints = currentPoints + pointsEarned
    const tier = getTierByPoints(newTotalPoints)

    console.log(`${logPrefix} Awarding rewards: points=${pointsEarned}, newTotal=${newTotalPoints}, tier=${tier}`)
    await awardRewards(fid, pointsEarned, newStreak, 1.0)

    console.log(`${logPrefix} Check-in complete: streak=${newStreak}, total=${actualCount}, points=${pointsEarned}`)
    return { streak: newStreak, alreadyCheckedIn: false, pointsEarned, tier }
  }

  // New user
  console.log(`${logPrefix} New user - creating first check-in`)

  const { error: historyError, data: historyData } = await supabase
    .from("checkin_history")
    .insert({
      fid,
      checked_in_at: now.toISOString(),
      streak_at_time: 1,
    })
    .select()

  if (historyError) {
    console.error(`${logPrefix} FAILED to insert checkin_history for new user:`, historyError)
  } else {
    console.log(`${logPrefix} checkin_history inserted for new user:`, historyData)
  }

  const insertData: any = {
    fid,
    last_checkin: now.toISOString(),
    last_seen: now.toISOString(),
    streak_count: 1,
    total_checkins: 1,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }

  // Add profile data if provided
  if (profileData?.username) insertData.username = profileData.username
  if (profileData?.displayName) insertData.display_name = profileData.displayName
  if (profileData?.pfpUrl) insertData.pfp_url = profileData.pfpUrl
  if (profileData?.verifiedAddress) insertData.verified_address = profileData.verifiedAddress
  if (profileData?.custodyAddress) insertData.custody_address = profileData.custodyAddress

  console.log(`${logPrefix} Inserting new user to users_checkins:`, insertData)
  const { error, data: insertResult } = await supabase.from("users_checkins").insert(insertData).select()

  if (error) {
    console.error(`${logPrefix} FAILED to insert new user to users_checkins:`, error)
    return { streak: 1, alreadyCheckedIn: false }
  }

  console.log(`${logPrefix} New user inserted successfully:`, insertResult)

  const { pointsEarned } = await calculateRewards(fid, 1)
  const tier = getTierByPoints(pointsEarned)
  await awardRewards(fid, pointsEarned, 1, 1.0)

  console.log(`${logPrefix} New user check-in complete: streak=1, points=${pointsEarned}`)
  return { streak: 1, alreadyCheckedIn: false, pointsEarned, tier }
}
