"use client"

export default function AdminSettings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="rounded-lg border border-blue-600 bg-gradient-to-b from-blue-950 to-blue-900 p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Platform Status</h2>
            <p className="text-muted">System is running normally</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Maintenance</h2>
            <p className="text-muted mb-4">Scheduled maintenance can be configured here</p>
            <button className="rounded-lg bg-blue-900 border border-blue-600 px-4 py-2 hover:bg-blue-800">
              Schedule Maintenance
            </button>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Notifications</h2>
            <p className="text-muted">Configure system-wide notification settings</p>
          </div>
        </div>
      </div>
    </div>
  )
}
