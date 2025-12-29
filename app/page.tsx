"use client"

import { useEffect, useState, useCallback } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { StreakDisplay } from "@/components/streak-display"
import { RewardsDisplay } from "@/components/rewards-display"
import { AnalyticsPanel } from "@/components/analytics-panel"
import { Leaderboard } from "@/components/leaderboard"
import { BottomNav } from "@/components/bottom-nav"
import { Tasks } from "@/components/tasks"
import { Tokens } from "@/components/tokens"
import { getUsernameFromNeynar } from "@/lib/get-username-client"
import Roadmap from "@/components/roadmap"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userFid, setUserFid] = useState<number | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [showSplash, setShowSplash] = useState(true)
  const [checkinSuccess, setCheckinSuccess] = useState(false)
  const [checkinData, setCheckinData] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState<"home" | "leaderboard" | "roadmap" | "tasks" | "tokens">("home")
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  const initializeContext = useCallback(async () => {
    try {
      // Listen for context from Warpcast parent
      const handleMessage = async (event: MessageEvent) => {
        if (event.data?.type === "frameContext" && event.data?.context?.user?.fid) {
          const context = event.data.context
          const fid = context.user.fid
          setUserFid(fid)

          let username = context.user.username || "User"
          if (!username || username === "User") {
            try {
              const neynarUsername = await getUsernameFromNeynar(fid)
              if (neynarUsername) username = neynarUsername
            } catch {}
          }

          setUserData({
            fid,
            username,
            displayName: context.user.displayName || username,
            pfpUrl: context.user.pfpUrl || null,
          })
        }
      }

      window.addEventListener("message", handleMessage)

      // Request context from parent
      if (window.parent !== window) {
        window.parent.postMessage({ type: "requestContext" }, "*")
      }

      // Fallback: try to get FID from URL params or localStorage for testing
      const urlParams = new URLSearchParams(window.location.search)
      const fidParam = urlParams.get("fid")
      if (fidParam) {
        const fid = Number.parseInt(fidParam, 10)
        if (!isNaN(fid)) {
          setUserFid(fid)
          try {
            const username = await getUsernameFromNeynar(fid)
            setUserData({
              fid,
              username: username || "User",
              displayName: username || "User",
              pfpUrl: null,
            })
          } catch {}
        }
      }

      // Signal ready to Warpcast
      if (window.parent !== window) {
        window.parent.postMessage({ type: "frameReady" }, "*")
      }

      return () => window.removeEventListener("message", handleMessage)
    } catch (err) {
      console.log("Context initialization error:", err)
    } finally {
      setTimeout(() => setShowSplash(false), 500)
    }
  }, [])

  useEffect(() => {
    initializeContext()
  }, [initializeContext])

  const handleCheckin = async () => {
    setLoading(true)
    setError("")
    setCheckinSuccess(false)

    try {
      const fid = userFid

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to check in. Please try again."
      setError(errorMessage)
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

          {activeTab === "home" && (
            <>
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

              <section className="mt-4">
                <button
                  onClick={() => setShowHowItWorks(!showHowItWorks)}
                  className="w-full flex items-center justify-between rounded-2xl border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 px-4 py-3 shadow-xl"
                >
                  <span className="text-sm font-bold text-foreground">How it works</span>
                  {showHowItWorks ? (
                    <ChevronUp className="h-5 w-5 text-cyan-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-cyan-400" />
                  )}
                </button>

                {showHowItWorks && (
                  <div className="mt-3 space-y-3">
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
                )}
              </section>

              {userFid && (
                <section className="mt-4" key={refreshKey}>
                  <div className="grid gap-3 grid-cols-3">
                    <StreakDisplay fid={userFid} />
                    <RewardsDisplay fid={userFid} />
                    <AnalyticsPanel fid={userFid} />
                  </div>
                </section>
              )}
            </>
          )}

          {activeTab === "tasks" && (
            <section className="mt-4">
              <h2 className="mb-4 text-lg font-bold text-foreground">Tasks</h2>
              <Tasks fid={userFid} />
            </section>
          )}

          {activeTab === "leaderboard" && (
            <section className="mt-4">
              <h2 className="mb-4 text-lg font-bold text-foreground">Community Leaderboard</h2>
              <Leaderboard />
            </section>
          )}

          {activeTab === "roadmap" && (
            <section className="mt-4">
              <Roadmap />
            </section>
          )}

          {activeTab === "tokens" && (
            <section className="mt-4">
              <h2 className="mb-4 text-lg font-bold text-foreground">$CHECKIN Token</h2>
              <Tokens />
            </section>
          )}
        </div>
      </main>

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

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  )
}
