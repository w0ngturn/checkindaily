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

    const bulkUrl = new URL("https://api.neynar.com/v2/farcaster/user/bulk")
    bulkUrl.searchParams.set("fids", CHECKINXYZ_FID.toString())
    bulkUrl.searchParams.set("viewer_fid", fid.toString())

    const bulkResponse = await fetch(bulkUrl.toString(), {
      headers: {
        accept: "application/json",
        "x-api-key": neynarApiKey,
      },
    })

    if (!bulkResponse.ok) {
      const errorText = await bulkResponse.text()
      console.error("[v0] Neynar bulk API error:", errorText)
      return NextResponse.json({ error: "Failed to verify follow status" }, { status: 500 })
    }

    const bulkData = await bulkResponse.json()
    console.log("[v0] Bulk API response:", JSON.stringify(bulkData, null, 2))

    const targetUser = bulkData.users?.[0]

    // viewer_context.followed_by means the viewer (user with fid) follows the target (checkinxyz)
    const isFollowing = targetUser?.viewer_context?.followed_by === true

    console.log("[v0] Target user:", targetUser?.username)
    console.log("[v0] Viewer context:", JSON.stringify(targetUser?.viewer_context))
    console.log("[v0] Is following:", isFollowing)

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
