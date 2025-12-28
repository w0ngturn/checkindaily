import type { Metadata } from "next"

type Props = {
  searchParams: Promise<{ streak?: string; points?: string; tier?: string }>
}

const FRAME_IMAGE_URL = "https://checkindaily.xyz/images/frame-image.jpg"
const SPLASH_IMAGE_URL = "https://checkindaily.xyz/images/checkin-logo.png"
const OG_IMAGE_URL = "https://checkindaily.xyz/images/checkin-og.png"

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const streak = params.streak || "1"
  const points = params.points || "10"
  const tier = params.tier || "bronze"

  const title = `${streak}-Day Streak on CHECKIN!`
  const description = `Earned ${points} points at ${tier} tier. Join me and start building your streak!`

  const frameData = {
    version: "1",
    imageUrl: FRAME_IMAGE_URL,
    button: {
      title: "Start Checking In",
      action: {
        type: "launch_miniapp",
        url: "https://checkindaily.xyz",
        name: "CHECKIN",
        splashImageUrl: SPLASH_IMAGE_URL,
        splashBackgroundColor: "#0a0f1a",
      },
    },
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630 }],
    },
    other: {
      "fc:miniapp": JSON.stringify(frameData),
    },
  }
}

export default async function SharePage({ searchParams }: Props) {
  const params = await searchParams
  const streak = params.streak || "1"
  const points = params.points || "10"
  const tier = params.tier || "bronze"

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0e1b52] to-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-400">
            <svg className="h-10 w-10 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">CHECKIN</h1>
        <p className="text-cyan-400 text-xl mb-4">{streak}-Day Streak</p>
        <p className="text-slate-400 mb-2">
          {points} Points | {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
        </p>
        <p className="text-slate-500 text-sm">Check in daily. Build streaks. Get rewarded.</p>
      </div>
    </div>
  )
}
