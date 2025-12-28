import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const CHECKINXYZ_FID = 1937520

export async function POST(request: Request) {
  try {
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json({ error: "FID required" }, { status: 400 })
    }

    const neynarApiKey = process.env.NEYNAR_API_KEY
    console.log("[v0] NEYNAR_API_KEY exists:", !!neynarApiKey)

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

    const relationshipUrl = `https://api.neynar.com/v2/farcaster/user/relationship?fid=${fid}&target_fid=${CHECKINXYZ_FID}`

    console.log("[v0] Fetching relationship:", relationshipUrl)

    const relationshipResponse = await fetch(relationshipUrl, {
      headers: {
        accept: "application/json",
        "x-api-key": neynarApiKey,
      },
    })

    if (!relationshipResponse.ok) {
      const errorText = await relationshipResponse.text()
      console.error("[v0] Neynar relationship API error:", errorText)
      return NextResponse.json({ error: "Failed to verify follow status", detail: errorText }, { status: 500 })
    }

    const relationshipData = await relationshipResponse.json()

    const isFollowing = relationshipData?.relationship?.following === true

    console.log("[v0] Relationship data:", JSON.stringify(relationshipData, null, 2))
    console.log("[v0] Is following @checkinxyz:", isFollowing)

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
