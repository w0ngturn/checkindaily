"use client"

import { useEffect, useState } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { StreakDisplay } from "@/components/streak-display"
import { RewardsDisplay } from "@/components/rewards-display"
import { AnalyticsPanel } from "@/components/analytics-panel"
import { Leaderboard } from "@/components/leaderboard"
import { BottomNav } from "@/components/bottom-nav"
import { getUsernameFromNeynar } from "@/lib/get-username-client"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userFid, setUserFid] = useState<number | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [showSplash, setShowSplash] = useState(true)
  const [checkinSuccess, setCheckinSuccess] = useState(false)
  const [checkinData, setCheckinData] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState<"leaderboard" | "features" | "roadmap">("leaderboard")

  useEffect(() => {
    const initializeApp = async () => {
      try {
        let sdk: any = null
        try {
          const module = await import("@farcaster/miniapp-sdk")
          sdk = module.sdk
        } catch (e) {
          console.log("[v0] SDK not available")
          setShowSplash(false)
          return
        }

        if (sdk?.actions?.ready) {
          sdk.actions.ready?.().catch(() => {})
        }

        if (sdk?.context) {
          try {
            const context = await Promise.race([
              sdk.context,
              new Promise((_, reject) => setTimeout(() => reject("timeout"), 1500)),
            ])

            if (context?.user?.fid) {
              const fid = context.user.fid
              setUserFid(fid)

              let username = context.user.username || "User"
              if (!context.user.username || context.user.username === "User") {
                const neynarUsername = await getUsernameFromNeynar(fid)
                if (neynarUsername) {
                  username = neynarUsername
                }
              }

              setUserData({
                fid,
                username,
                displayName: context.user.displayName || username || "User",
                pfpUrl: context.user.pfpUrl || null,
              })
            }
          } catch (e) {
            console.log("[v0] Context not available")
          }
        }
      } catch (err) {
        console.log("[v0] Init error:", err)
      } finally {
        setTimeout(() => setShowSplash(false), 800)
      }
    }

    initializeApp()
  }, [])

  const handleCheckin = async () => {
    setLoading(true)
    setError("")
    setCheckinSuccess(false)

    try {
      let fid = userFid

      if (!fid) {
        try {
          const module = await import("@farcaster/miniapp-sdk")
          const sdk = module.sdk
          const context = await Promise.resolve(sdk.context)
          fid = context?.user?.fid
        } catch (e) {
          console.log("[v0] Could not get FID during checkin:", e)
        }
      }

      if (!fid) {
        throw new Error("User FID not available. Please ensure you are opening this app in Warpcast.")
      }

      const response = await fetch("/api/checkin-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fid,
          username: userData?.username,
          displayName: userData?.displayName,
          pfpUrl: userData?.pfpUrl,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setCheckinData({
          message: data.message,
          streak: data.streak,
          pointsEarned: data.pointsEarned,
          tier: data.tier,
          alreadyCheckedIn: data.alreadyCheckedIn,
        })
        setCheckinSuccess(true)
        setRefreshKey((prev) => prev + 1)

        setTimeout(() => {
          setCheckinSuccess(false)
        }, 5000)
      } else {
        setError(data.error || "Check-in failed")
      }
    } catch (err: any) {
      console.error("[v0] Check-in error:", err)
      setError(err.message || "Failed to check in. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SplashScreen isVisible={showSplash} />

      <main className="min-h-screen bg-background text-foreground pb-20">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-7">
          <header className="flex items-center justify-between py-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-400 shadow-xl"
              aria-label="CHECKIN logo"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                <path d="M6 12l4 4 8-8" stroke="#020515" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-bold text-cyan-400">CHECKIN</span>
          </header>

          <section className="mt-4">
            <div className="rounded-3xl border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-5 shadow-2xl">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground">
                  Check in daily.
                  <br />
                  <span className="text-cyan-400">Get rewarded.</span>
                </h1>
                <p className="mt-2 text-sm text-muted">Build streaks and unlock on-chain incentives.</p>
                <button
                  onClick={handleCheckin}
                  disabled={loading || showSplash}
                  className="mt-4 w-full rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-400 px-4 py-3 font-bold text-slate-950 shadow-xl transition-shadow hover:shadow-2xl disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {showSplash ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      Initializing...
                    </>
                  ) : loading ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      Checking in...
                    </>
                  ) : (
                    "Start Checking In"
                  )}
                </button>
                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
              </div>
            </div>
          </section>

          {/* Check-in success modal */}
          {checkinSuccess && checkinData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="rounded-3xl border border-cyan-400 bg-gradient-to-b from-blue-950 to-blue-900 p-6 shadow-2xl max-w-sm w-full">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-400">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
                      <path
                        d="M6 12l4 4 8-8"
                        stroke="#020515"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-cyan-400">
                    {checkinData.alreadyCheckedIn ? "Already Checked In!" : "Check-in Successful!"}
                  </h3>
                  <p className="mb-4 text-muted text-sm">{checkinData.message}</p>
                  <div className="space-y-2">
                    <div className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-foreground">
                      Streak: {checkinData.streak} days
                    </div>
                    {!checkinData.alreadyCheckedIn && (
                      <div className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-yellow-400">
                        +{checkinData.pointsEarned || 10} points
                      </div>
                    )}
                    {checkinData.tier && (
                      <div className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-cyan-400">
                        Tier: {checkinData.tier.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setCheckinSuccess(false)}
                    className="mt-4 w-full rounded-xl bg-blue-800 px-4 py-2 text-sm font-semibold text-foreground hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {userFid && (
            <section className="mt-4" key={refreshKey}>
              <div className="grid gap-3 grid-cols-3">
                <StreakDisplay fid={userFid} />
                <RewardsDisplay fid={userFid} />
                <AnalyticsPanel fid={userFid} />
              </div>
            </section>
          )}

          <section className="mt-6">
            {activeTab === "leaderboard" && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-foreground">Community Leaderboard</h2>
                <Leaderboard />
              </div>
            )}

            {activeTab === "features" && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-foreground">Core Features</h2>
                <div className="space-y-3">
                  {[
                    { title: "Daily Check-In", desc: "Simple on-chain or off-chain proof of activity.", icon: "📅" },
                    { title: "Streak Multipliers", desc: "Longer streaks unlock higher rewards.", icon: "🔥" },
                    { title: "Community Drops", desc: "Airdrops based on real engagement, not bots.", icon: "🎁" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-4 shadow-xl"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                          <p className="mt-1 text-xs text-muted">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "roadmap" && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-foreground">Roadmap</h2>
                <div className="space-y-3">
                  {[
                    { phase: "Phase 1", desc: "Brand, site, social launch", status: "completed" },
                    { phase: "Phase 2", desc: "Check-in engine + streaks", status: "current" },
                    { phase: "Phase 3", desc: "Rewards & partnerships", status: "upcoming" },
                    { phase: "Phase 4", desc: "DAO & integrations", status: "upcoming" },
                  ].map((item) => (
                    <div
                      key={item.phase}
                      className={`rounded-2xl border p-4 shadow-xl ${
                        item.status === "current"
                          ? "border-cyan-400 bg-gradient-to-b from-blue-900 to-blue-950"
                          : "border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-sm text-foreground">{item.phase}</strong>
                          <p className="mt-1 text-xs text-muted">{item.desc}</p>
                        </div>
                        {item.status === "completed" && (
                          <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-semibold text-green-400">
                            Done
                          </span>
                        )}
                        {item.status === "current" && (
                          <span className="rounded-full bg-cyan-400/20 px-2 py-1 text-xs font-semibold text-cyan-400">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  )
}
