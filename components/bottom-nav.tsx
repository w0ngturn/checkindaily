"use client"

import { Trophy, Sparkles, Map } from "lucide-react"

interface BottomNavProps {
  activeTab: "leaderboard" | "features" | "roadmap"
  onTabChange: (tab: "leaderboard" | "features" | "roadmap") => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "leaderboard" as const, label: "Leaderboard", icon: Trophy },
    { id: "features" as const, label: "Features", icon: Sparkles },
    { id: "roadmap" as const, label: "Roadmap", icon: Map },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-blue-600 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1100px] items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
                isActive ? "text-cyan-400" : "text-muted hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-cyan-400" : ""}`} />
              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
