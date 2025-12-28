"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface AddMiniAppPromptProps {
  onClose: () => void
  onAdded: () => void
}

export function AddMiniAppPrompt({ onClose, onAdded }: AddMiniAppPromptProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState("")

  const handleAddMiniApp = async () => {
    setIsAdding(true)
    setError("")

    try {
      const sdk = (await import("@farcaster/frame-sdk")).default
      await sdk.actions.addFrame()
      onAdded()
    } catch (err: any) {
      if (err?.message?.includes("RejectedByUser")) {
        setError("You declined to add the mini app. Add it later from the menu.")
      } else if (err?.message?.includes("InvalidDomainManifestJson")) {
        setError("Configuration error. Please try again later.")
      } else {
        setError("Failed to add mini app. Please try again.")
      }
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rounded-3xl border border-cyan-400 bg-gradient-to-b from-blue-950 to-blue-900 p-6 shadow-2xl max-w-sm w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

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
            Add CHECKIN to your Warpcast home for quick access and never miss a daily check-in!
          </p>

          <div className="space-y-3">
            <button
              onClick={handleAddMiniApp}
              disabled={isAdding}
              className="w-full rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-400 px-4 py-3 font-bold text-slate-950 shadow-xl transition-shadow hover:shadow-2xl disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {isAdding ? (
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

          {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  )
}
