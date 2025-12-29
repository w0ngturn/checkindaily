import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { fid, taskId } = await request.json()

    if (!fid || !taskId) {
      return NextResponse.json({ error: "FID and taskId required" }, { status: 400 })
    }

    // Check if task exists and is completed but not claimed
    const { data: task, error: taskError } = await supabase
      .from("user_tasks")
      .select("*")
      .eq("fid", fid)
      .eq("task_id", taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found or not completed" }, { status: 404 })
    }

    if (task.claimed_at) {
      return NextResponse.json({ error: "Task already claimed" }, { status: 400 })
    }

    const pointsReward = task.points_reward || 50

    // Mark task as claimed
    const { error: updateTaskError } = await supabase
      .from("user_tasks")
      .update({ claimed_at: new Date().toISOString() })
      .eq("fid", fid)
      .eq("task_id", taskId)

    if (updateTaskError) {
      throw updateTaskError
    }

    // Add points to user_rewards
    const { data: existingReward } = await supabase.from("user_rewards").select("*").eq("fid", fid).single()

    if (existingReward) {
      // Update existing rewards
      const newTotal = (existingReward.total_points || 0) + pointsReward
      const newTier = calculateTier(newTotal)

      await supabase
        .from("user_rewards")
        .update({
          total_points: newTotal,
          tier: newTier,
          updated_at: new Date().toISOString(),
        })
        .eq("fid", fid)
    } else {
      // Create new rewards record
      await supabase.from("user_rewards").insert({
        fid,
        total_points: pointsReward,
        tier: "bronze",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    // Add to reward history
    await supabase.from("reward_history").insert({
      fid,
      points_earned: pointsReward,
      streak_at_time: 0,
      multiplier: 1,
      earned_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      pointsClaimed: pointsReward,
      message: `Successfully claimed ${pointsReward} points!`,
    })
  } catch (error: any) {
    console.error("Claim task error:", error)
    return NextResponse.json({ error: error.message || "Claim failed" }, { status: 500 })
  }
}

function calculateTier(points: number): string {
  if (points >= 1000) return "platinum"
  if (points >= 500) return "gold"
  if (points >= 150) return "silver" // Changed from 100 to 150
  return "bronze"
}
