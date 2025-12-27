import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#050b1f",
        backgroundImage: "linear-gradient(135deg, #0e1b52 0%, #050b1f 50%, #0a1535 100%)",
        padding: "60px",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "120px",
          height: "120px",
          backgroundColor: "#06b6d4",
          borderRadius: "24px",
          marginBottom: "40px",
        }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Title */}
      <div
        style={{
          display: "flex",
          fontSize: "72px",
          fontWeight: "bold",
          color: "white",
          marginBottom: "20px",
          letterSpacing: "-2px",
        }}
      >
        CHECKIN
      </div>

      {/* Tagline */}
      <div
        style={{
          display: "flex",
          fontSize: "32px",
          color: "#94a3b8",
          textAlign: "center",
          marginBottom: "40px",
        }}
      >
        Check in daily. Build streaks. Get rewarded.
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "48px", color: "#06b6d4", fontWeight: "bold" }}>🔥</div>
          <div style={{ fontSize: "20px", color: "#64748b" }}>Daily Streaks</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "48px", color: "#06b6d4", fontWeight: "bold" }}>⭐</div>
          <div style={{ fontSize: "20px", color: "#64748b" }}>Earn Points</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "48px", color: "#06b6d4", fontWeight: "bold" }}>🏆</div>
          <div style={{ fontSize: "20px", color: "#64748b" }}>Climb Tiers</div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
