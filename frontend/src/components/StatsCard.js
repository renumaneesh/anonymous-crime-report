import React from "react";

export default function StatsCard({ icon, label, value, color = "var(--accent-cyan)", bg = "var(--accent-cyan-dim)" }) {
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px" }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {React.cloneElement(icon, { size: 22, color })}
      </div>
      <div>
        <p style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-primary)", lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{label}</p>
      </div>
    </div>
  );
}
