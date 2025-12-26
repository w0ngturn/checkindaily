"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fid: 1937520 }),
        })

        if (response.ok) {
          setIsAuthorized(true)
        } else {
          setIsAuthorized(false)
        }
      } catch (error) {
        console.error("[v0] Admin auth check failed:", error)
        setIsAuthorized(false)
      }
    }

    verifyAdmin()
  }, [])

  if (isAuthorized === null) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-red-500">
        Access Denied: Not authorized
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-4">
        <div className="mx-auto max-w-[1200px] flex items-center justify-between">
          <h1 className="text-2xl font-bold text-cyan-400">CHECKIN Admin</h1>
          <div className="flex gap-4">
            <Link href="/admin" className="px-4 py-2 rounded-lg hover:bg-blue-800">
              Dashboard
            </Link>
            <Link href="/admin/users" className="px-4 py-2 rounded-lg hover:bg-blue-800">
              Users
            </Link>
            <Link href="/admin/rewards" className="px-4 py-2 rounded-lg hover:bg-blue-800">
              Rewards
            </Link>
            <Link href="/admin/settings" className="px-4 py-2 rounded-lg hover:bg-blue-800">
              Settings
            </Link>
            <Link href="/" className="px-4 py-2 rounded-lg hover:bg-blue-800">
              Exit
            </Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-[1200px] px-4 py-8">{children}</main>
    </div>
  )
}
