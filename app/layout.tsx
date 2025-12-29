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

const FRAME_IMAGE_URL = "https://checkindaily.xyz/images/checkin-preview.png"
const SPLASH_IMAGE_URL = "https://checkindaily.xyz/images/checkin-logo.png"
const OG_IMAGE_URL = "https://checkindaily.xyz/images/checkin-preview.png"

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
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "CHECKIN - Check in daily. Build streaks. Get rewarded.",
        type: "image/png",
      },
    ],
  },
  other: {
    "fc:miniapp": JSON.stringify(frameData),
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
}

const btoaPolyfillScript = `
(function(){
  if(typeof window==='undefined')return;
  var orig=window.btoa;
  window.btoa=function(s){
    try{return orig(s)}catch(e){
      var o='',i=0,c;
      s=unescape(encodeURIComponent(s));
      while(i<s.length){c=s.charCodeAt(i++);o+=String.fromCharCode(c)}
      try{return orig(o)}catch(e2){return''}
    }
  };
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: btoaPolyfillScript }} />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
