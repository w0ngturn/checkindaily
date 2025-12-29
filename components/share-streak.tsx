"use client"

import { useState } from "react"

interface ShareStreakProps {
  fid: number
  streakCount: number
  totalPoints: number
  tier: string
}

export function ShareStreak({ fid, streakCount, totalPoints, tier }: ShareStreakProps) {
  const [sharing, setSharing] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)

  const handleShare = async () => {
    setSharing(true)
    try {
      const shareText = `🔥 I'm on a ${streakCount}-day streak on CHECKIN!\n\n✨ Earned ${totalPoints} points at ${tier} tier.\n\nJoin me and start building your streak!`
      const shareUrl = `https://checkindaily.xyz`
      const composeUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(shareUrl)}`

      try {
        const { sdk } = await import("@farcaster/miniapp-sdk")
        await sdk.actions.openUrl(composeUrl)
      } catch (error) {
        console.error("Failed to open composer with SDK:", error)
        window.open(composeUrl, "_blank")
      }

      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    } catch (error) {
      console.error("Share error:", error)
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="mt-4 flex gap-2">
      <button
        onClick={handleShare}
        disabled={sharing}
        className="flex-1 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg transition-shadow hover:shadow-xl disabled:opacity-50"
      >
        {sharing ? "Sharing..." : shareSuccess ? "Shared!" : "Share Streak"}
      </button>
    </div>
  )
}
