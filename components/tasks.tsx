"use client"

import { useState, useEffect } from "react"
import { CheckCircle, ExternalLink, Gift, Loader2, UserPlus } from "lucide-react"

interface TasksProps {
  fid: number | null
}

interface TaskStatus {
  completed: boolean
  claimed: boolean
  completedAt?: string
  claimedAt?: string
}

export function Tasks({ fid }: TasksProps) {
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus>>({})
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const TASKS = [
    {
      id: "follow_checkinxyz",
      title: "Follow @checkinxyz",
      description: "Follow our official Farcaster account to stay updated",
      points: 50,
      icon: UserPlus,
      action: "Follow",
      link: "https://warpcast.com/checkinxyz",
    },
  ]

  useEffect(() => {
    if (fid) {
      fetchTaskStatus()
    } else {
      setLoading(false)
    }
  }, [fid])

  const fetchTaskStatus = async () => {
    try {
      const response = await fetch(`/api/tasks/status?fid=${fid}`)
      const data = await response.json()
      if (data.success) {
        setTaskStatuses(data.tasks || {})
      }
    } catch (err) {
      console.error("Failed to fetch task status:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyFollow = async () => {
    if (!fid) {
      setError("Please open this app in Warpcast")
      return
    }

    setVerifying(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/tasks/verify-follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fid }),
      })

      const data = await response.json()

      if (data.success) {
        if (data.alreadyCompleted) {
          setMessage(data.message)
          setTaskStatuses((prev) => ({
            ...prev,
            follow_checkinxyz: { completed: true, claimed: data.claimed },
          }))
        } else if (data.isFollowing) {
          setMessage(data.message)
          setTaskStatuses((prev) => ({
            ...prev,
            follow_checkinxyz: { completed: true, claimed: false },
          }))
        } else {
          setError("You need to follow @checkinxyz first")
        }
      } else {
        setError(data.error || "Verification failed")
      }
    } catch (err: any) {
      setError(err.message || "Verification failed")
    } finally {
      setVerifying(false)
    }
  }

  const handleClaimReward = async (taskId: string) => {
    if (!fid) {
      setError("Please open this app in Warpcast")
      return
    }

    setClaiming(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/tasks/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fid, taskId }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        setTaskStatuses((prev) => ({
          ...prev,
          [taskId]: { ...prev[taskId], claimed: true },
        }))
      } else {
        setError(data.error || "Claim failed")
      }
    } catch (err: any) {
      setError(err.message || "Claim failed")
    } finally {
      setClaiming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    )
  }

  if (!fid) {
    return (
      <div className="rounded-2xl border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-5 text-center">
        <p className="text-muted text-sm">Please open this app in Warpcast to view tasks</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Message/Error display */}
      {message && (
        <div className="rounded-xl bg-green-900/50 border border-green-500 px-4 py-3 text-sm text-green-400">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-900/50 border border-red-500 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {/* Tasks list */}
      {TASKS.map((task) => {
        const status = taskStatuses[task.id]
        const isCompleted = status?.completed
        const isClaimed = status?.claimed
        const Icon = task.icon

        return (
          <div
            key={task.id}
            className={`rounded-2xl border ${
              isClaimed
                ? "border-green-500 bg-green-950/30"
                : isCompleted
                  ? "border-cyan-500 bg-cyan-950/30"
                  : "border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900"
            } p-4 shadow-xl`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isClaimed ? "bg-green-500" : isCompleted ? "bg-cyan-500" : "bg-blue-800"
                }`}
              >
                {isClaimed ? <CheckCircle className="h-5 w-5 text-white" /> : <Icon className="h-5 w-5 text-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">{task.title}</h3>
                  <span className="text-xs font-semibold text-yellow-400">+{task.points} pts</span>
                </div>
                <p className="mt-1 text-xs text-muted">{task.description}</p>

                <div className="mt-3 flex items-center gap-2">
                  {isClaimed ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      Claimed
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaimReward(task.id)}
                      disabled={claiming}
                      className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {claiming ? <Loader2 className="h-3 w-3 animate-spin" /> : <Gift className="h-3 w-3" />}
                      Claim Reward
                    </button>
                  ) : (
                    <>
                      <a
                        href={task.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-blue-600"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {task.action}
                      </a>
                      <button
                        onClick={handleVerifyFollow}
                        disabled={verifying}
                        className="flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
                      >
                        {verifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                        Verify
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Info box */}
      <div className="rounded-xl border border-blue-600 bg-blue-950/50 px-4 py-3 text-center">
        <p className="text-xs text-muted">Complete tasks to earn bonus points! More tasks coming soon.</p>
      </div>
    </div>
  )
}
