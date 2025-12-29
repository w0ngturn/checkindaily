"use client"

import { useState } from "react"
import { Coins, Rocket, Gift, ChevronDown, ChevronUp, Copy, Check, ExternalLink } from "lucide-react"

const CONTRACT_ADDRESS = "0xC7a98B59785504D6ffBE024Ed878fc53aFd38B07"

export function Tokens() {
  const [expandedSection, setExpandedSection] = useState<string | null>("about")
  const [copied, setCopied] = useState(false)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const copyContractAddress = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Token Header */}
      <div className="rounded-3xl border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-5 shadow-2xl text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-400">
          <Coins className="h-8 w-8 text-slate-950" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">$CHECKIN</h2>
        <p className="mt-2 text-sm font-bold text-green-400 animate-pulse">$CHECKIN IS NOW LIVE</p>
        <p className="mt-2 text-xs text-muted">The official token powering the CHECKIN ecosystem</p>
      </div>

      {/* Contract Address */}
      <div className="rounded-2xl border border-cyan-400/50 bg-gradient-to-b from-cyan-950/50 to-blue-950 p-4 shadow-xl">
        <p className="text-xs text-cyan-400 mb-2">Contract Address</p>
        <button
          onClick={copyContractAddress}
          className="w-full flex items-center justify-between gap-2 rounded-xl bg-blue-900/50 p-3 hover:bg-blue-800/50 transition-colors group"
        >
          <span className="font-mono text-xs text-foreground break-all text-left">{CONTRACT_ADDRESS}</span>
          {copied ? (
            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 flex-shrink-0" />
          )}
        </button>
        {copied && <p className="text-xs text-green-400 mt-2 text-center">Copied to clipboard!</p>}

        <a
          href={`https://basescan.org/token/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          View on BaseScan
        </a>
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
