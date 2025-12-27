"use client"

import { useEffect, useState } from "react"

interface SplashScreenProps {
  isVisible: boolean
  onComplete?: () => void
}

export function SplashScreen({ isVisible, onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (!isVisible) {
      setFadeOut(true)
      const timer = setTimeout(() => {
        onComplete?.()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  if (!isVisible && fadeOut) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-blue-950 to-blue-900 transition-opacity duration-300 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 shadow-2xl animate-pulse">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12">
            <path d="M6 12l4 4 8-8" stroke="#020515" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {/* Loading spinner */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-1 w-32 rounded-full bg-blue-800 overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-cyan-400 to-blue-400 animate-pulse" />
          </div>
          <p className="text-sm text-cyan-400 font-semibold">Loading CHECKIN...</p>
        </div>
      </div>
    </div>
  )
}
