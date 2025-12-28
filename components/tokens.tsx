"use client"

import { useState } from "react"
import { Coins, Rocket, Gift, ChevronDown, ChevronUp } from "lucide-react"

export function Tokens() {
  const [expandedSection, setExpandedSection] = useState<string | null>("about")

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="space-y-4">
      {/* Token Header */}
      <div className="rounded-3xl border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-5 shadow-2xl text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-400">
          <Coins className="h-8 w-8 text-slate-950" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">$CHECKIN</h2>
        <p className="mt-1 text-sm text-cyan-400">Coming Soon</p>
        <p className="mt-2 text-xs text-muted">The official token powering the CHECKIN ecosystem</p>
      </div>

      {/* About Section */}
      <div className="rounded-2xl border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 shadow-xl overflow-hidden">
        <button onClick={() => toggleSection("about")} className="w-full flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Rocket className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-bold text-foreground">About $CHECKIN</span>
          </div>
          {expandedSection === "about" ? (
            <ChevronUp className="h-5 w-5 text-cyan-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-cyan-400" />
          )}
        </button>
        {expandedSection === "about" && (
          <div className="px-4 pb-4 text-xs text-muted space-y-2">
            <p>$CHECKIN is the native utility token designed to reward consistent community engagement.</p>
            <p>
              Token holders will enjoy exclusive benefits including governance rights, staking rewards, and access to
              premium features.
            </p>
          </div>
        )}
      </div>

      {/* Utility Section */}
      <div className="rounded-2xl border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 shadow-xl overflow-hidden">
        <button onClick={() => toggleSection("utility")} className="w-full flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Gift className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-bold text-foreground">Token Utility</span>
          </div>
          {expandedSection === "utility" ? (
            <ChevronUp className="h-5 w-5 text-cyan-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-cyan-400" />
          )}
        </button>
        {expandedSection === "utility" && (
          <div className="px-4 pb-4 space-y-3">
            {[
              {
                title: "Staking Rewards",
                desc: "Stake $CHECKIN to earn passive rewards and boost your streak multipliers",
              },
              { title: "Governance", desc: "Vote on protocol upgrades, reward distributions, and new features" },
              { title: "Exclusive Access", desc: "Unlock premium features, early airdrops, and special events" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-blue-900/50 p-3">
                <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                <p className="mt-1 text-xs text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Airdrop Notice */}
      <div className="rounded-2xl border border-cyan-400/50 bg-gradient-to-b from-cyan-950/50 to-blue-950 p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <Gift className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-cyan-400">Early Supporter Airdrop</h4>
            <p className="mt-1 text-xs text-muted">
              Keep checking in daily and complete tasks to maximize your airdrop allocation. Your points and streak
              history will determine your share of the token distribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
