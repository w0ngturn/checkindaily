"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff } from "lucide-react"

interface NotificationSettingsProps {
  fid: number
}

export function NotificationSettings({ fid }: NotificationSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)

  useEffect(() => {
    const initSdk = async () => {
      try {
        const module = await import("@farcaster/miniapp-sdk")
        const sdk = module.sdk

        const context = await sdk.context
        if (context) {
          setSdkReady(true)
          // Check if notifications are already enabled
          const notificationDetails = context.client?.notificationDetails
          setIsEnabled(!!notificationDetails)
        }
      } catch (e) {
        console.error("Failed to init SDK:", e)
      } finally {
        setIsLoading(false)
      }
    }
    initSdk()
  }, [])

  const handleToggleNotifications = async () => {
    if (!sdkReady) return

    setIsToggling(true)
    try {
      const module = await import("@farcaster/miniapp-sdk")
      const sdk = module.sdk

      if (isEnabled) {
        // Disable notifications
        await sdk.actions.disableNotifications()
        setIsEnabled(false)
      } else {
        // Enable notifications using SDK
        await sdk.actions.requestNotificationPermission()
        setIsEnabled(true)
      }
    } catch (error: any) {
      if (error?.message?.includes("already")) {
        setIsEnabled(true)
      } else {
        console.error("Failed to toggle notifications:", error)
      }
    } finally {
      setIsToggling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-4 shadow-xl">
        <div className="flex items-center justify-center py-2">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isEnabled ? <Bell className="h-5 w-5 text-cyan-400" /> : <BellOff className="h-5 w-5 text-muted" />}
          <div>
            <h3 className="text-sm font-bold text-foreground">Push Notifications</h3>
            <p className="text-xs text-muted">{isEnabled ? "Daily reminders enabled" : "Get streak reminders"}</p>
          </div>
        </div>
        <button
          onClick={handleToggleNotifications}
          disabled={isToggling || !sdkReady}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
            isEnabled
              ? "bg-blue-800 text-foreground hover:bg-blue-700"
              : "bg-gradient-to-br from-cyan-400 to-blue-400 text-slate-950"
          }`}
        >
          {isToggling ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {isEnabled ? "Disabling..." : "Enabling..."}
            </span>
          ) : isEnabled ? (
            "Enabled"
          ) : (
            "Enable"
          )}
        </button>
      </div>
      {!sdkReady && <p className="mt-2 text-xs text-muted text-center">Open in Warpcast to manage notifications</p>}
    </div>
  )
}
