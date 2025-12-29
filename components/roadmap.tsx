"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Check, Clock } from "lucide-react"

interface PhaseItem {
  title: string
  completed: boolean
}

interface Phase {
  phase: string
  title: string
  status: "completed" | "in-progress" | "upcoming"
  description: string
  items: PhaseItem[]
}

export default function Roadmap() {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)

  const phases: Phase[] = [
    {
      phase: "Phase 1",
      title: "Foundation",
      status: "completed",
      description: "Brand identity, website launch, and social media presence establishment.",
      items: [
        { title: "Brand & Logo Design", completed: true },
        { title: "Website Launch", completed: true },
        { title: "Social Media Setup", completed: true },
        { title: "Community Channels", completed: true },
      ],
    },
    {
      phase: "Phase 2",
      title: "Core Product",
      status: "completed",
      description: "Check-in engine development with streak tracking and user analytics.",
      items: [
        { title: "Check-in Engine", completed: true },
        { title: "Streak Tracking", completed: true },
        { title: "User Dashboard", completed: true },
        { title: "Leaderboard System", completed: true },
      ],
    },
    {
      phase: "Phase 3",
      title: "Referral Rewards",
      status: "upcoming",
      description:
        "Implement referral rewards system with invite bonuses, tier-based rewards, and points accumulation to incentivize community growth.",
      items: [
        { title: "Referral Link System", completed: false },
        { title: "Invite Bonus Rewards", completed: false },
        { title: "Tier-based Multipliers", completed: false },
        { title: "Referral Leaderboard", completed: false },
      ],
    },
    {
      phase: "Phase 4",
      title: "$CHECKIN Token Launch",
      status: "upcoming",
      description:
        "Launch of $CHECKIN token as the main reward for the community. Token will be used for staking, governance, and exclusive benefits for holders.",
      items: [
        { title: "Token Smart Contract Development", completed: false },
        { title: "Tokenomics & Distribution Plan", completed: false },
        { title: "Airdrop for Early Supporters", completed: false },
        { title: "DEX Listing & Liquidity Pool", completed: false },
      ],
    },
    {
      phase: "Phase 5",
      title: "Claim Tokens",
      status: "upcoming",
      description:
        "Users can claim their earned $CHECKIN tokens based on accumulated points from check-ins, streaks, referrals, and completed tasks.",
      items: [
        { title: "Points to Token Conversion System", completed: false },
        { title: "Claim Portal Development", completed: false },
        { title: "Vesting Schedule Implementation", completed: false },
        { title: "Claim History & Tracking", completed: false },
      ],
    },
  ]

  const togglePhase = (phase: string) => {
    setExpandedPhase(expandedPhase === phase ? null : phase)
  }

  const getStatusColor = (status: Phase["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-400"
      case "in-progress":
        return "text-cyan-400"
      case "upcoming":
        return "text-gray-400"
    }
  }

  const getStatusBadge = (status: Phase["status"]) => {
    switch (status) {
      case "completed":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">Completed</span>
      case "in-progress":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-400">In Progress</span>
      case "upcoming":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-500/20 text-gray-400">Upcoming</span>
    }
  }

  return (
    <section id="roadmap" className="mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Roadmap</h2>
      <div className="flex flex-col gap-3">
        {phases.map((item) => (
          <div
            key={item.phase}
            className="rounded-xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #0e1b52, var(--card))",
              border: "1px solid var(--border)",
            }}
          >
            {/* Clickable Header */}
            <button
              onClick={() => togglePhase(item.phase)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    item.status === "completed"
                      ? "bg-green-500/20"
                      : item.status === "in-progress"
                        ? "bg-cyan-500/20"
                        : "bg-gray-500/20"
                  }`}
                >
                  {item.status === "completed" ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : item.status === "in-progress" ? (
                    <Clock className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <span className="text-sm text-gray-400">{item.phase.split(" ")[1]}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className={`text-base ${getStatusColor(item.status)}`}>{item.phase}</strong>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-sm text-gray-400">{item.title}</p>
                </div>
              </div>
              {expandedPhase === item.phase ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Expandable Content */}
            {expandedPhase === item.phase && (
              <div className="px-4 pb-4 border-t border-white/10">
                <p className="text-sm text-gray-300 mt-3 mb-4">{item.description}</p>
                <div className="space-y-2">
                  {item.items.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          task.completed ? "bg-green-500" : "bg-gray-600"
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={task.completed ? "text-gray-300" : "text-gray-500"}>{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
