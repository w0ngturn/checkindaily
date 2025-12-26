import RoadmapPhase from "./roadmap-phase"

export default function Roadmap() {
  const phases = [
    { phase: "Phase 1", description: "Brand, site, social launch" },
    { phase: "Phase 2", description: "Check‑in engine + streaks" },
    { phase: "Phase 3", description: "Rewards & partnerships" },
    { phase: "Phase 4", description: "DAO & integrations" },
  ]

  return (
    <section id="roadmap" className="mt-20">
      <h2 className="text-4xl font-bold mb-12">Roadmap</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[14px]">
        {phases.map((item) => (
          <RoadmapPhase key={item.phase} phase={item.phase} description={item.description} />
        ))}
      </div>
    </section>
  )
}
