export default function RoadmapPhase({ phase, description }: { phase: string; description: string }) {
  return (
    <div
      className="rounded-[18px] p-[22px] shadow-lg"
      style={{
        background: "linear-gradient(180deg, #0e1b52, var(--card))",
        border: "1px solid var(--border)",
      }}
    >
      <strong className="text-lg">{phase}</strong>
      <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
        {description}
      </p>
    </div>
  )
}
