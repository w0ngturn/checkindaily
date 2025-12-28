import { ImageResponse } from "next/og"

export const runtime = "edge"

// 3:2 aspect ratio for Farcaster frame embeds (minimum 600x400, max 3000x2000)
export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "800px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0f1a",
        padding: "60px",
        gap: "60px",
      }}
    >
      {/* Checkmark icon */}
      <svg width="300" height="300" viewBox="0 0 100 100" fill="none" style={{ flexShrink: 0 }}>
        <path
          d="M20 55 L40 75 L80 25"
          stroke="#67e8f9"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* Text content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "#ffffff",
            fontStyle: "italic",
            lineHeight: 1.2,
          }}
        >
          Check in daily.
        </div>
        <div
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "#ffffff",
            fontStyle: "italic",
            lineHeight: 1.2,
          }}
        >
          Build streaks.
        </div>
        <div
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "#ffffff",
            fontStyle: "italic",
            lineHeight: 1.2,
          }}
        >
          Get rewarded.
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 800,
    },
  )
}
