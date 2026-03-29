import React from "react";
import { Link } from "react-router-dom";
import { Shield, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--gradient-hero)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }} className="animate-fadeInUp">
        <div style={{ width: 72, height: 72, borderRadius: 16, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Shield size={32} color="var(--accent-cyan)" />
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 80, fontWeight: 800, color: "var(--accent-cyan)", lineHeight: 1, marginBottom: 8, opacity: 0.4 }}>404</h1>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={() => window.history.back()} className="btn btn-outline" style={{ gap: 6 }}>
            <ArrowLeft size={14} /> Go Back
          </button>
          <Link to="/" className="btn btn-primary" style={{ gap: 6 }}>
            <Home size={14} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
