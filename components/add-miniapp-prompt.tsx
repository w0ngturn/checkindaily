"use client"

import { useState } from "react"

interface AddMiniAppPromptProps {
  isOpen: boolean
  onClose: () => void
  onAdded: () => void
}

export function AddMiniAppPrompt({ isOpen, onClose, onAdded }: AddMiniAppPromptProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAddMiniApp = async () => {
    setLoading(true)
    setError("")

    try {
      const module = await import("@farcaster/miniapp-sdk")
      const sdk = module.sdk

      await sdk.actions.addMiniApp()

      // If we reach here, mini app was added successfully
      onAdded()
      onClose()
    } catch (err: any) {
      console.log("[v0] Add mini app error:", err)

      const errorMessage = err?.message || err?.toString() || ""

      if (errorMessage.includes("RejectedByUser") || errorMessage.includes("rejected")) {
        setError("You cancelled the request. Tap 'Add to Warpcast' to try again.")
      } else if (errorMessage.includes("InvalidDomainManifest") || errorMessage.includes("manifest")) {
        setError("Configuration error. Please contact support.")
      } else if (errorMessage.includes("already")) {
        // Mini app already added
        onAdded()
        onClose()
      } else {
        setError("Could not add mini app. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-3xl border border-cyan-400 bg-gradient-to-b from-blue-950 to-blue-900 p-6 shadow-2xl max-w-sm w-full">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-400">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
              <path
                d="M12 5v14M5 12h14"
                stroke="#020515"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-cyan-400">Add CHECKIN</h3>
          <p className="mb-4 text-muted text-sm">
            Add CHECKIN to your Warpcast for quick access and notifications about your streaks and rewards.
          </p>

          {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

          <div className="space-y-2">
            <button
              onClick={handleAddMiniApp}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-br from-cyan-400 to-blue-400 px-4 py-3 text-sm font-bold text-slate-950 shadow-xl transition-shadow hover:shadow-2xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  Adding...
                </>
              ) : (
                "Add to Warpcast"
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-blue-800 px-4 py-2 text-sm font-semibold text-foreground hover:bg-blue-700"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
