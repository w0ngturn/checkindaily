import FeatureCard from "./feature-card"

export default function Features() {
  const features = [
    {
      title: "Daily Check‑In",
      description: "Simple on‑chain or off‑chain proof of activity.",
    },
    {
      title: "Streak Multipliers",
      description: "Longer streaks unlock higher rewards.",
    },
    {
      title: "Community Drops",
      description: "Airdrops based on real engagement, not bots.",
    },
  ]

  return (
    <section id="features" className="mt-20">
      <h2 className="text-4xl font-bold mb-12">Core Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
        {features.map((feature) => (
          <FeatureCard key={feature.title} title={feature.title} description={feature.description} />
        ))}
      </div>
    </section>
  )
}
