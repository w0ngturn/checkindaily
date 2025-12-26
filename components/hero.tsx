"use client"

import { CheckCircleIcon } from "./icons"

export default function Hero() {
  return (
    <section
      style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.75rem", marginTop: "60px" }}
      className="lg:grid-cols-[1.2fr_0.8fr] md:grid-cols-1"
    >
      <div>
        <span
          className="inline-flex gap-2 items-center font-semibold text-sm"
          style={{
            padding: "8px 12px",
            borderRadius: "999px",
            backgroundColor: "#0e1b52",
            color: "var(--accent)",
          }}
        >
          Consistency → Rewards
        </span>
        <h1
          className="font-bold text-balance"
          style={{
            fontSize: "56px",
            lineHeight: "1.05",
            margin: "18px 0",
          }}
        >
          Check in daily.
          <br />
          Build streaks.
          <br />
          Get rewarded.
        </h1>
        <p
          className="font-medium"
          style={{
            fontSize: "18px",
            color: "var(--muted)",
            marginBottom: "22px",
          }}
        >
          CHECKIN is a Web3 activity layer that rewards presence. Every check‑in proves consistency and unlocks on‑chain
          incentives.
        </p>
        <div className="flex gap-3">
          <a
            href="#cta"
            className="font-bold transition-all duration-200 shadow-lg"
            style={{
              padding: "12px 18px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, var(--accent), #7c7cff)",
              color: "#020515",
            }}
          >
            Start Checking In
          </a>
          <a
            href="#features"
            className="font-bold transition-all duration-200 text-foreground"
            style={{
              padding: "12px 18px",
              borderRadius: "12px",
              backgroundColor: "transparent",
              border: "1px solid #2a3cff",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0e1b52")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            How it works
          </a>
        </div>
      </div>
      <div
        className="rounded-2xl p-6 shadow-lg flex items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #0e1b52, var(--card))",
          border: "1px solid var(--border)",
          aspectRatio: "1",
        }}
      >
        <CheckCircleIcon />
      </div>
    </section>
  )
}
