import type React from "react"
import type { Metadata } from "next"

export async function generateMetadata({
  searchParams,
}: { searchParams: Promise<{ streak?: string; points?: string; tier?: string }> }): Promise<Metadata> {
  const params = await searchParams
  const streak = params.streak || "1"
  const points = params.points || "10"
  const tier = params.tier || "bronze"

  const title = `${streak}-Day Streak on CHECKIN!`
  const description = `Earned ${points} points at ${tier} tier. Join me and start building your streak!`
  const ogImageUrl = `https://checkindaily.xyz/api/og?streak=${streak}&points=${points}&tier=${tier}`

  // Frame data as properly formatted JSON string
  const frameData = JSON.stringify({
    version: "1",
    imageUrl: ogImageUrl,
    button: {
      title: "Start Checking In",
      action: {
        type: "launch_miniapp",
        url: "https://checkindaily.xyz/",
        name: "CHECKIN",
        splashImageUrl: "https://checkindaily.xyz/og.jpg",
        splashBackgroundColor: "#050b1f",
      },
    },
  })

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    other: {
      "fc:frame": frameData,
      "fc:miniapp": frameData,
    },
  }
}

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children
}
