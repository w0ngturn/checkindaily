import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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

    const userResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/user/by_username?username=${CHECKINXYZ_USERNAME}`,
      {
        headers: {
          accept: "application/json",
          "x-api-key": neynarApiKey,
        },
      },
    )

    if (!userResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch @checkinxyz info" }, { status: 500 })
    }

    const userData = await userResponse.json()
    const checkinxyzFid = userData.user?.fid

    if (!checkinxyzFid) {
      return NextResponse.json({ error: "@checkinxyz account not found" }, { status: 500 })
    }

    // This checks users who follow @checkinxyz (i.e., @checkinxyz's followers)
    let isFollowing = false
    let cursor: string | null = null
    let attempts = 0
    const maxAttempts = 10 // Check up to 1000 followers (100 per page)

    while (attempts < maxAttempts) {
      const followersUrl = new URL(`https://api.neynar.com/v2/farcaster/followers`)
      followersUrl.searchParams.set("fid", checkinxyzFid.toString())
      followersUrl.searchParams.set("limit", "100")
      if (cursor) {
        followersUrl.searchParams.set("cursor", cursor)
      }

      const followersResponse = await fetch(followersUrl.toString(), {
        headers: {
          accept: "application/json",
          "x-api-key": neynarApiKey,
        },
      })

      if (!followersResponse.ok) {
        break
      }

      const followersData = await followersResponse.json()
      const followers = followersData.users || []

      // Check if user is in this batch of followers
      const found = followers.find((f: any) => f.fid === fid)
      if (found) {
        isFollowing = true
        break
      }

      // Check if there are more pages
      cursor = followersData.next?.cursor
      if (!cursor) {
        break
      }

      attempts++
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
