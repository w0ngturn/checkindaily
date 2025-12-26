"use client"

import { useEffect, useState } from "react"

interface User {
  fid: number
  username: string
  displayName: string
  streakCount: number
  totalCheckins: number
  createdAt: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users")
        const data = await response.json()
        setUsers(data.users || [])
      } catch (error) {
        console.error("[admin] Users fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      <div className="rounded-lg border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-blue-600">
              <th className="px-6 py-3 text-left">FID</th>
              <th className="px-6 py-3 text-left">Username</th>
              <th className="px-6 py-3 text-left">Display Name</th>
              <th className="px-6 py-3 text-right">Streak</th>
              <th className="px-6 py-3 text-right">Check-Ins</th>
              <th className="px-6 py-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.fid} className="border-b border-blue-600 hover:bg-blue-900">
                <td className="px-6 py-3">{user.fid}</td>
                <td className="px-6 py-3">{user.username}</td>
                <td className="px-6 py-3">{user.displayName}</td>
                <td className="px-6 py-3 text-right font-semibold text-cyan-400">{user.streakCount}</td>
                <td className="px-6 py-3 text-right">{user.totalCheckins}</td>
                <td className="px-6 py-3 text-sm text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
