"use client"

import { useState } from "react"
import { Bell, BellOff } from "lucide-react"

interface NotificationSettingsProps {
  fid: number
}

export function NotificationSettings({ fid }: NotificationSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(false)

  return (
    <div className="rounded-2xl border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isEnabled ? <Bell className="h-5 w-5 text-cyan-400" /> : <BellOff className="h-5 w-5 text-muted" />}
          <div>
            <h3 className="text-sm font-bold text-foreground">Push Notifications</h3>
            <p className="text-xs text-muted">Enable from Warpcast menu</p>
          </div>
        </div>
        <span className="rounded-xl bg-blue-800 px-4 py-2 text-xs font-bold text-muted">Use Menu</span>
      </div>
      <p className="mt-2 text-xs text-muted text-center">Tap the 3-dot menu in Warpcast to turn on notifications</p>
    </div>
  )
}
