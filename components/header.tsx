"use client"
import { CheckIcon } from "./icons"

export default function Header() {
  return (
    <header className="flex items-center justify-between pt-7 pb-12">
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center shadow-lg"
        style={{
          background: "linear-gradient(135deg, var(--accent), #7c7cff)",
        }}
        aria-label="CHECKIN logo"
      >
        <CheckIcon />
      </div>
      <nav className="flex gap-2.5">
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
          Features
        </a>
        <a
          href="#roadmap"
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
          Roadmap
        </a>
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
          Join
        </a>
      </nav>
    </header>
  )
}
