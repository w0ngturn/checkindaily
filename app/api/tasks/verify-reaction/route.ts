import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fid, taskId, reactionType, castHash } = body

    console.log("[v0] verify-reaction called:", { fid, taskId, reactionType, castHash })

    if (!fid || !taskId || !reactionType || !castHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const neynarApiKey = process.env.NEYNAR_API_KEY

    if (!neynarApiKey) {
      console.log("[v0] NEYNAR_API_KEY not found")
      return NextResponse.json({ error: "Neynar API not configured" }, { status: 500 })
    }

    // Check if task already completed
    const { data: existingTask } = await supabase
      .from("user_tasks")
      .select("*")
      .eq("fid", fid)
      .eq("task_id", taskId)
      .single()

    if (existingTask) {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        claimed: !!existingTask.claimed_at,
        message: existingTask.claimed_at ? "Task already claimed" : "Task completed, ready to claim",
      })
    }

    const neynarReactionType = reactionType === "like" ? "likes" : "recasts"

    // Fetch reactions for the cast
    const reactionsUrl = `https://api.neynar.com/v2/farcaster/reactions/cast?hash=${castHash}&types=${neynarReactionType}&limit=100`

    console.log("[v0] Fetching reactions from:", reactionsUrl)

    let cursor: string | null = null
    let hasReaction = false
    let attempts = 0
    const maxAttempts = 10 // Check up to 1000 reactions

    while (attempts < maxAttempts && !hasReaction) {
      const url = cursor ? `${reactionsUrl}&cursor=${cursor}` : reactionsUrl

      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          "x-api-key": neynarApiKey,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Neynar API error:", response.status, errorText)
        return NextResponse.json({ error: "Failed to verify reaction" }, { status: 500 })
      }

      const data = await response.json()
      console.log("[v0] Neynar response:", JSON.stringify(data).substring(0, 500))

      const reactions = data?.reactions || []

      // Check if user's FID is in the reactions
      for (const reaction of reactions) {
        console.log("[v0] Checking reaction user fid:", reaction.user?.fid, "against:", fid)
        if (reaction.user?.fid === fid) {
          hasReaction = true
          break
        }
      }

      cursor = data?.next?.cursor
      if (!cursor) break
      attempts++
    }

    console.log("[v0] Has reaction:", hasReaction)

    if (hasReaction) {
      // Determine task name and points based on reaction type
      const taskName = reactionType === "like" ? "Like announcement" : "Recast announcement"
      const points = 25

      // Mark task as completed
      await supabase.from("user_tasks").insert({
        fid,
        task_id: taskId,
        task_name: taskName,
        points_reward: points,
        completed_at: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        verified: true,
        message: `Verified! You ${reactionType === "like" ? "liked" : "recasted"} the post. Claim your reward!`,
      })
    }

    return NextResponse.json({
      success: true,
      verified: false,
      message: `Please ${reactionType} the post first`,
    })
  } catch (error: any) {
    console.error("[v0] Verify reaction error:", error)
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 })
  }
}
