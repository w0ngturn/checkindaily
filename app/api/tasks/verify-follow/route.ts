import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const CHECKINXYZ_FID = 1937520

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fid } = body

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

    // Fetch CHECKINXYZ user with viewer_fid to check relationship
    const relationshipUrl = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${CHECKINXYZ_FID}&viewer_fid=${fid}`

    const relationshipResponse = await fetch(relationshipUrl, {
      headers: {
        accept: "application/json",
        "x-api-key": neynarApiKey,
      },
    })

    if (!relationshipResponse.ok) {
      const errorText = await relationshipResponse.text()
      console.error("Neynar API error:", relationshipResponse.status, errorText)
      return NextResponse.json({ error: "Failed to verify follow status" }, { status: 500 })
    }

    const data = await relationshipResponse.json()

    // When fetching CHECKINXYZ with viewer_fid=user, viewer_context.followed_by means user follows CHECKINXYZ
    const user = data?.users?.[0]
    const viewerContext = user?.viewer_context
    const isFollowing = viewerContext?.followed_by === true

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
    console.error("Verify follow error:", error)
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 })
  }
}
