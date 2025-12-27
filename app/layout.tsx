import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0e1b52",
}

export const metadata: Metadata = {
  title: "Start Checking In...",
  description: "CHECKIN rewards consistency. Check in daily, build streaks, earn on-chain rewards.",
  generator: "v0.app",
  metadataBase: new URL("https://checkindaily.xyz"),
  openGraph: {
    title: "Start Checking In...",
    description: "CHECKIN rewards consistency. Check in daily, build streaks, earn on-chain rewards.",
    url: "https://checkindaily.xyz",
    type: "website",
    images: [
      {
        url: "https://checkindaily.xyz/api/og",
        width: 1200,
        height: 630,
        alt: "CHECKIN - Check in daily. Build streaks. Get rewarded.",
        secureUrl: "https://checkindaily.xyz/api/og",
        type: "image/png",
      },
    ],
  },
  other: {
    "og:image": "https://checkindaily.xyz/api/og",
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:type": "image/png",
    "farcaster:domain": "checkindaily.xyz",
    "farcaster:signature": "dS5LrJIQaJILi+wB+xcw8V9zjLtICsRElvSoBl+0GWs3wS07+x26Xxj43xM2oMLdtNFekJ+TMWnWpDYm6qo4uhw=",
    "farcaster:payload": "eyJkb21haW4iOiJjaGVja2luZGFpbHkueHl6In0",
    "farcaster:header":
      "eyJmaWQiOjE5Mzc1MjAsInR5cGUiOiJhdXRoIiwia2V5IjoiMHg2YTkyNDVCRGQ2NzdlYWZGYkM4MDhCODY2MEE2MTJGYkUxRjhmOTBhIn0",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

function FrameMetadata() {
  const OG_IMAGE_URL = "/images/check-20in-20daily.png"

  const frameData = {
    version: "1",
    imageUrl: OG_IMAGE_URL,
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
  }

  return (
    <>
      <meta name="fc:frame" content={JSON.stringify(frameData)} />
      <meta name="fc:miniapp" content={JSON.stringify(frameData)} />
    </>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <FrameMetadata />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
