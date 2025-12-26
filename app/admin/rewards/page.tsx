"use client"

import { useState } from "react"

export default function AdminRewards() {
  const [multipliers, setMultipliers] = useState({
    bronze: 1.0,
    silver: 1.5,
    gold: 2.0,
    platinum: 3.0,
  })
  const [basePoints, setBasePoints] = useState(10)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch("/api/admin/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ multipliers, basePoints }),
      })
    } catch (error) {
      console.error("[admin] Save error:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Reward Configuration</h1>
      <div className="rounded-lg border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-6 max-w-md">
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Base Points per Check-In</label>
          <input
            type="number"
            value={basePoints}
            onChange={(e) => setBasePoints(Number(e.target.value))}
            className="w-full rounded-lg bg-blue-900 border border-blue-600 px-3 py-2 text-foreground"
          />
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold">Tier Multipliers</h2>
          {Object.entries(multipliers).map(([tier, multiplier]) => (
            <div key={tier}>
              <label className="block text-sm mb-1 capitalize">{tier}</label>
              <input
                type="number"
                step="0.1"
                value={multiplier}
                onChange={(e) => setMultipliers({ ...multipliers, [tier]: Number(e.target.value) })}
                className="w-full rounded-lg bg-blue-900 border border-blue-600 px-3 py-2 text-foreground"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full rounded-lg bg-cyan-400 text-slate-950 font-semibold py-2 hover:bg-cyan-500 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  )
}
