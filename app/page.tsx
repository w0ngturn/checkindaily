"use client"

import { useEffect, useState } from "react"
import { StreakDisplay } from "@/components/streak-display"
import { RewardsDisplay } from "@/components/rewards-display"
import { AnalyticsPanel } from "@/components/analytics-panel"
import { Leaderboard } from "@/components/leaderboard"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userFid, setUserFid] = useState<number | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [userDetecting, setUserDetecting] = useState(true)
  const [checkinSuccess, setCheckinSuccess] = useState(false)
  const [checkinData, setCheckinData] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        let sdk: any = null
        try {
          const module = await import("@farcaster/miniapp-sdk")
          sdk = module.sdk
        } catch (e) {
          console.log("[v0] SDK not available:", e)
        }

        if (!sdk) {
          console.log("[v0] No SDK available, using fallback")
          setAppReady(true)
          setUserDetecting(false)
          return
        }

        if (sdk.actions?.ready) {
          sdk.actions.ready().catch(() => {
            console.log("[v0] Ready action failed")
          })
        }

        const contextPromise = Promise.race([
          Promise.resolve(sdk.context),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Context timeout")), 2000)),
        ])

        try {
          const context = await contextPromise
          if (context?.user?.fid) {
            setUserFid(context.user.fid)
            setUserData({
              fid: context.user.fid,
              username: context.user.username || "User",
              displayName: context.user.displayName || context.user.username || "User",
              pfpUrl: context.user.pfpUrl || null,
            })
          }
        } catch (e) {
          console.log("[v0] Context access failed or timed out:", e)
        }

        setAppReady(true)
        setUserDetecting(false)
      } catch (err) {
        console.log("[v0] Initialization error:", err)
        setAppReady(true)
        setUserDetecting(false)
      }
    }

    initializeApp()
  }, [])

  const handleCheckin = async () => {
    if (!appReady) {
      setError("App is initializing. Please wait...")
      return
    }

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

      console.log("[v0] Checking in with FID:", fid)

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
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-7">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-5 sm:py-7 gap-4">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-400 shadow-xl"
            aria-label="CHECKIN logo"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
              <path d="M6 12l4 4 8-8" stroke="#020515" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <nav className="flex flex-wrap gap-2 w-full sm:w-auto">
            <a
              href="#features"
              className="rounded-3xl border border-blue-600 px-3 sm:px-4.5 py-2 sm:py-3 text-sm sm:text-base font-bold text-foreground transition-colors hover:bg-blue-950 flex-1 sm:flex-none text-center"
            >
              Features
            </a>
            <a
              href="#roadmap"
              className="rounded-3xl border border-blue-600 px-3 sm:px-4.5 py-2 sm:py-3 text-sm sm:text-base font-bold text-foreground transition-colors hover:bg-blue-950 flex-1 sm:flex-none text-center"
            >
              Roadmap
            </a>
            <a
              href="#cta"
              className="rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-400 px-3 sm:px-4.5 py-2 sm:py-3 text-sm sm:text-base font-bold text-slate-950 shadow-xl transition-shadow hover:shadow-2xl flex-1 sm:flex-none text-center"
            >
              Join
            </a>
          </nav>
        </header>

        <section
          className="mt-8 sm:mt-15 grid gap-7 grid-cols-1 sm:grid-cols-2"
          style={{ gridTemplateColumns: "auto" }}
        >
          <div className="sm:col-span-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-950 px-3 py-2 text-xs sm:text-sm font-semibold text-cyan-400">
              Consistency → Rewards
            </span>
            <h1 className="mt-3 sm:mt-4.5 text-3xl sm:text-5xl font-bold leading-tight text-foreground">
              Check in daily.
              <br />
              Build streaks.
              <br />
              Get rewarded.
            </h1>
            <p className="mt-4 sm:mt-5.5 text-base sm:text-lg text-muted">
              CHECKIN is a Web3 activity layer that rewards presence. Every check‑in proves consistency and unlocks
              on‑chain incentives.
            </p>
            <div className="mt-4 sm:mt-5.5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCheckin}
                disabled={loading || !appReady || userDetecting}
                className="rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-400 px-4 sm:px-4.5 py-3 font-bold text-slate-950 shadow-xl transition-shadow hover:shadow-2xl disabled:opacity-50 text-sm sm:text-base min-h-12 sm:min-h-auto flex items-center justify-center gap-2"
              >
                {userDetecting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Detecting account...
                  </>
                ) : loading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Checking in...
                  </>
                ) : (
                  "Start Checking In..."
                )}
              </button>
              <a
                href="#features"
                className="rounded-3xl border border-blue-600 px-4 sm:px-4.5 py-3 font-bold text-foreground transition-colors hover:bg-blue-950 text-sm sm:text-base min-h-12 sm:min-h-auto flex items-center justify-center"
              >
                How it works
              </a>
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </div>
          <div
            className="hidden sm:flex items-center justify-center rounded-3xl border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-5.5 shadow-2xl"
            style={{ aspectRatio: "1" }}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-1/2 drop-shadow-lg">
              <circle cx="12" cy="12" r="9" fill="#020515" />
              <path d="M7 12l3 3 7-7" stroke="#8ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </section>

        {checkinSuccess && checkinData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="rounded-4 border border-cyan-400 bg-gradient-to-b from-blue-950 to-blue-900 p-6 sm:p-8 shadow-2xl max-w-sm w-full">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-400">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8">
                    <path
                      d="M6 12l4 4 8-8"
                      stroke="#020515"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl sm:text-2xl font-bold text-cyan-400">
                  {checkinData.alreadyCheckedIn ? "Already Checked In!" : "Check-in Successful!"}
                </h3>
                <p className="mb-6 text-muted text-sm sm:text-base">{checkinData.message}</p>
                <div className="space-y-2">
                  <div className="rounded-lg bg-blue-900 px-4 py-3 text-sm font-semibold text-foreground">
                    🔥 Streak: {checkinData.streak} days
                  </div>
                  {!checkinData.alreadyCheckedIn && (
                    <div className="rounded-lg bg-blue-900 px-4 py-3 text-sm font-semibold text-yellow-400">
                      +{checkinData.pointsEarned || 10} points
                    </div>
                  )}
                  {checkinData.tier && (
                    <div className="rounded-lg bg-blue-900 px-4 py-3 text-sm font-semibold text-cyan-400">
                      Tier: {checkinData.tier.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {userFid && (
          <section className="mt-10 sm:mt-15" key={refreshKey}>
            <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-foreground">Your Dashboard</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <StreakDisplay fid={userFid} />
              <RewardsDisplay fid={userFid} />
              <AnalyticsPanel fid={userFid} />
            </div>
          </section>
        )}

        <section className="mt-10 sm:mt-15">
          <h2 className="mb-8 sm:mb-12 text-2xl sm:text-4xl font-bold text-foreground">Community Leaderboard</h2>
          <Leaderboard />
        </section>

        <section id="features" className="mt-15 sm:mt-20">
          <h2 className="mb-8 sm:mb-12 text-2xl sm:text-4xl font-bold text-foreground">Core Features</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {[
              { title: "Daily Check‑In", desc: "Simple on‑chain or off‑chain proof of activity." },
              { title: "Streak Multipliers", desc: "Longer streaks unlock higher rewards." },
              { title: "Community Drops", desc: "Airdrops based on real engagement, not bots." },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3 sm:rounded-4.5 border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-4 sm:p-5.5 shadow-2xl"
              >
                <h3 className="text-base sm:text-lg font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="roadmap" className="mt-15 sm:mt-20">
          <h2 className="mb-8 sm:mb-12 text-2xl sm:text-4xl font-bold text-foreground">Roadmap</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            {[
              { phase: "Phase 1", desc: "Brand, site, social launch" },
              { phase: "Phase 2", desc: "Check‑in engine + streaks" },
              { phase: "Phase 3", desc: "Rewards & partnerships" },
              { phase: "Phase 4", desc: "DAO & integrations" },
            ].map((item) => (
              <div
                key={item.phase}
                className="rounded-2 sm:rounded-4.5 border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-3 sm:p-5.5 shadow-2xl"
              >
                <strong className="text-sm sm:text-lg text-foreground">{item.phase}</strong>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="cta"
          className="mt-15 sm:mt-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3 sm:rounded-4.5 border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-4 sm:p-5.5 shadow-2xl"
        >
          <div>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground">Ready to check in?</h2>
            <p className="mt-2 text-base sm:text-lg text-muted">Join early and start building your streak.</p>
          </div>
          <a
            href="#"
            className="w-full sm:w-auto whitespace-nowrap rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-400 px-4 sm:px-4.5 py-3 font-bold text-slate-950 shadow-xl transition-shadow hover:shadow-2xl text-center min-h-12 flex items-center justify-center"
          >
            Join Community
          </a>
        </section>

        <footer className="mt-15 sm:mt-22.5 border-t border-blue-600 py-5 sm:py-7 text-muted text-sm">
          <div>© 2025 CHECKIN. Built for consistency.</div>
        </footer>
      </div>
    </main>
  )
}
