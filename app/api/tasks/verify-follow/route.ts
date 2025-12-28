import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// @checkinxyz FID - you need to replace this with actual FID
const CHECKINXYZ_FID = 1029791

export async function POST(request: Request) {
  try {
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json({ error: "FID required" }, { status: 400 })
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

    // Verify follow using Neynar API
    const neynarApiKey = process.env.NEYNAR_API_KEY
    if (!neynarApiKey) {
      return NextResponse.json({ error: "Neynar API not configured" }, { status: 500 })
    }

    // Check if user follows @checkinxyz
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        accept: "application/json",
        "x-api-key": neynarApiKey,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user data")
    }

    const userData = await response.json()
    const user = userData.users?.[0]

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check following relationship
    const followResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${CHECKINXYZ_FID}&viewer_fid=${fid}`,
      {
        headers: {
          accept: "application/json",
          "x-api-key": neynarApiKey,
        },
      },
    )

    if (!followResponse.ok) {
      throw new Error("Failed to verify follow status")
    }

    const followData = await followResponse.json()
    const targetUser = followData.users?.[0]
    const isFollowing = targetUser?.viewer_context?.following === true

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
      message: "You are not following @checkinxyz yet",
    })
  } catch (error: any) {
    console.error("Verify follow error:", error)
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 })
  }
}
