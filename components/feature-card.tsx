export default function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="rounded-[18px] p-[22px] shadow-lg"
      style={{
        background: "linear-gradient(180deg, #0e1b52, var(--card))",
        border: "1px solid var(--border)",
      }}
    >
      <h3 className="mt-[10px] mb-[6px] font-bold text-lg">{title}</h3>
      <p style={{ color: "var(--muted)" }}>{description}</p>
    </div>
  )
}
