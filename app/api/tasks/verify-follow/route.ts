import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// @checkinxyz username - we'll lookup FID dynamically
const CHECKINXYZ_USERNAME = "checkinxyz"

export async function POST(request: Request) {
  try {
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json({ error: "FID required" }, { status: 400 })
    }

    const neynarApiKey = process.env.NEYNAR_API_KEY
    if (!neynarApiKey) {
      return NextResponse.json({ error: "Neynar API not configured" }, { status: 500 })
    }

    // Check if task already completed
    const { data: existingTask } = await supabase
      .from("user_tasks")
      .select("*")
      .eq("fid", fid)
      .eq("task_id", "follow_checkinxyz")
      .single()

    if (existingTask) {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        claimed: !!existingTask.claimed_at,
        message: existingTask.claimed_at ? "Task already claimed" : "Task completed, ready to claim",
      })
    }

    const userLookupResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/user/by_username?username=${CHECKINXYZ_USERNAME}`,
      {
        headers: {
          accept: "application/json",
          "x-api-key": neynarApiKey,
        },
      },
    )

    if (!userLookupResponse.ok) {
      const errorText = await userLookupResponse.text()
      console.error("[v0] User lookup error:", errorText)
      return NextResponse.json({ error: "Failed to lookup @checkinxyz" }, { status: 500 })
    }

    const userLookupData = await userLookupResponse.json()
    const checkinxyzFid = userLookupData.user?.fid

    if (!checkinxyzFid) {
      console.error("[v0] @checkinxyz FID not found:", userLookupData)
      return NextResponse.json({ error: "@checkinxyz account not found" }, { status: 500 })
    }

    console.log("[v0] @checkinxyz FID:", checkinxyzFid)

    // Fetch the user's profile with @checkinxyz as viewer
    // Then we can see if @checkinxyz is in the user's following list
    // Alternative: check if user FID is in @checkinxyz's followers

    // Method: Get user's following and check if @checkinxyz is in it
    const followingResponse = await fetch(`https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=100`, {
      headers: {
        accept: "application/json",
        "x-api-key": neynarApiKey,
      },
    })

    if (!followingResponse.ok) {
      const errorText = await followingResponse.text()
      console.error("[v0] Following fetch error:", errorText)
      return NextResponse.json({ error: "Failed to fetch following list" }, { status: 500 })
    }

    const followingData = await followingResponse.json()

    // Check if @checkinxyz is in user's following list
    let isFollowing = false
    let cursor = null
    let checkedCount = 0

    // Check first page
    const followingUsers = followingData.users || []
    isFollowing = followingUsers.some((user: any) => user.fid === checkinxyzFid)
    checkedCount += followingUsers.length
    cursor = followingData.next?.cursor

    console.log("[v0] First page check:", {
      userFid: fid,
      checkinxyzFid,
      checkedCount,
      isFollowing,
      hasMore: !!cursor,
    })

    // If not found in first 100, check more pages (up to 500 total)
    while (!isFollowing && cursor && checkedCount < 500) {
      const nextResponse = await fetch(
        `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=100&cursor=${cursor}`,
        {
          headers: {
            accept: "application/json",
            "x-api-key": neynarApiKey,
          },
        },
      )

      if (!nextResponse.ok) break

      const nextData = await nextResponse.json()
      const nextUsers = nextData.users || []
      isFollowing = nextUsers.some((user: any) => user.fid === checkinxyzFid)
      checkedCount += nextUsers.length
      cursor = nextData.next?.cursor

      console.log("[v0] Page check:", { checkedCount, isFollowing, hasMore: !!cursor })
    }

    if (isFollowing) {
      // Mark task as completed (not claimed yet)
      await supabase.from("user_tasks").insert({
        fid,
        task_id: "follow_checkinxyz",
        task_name: "Follow @checkinxyz",
        points_reward: 50,
        completed_at: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        isFollowing: true,
        message: "Verified! You are following @checkinxyz. Claim your reward!",
      })
    }

    return NextResponse.json({
      success: true,
      isFollowing: false,
      message: "You need to follow @checkinxyz first",
    })
  } catch (error: any) {
    console.error("[v0] Verify follow error:", error)
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 })
  }
}
