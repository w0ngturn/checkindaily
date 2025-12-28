import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export const runtime = "nodejs"

async function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase config")
  }

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  })
}

async function fetchNeynarProfiles(
  fids: number[],
): Promise<Record<number, { username: string; displayName: string; pfpUrl: string }>> {
  if (fids.length === 0) return {}

  const apiKey = process.env.NEYNAR_API_KEY
  if (!apiKey) {
    console.error("[leaderboard] NEYNAR_API_KEY not set")
    return {}
  }

  try {
    const fidsParam = fids.join(",")
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fidsParam}`, {
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      console.error("[leaderboard] Neynar API error:", response.status)
      return {}
    }

    const data = await response.json()
    const profiles: Record<number, { username: string; displayName: string; pfpUrl: string }> = {}

    for (const user of data.users || []) {
      profiles[user.fid] = {
        username: user.username || `fid_${user.fid}`,
        displayName: user.display_name || user.username || `User ${user.fid}`,
        pfpUrl: user.pfp_url || "/avatar.png",
      }
    }

    return profiles
  } catch (error) {
    console.error("[leaderboard] Error fetching Neynar profiles:", error)
    return {}
  }
}

function getTimeFrameFilter(timeFrame: string): Date | null {
  const now = new Date()
  switch (timeFrame) {
    case "weekly":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case "monthly":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get("limit")) || 10
    const sortBy = url.searchParams.get("sortBy") || "streak"
    const timeFrame = url.searchParams.get("timeFrame") || "all"
    const currentUserFid = url.searchParams.get("currentUserFid")

    const supabase = await getSupabaseClient()
    const timeFilter = getTimeFrameFilter(timeFrame)

    let checkinsQuery = supabase
      .from("users_checkins")
      .select("fid, username, display_name, pfp_url, streak_count, total_checkins, last_checkin")

    if (timeFilter) {
      checkinsQuery = checkinsQuery.gte("last_checkin", timeFilter.toISOString())
    }

    const { data: checkinsData, error: checkinsError } = await checkinsQuery

    if (checkinsError) {
      console.error("[leaderboard] Checkins error:", checkinsError)
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
    }

    const fidsForRewards = checkinsData?.map((u: any) => u.fid) || []

    const { data: rewardsData, error: rewardsError } = await supabase
      .from("user_rewards")
      .select("fid, total_points, tier")
      .in("fid", fidsForRewards.length > 0 ? fidsForRewards : [0])

    if (rewardsError) {
      console.error("[leaderboard] Rewards error:", rewardsError)
    }

    const rewardsMap = new Map<number, { total_points: number; tier: string }>()
    for (const reward of rewardsData || []) {
      rewardsMap.set(reward.fid, {
        total_points: reward.total_points || 0,
        tier: reward.tier || "bronze",
      })
    }

    // Merge checkins with rewards
    const merged = (checkinsData || []).map((user: any) => ({
      ...user,
      total_points: rewardsMap.get(user.fid)?.total_points || 0,
      tier: rewardsMap.get(user.fid)?.tier || "bronze",
    }))

    const sorted = merged.sort((a: any, b: any) => {
      switch (sortBy) {
        case "points":
          return (b.total_points || 0) - (a.total_points || 0)
        case "checkins":
          return (b.total_checkins || 0) - (a.total_checkins || 0)
        default: // streak
          return (b.streak_count || 0) - (a.streak_count || 0)
      }
    })

    // Assign ranks to all users before slicing
    const rankedUsers = sorted.map((user: any, index: number) => ({
      ...user,
      rank: index + 1,
    }))

    let currentUserRank = null
    if (currentUserFid) {
      const userRankData = rankedUsers.find((u: any) => u.fid === Number(currentUserFid))
      if (userRankData) {
        const neynarProfile = (await fetchNeynarProfiles([Number(currentUserFid)]))[Number(currentUserFid)]
        currentUserRank = {
          rank: userRankData.rank,
          fid: userRankData.fid,
          username: neynarProfile?.username || userRankData.username || `fid_${userRankData.fid}`,
          displayName: neynarProfile?.displayName || userRankData.display_name || `User ${userRankData.fid}`,
          pfpUrl: neynarProfile?.pfpUrl || userRankData.pfp_url || "/avatar.png",
          streakCount: userRankData.streak_count || 0,
          totalCheckins: userRankData.total_checkins || 0,
          totalPoints: userRankData.total_points || 0,
          tier: userRankData.tier || "bronze",
        }
      }
    }

    // Slice for top results
    const topUsers = rankedUsers.slice(0, limit)
    const fids = topUsers.map((user: any) => user.fid)
    const neynarProfiles = await fetchNeynarProfiles(fids)

    const leaderboard = topUsers.map((user: any) => {
      const neynarProfile = neynarProfiles[user.fid]

      return {
        rank: user.rank,
        fid: user.fid,
        username: neynarProfile?.username || user.username || `fid_${user.fid}`,
        displayName: neynarProfile?.displayName || user.display_name || `User ${user.fid}`,
        pfpUrl: neynarProfile?.pfpUrl || user.pfp_url || "/avatar.png",
        streakCount: user.streak_count || 0,
        totalCheckins: user.total_checkins || 0,
        totalPoints: user.total_points || 0,
        tier: user.tier || "bronze",
      }
    })

    return NextResponse.json(
      {
        leaderboard,
        currentUserRank,
        totalUsers: rankedUsers.length,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[leaderboard] Error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
