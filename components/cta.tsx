export default function CTA() {
  return (
    <section
      id="cta"
      className="mt-20 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4"
      style={{
        borderRadius: "18px",
        padding: "22px",
        background: "linear-gradient(180deg, #0e1b52, var(--card))",
        border: "1px solid var(--border)",
      }}
    >
      <div>
        <h2 className="font-bold mb-2" style={{ fontSize: "36px" }}>
          Ready to check in?
        </h2>
        <p
          className="font-medium"
          style={{
            fontSize: "18px",
            color: "var(--muted)",
          }}
        >
          Join early and start building your streak.
        </p>
      </div>
      <a
        href="#"
        className="font-bold transition-all duration-200 shadow-lg whitespace-nowrap"
        style={{
          padding: "12px 18px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, var(--accent), #7c7cff)",
          color: "#020515",
        }}
      >
        Join Community
      </a>
    </section>
  )
}
