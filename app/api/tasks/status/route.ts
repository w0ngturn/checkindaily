import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get("fid")

    if (!fid) {
      return NextResponse.json({ error: "FID required" }, { status: 400 })
    }

    // Get all tasks for user
    const { data: tasks, error } = await supabase.from("user_tasks").select("*").eq("fid", fid)

    if (error) {
      throw error
    }

    // Create task status map
    const taskStatus: Record<
      string,
      { completed: boolean; claimed: boolean; completedAt?: string; claimedAt?: string }
    > = {}

    tasks?.forEach((task) => {
      taskStatus[task.task_id] = {
        completed: true,
        claimed: !!task.claimed_at,
        completedAt: task.completed_at,
        claimedAt: task.claimed_at,
      }
    })

    return NextResponse.json({
      success: true,
      tasks: taskStatus,
    })
  } catch (error: any) {
    console.error("Task status error:", error)
    return NextResponse.json({ error: error.message || "Failed to get task status" }, { status: 500 })
  }
}
