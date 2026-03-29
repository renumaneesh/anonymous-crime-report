import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowLeft, Shield, Clock, CheckCircle, Eye, XCircle, MapPin, Calendar } from "lucide-react";
import { reportAPI } from "../utils/api";
import { StatusBadge } from "../components/StatusBadge";
import { toast } from "react-toastify";

export default function TrackPage() {
  const [trackingId, setTrackingId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);
    try {
      const res = await reportAPI.track(trackingId.trim().toUpperCase());
      setResult(res.data.report);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
      else toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const timeline = result ? [
    { label: "Submitted", date: result.submittedAt, done: true, icon: Clock, color: "var(--accent-cyan)" },
    { label: "Under Review", date: ["Under Review", "Resolved", "Rejected"].includes(result.status) ? result.updatedAt : null, done: ["Under Review", "Resolved", "Rejected"].includes(result.status), icon: Eye, color: "var(--accent-amber)" },
    { label: result.status === "Rejected" ? "Rejected" : "Resolved", date: ["Resolved", "Rejected"].includes(result.status) ? result.updatedAt : null, done: ["Resolved", "Rejected"].includes(result.status), icon: result.status === "Rejected" ? XCircle : CheckCircle, color: result.status === "Rejected" ? "var(--accent-red)" : "var(--accent-green)" },
  ] : [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--gradient-hero)", paddingTop: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 520, padding: "40px 24px" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13, textDecoration: "none", marginBottom: 28 }}>
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="animate-fadeInUp">
          <div className="section-tag" style={{ marginBottom: 12 }}><Shield size={13} /> Anonymous Tracking</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, marginBottom: 8 }}>Track Your Report</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
            Enter your anonymous tracking ID to check the status of your crime report. No login required.
          </p>

          <div className="card" style={{ marginBottom: 20 }}>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 10 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input className="form-control" style={{ paddingLeft: 36 }} placeholder="e.g. CR-2025-001" value={trackingId} onChange={e => setTrackingId(e.target.value.toUpperCase())} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading || !trackingId.trim()}>
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : "Track"}
              </button>
            </form>
          </div>

          {notFound && (
            <div className="card animate-fadeIn" style={{ textAlign: "center", padding: 32 }}>
              <XCircle size={36} color="var(--accent-red)" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 8 }}>Report Not Found</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>No report found with tracking ID <strong style={{ color: "var(--text-primary)" }}>{trackingId}</strong>. Please check and try again.</p>
            </div>
          )}

          {result && (
            <div className="card animate-fadeInUp">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <code style={{ fontSize: 13, color: "var(--accent-cyan)", background: "var(--accent-cyan-dim)", padding: "3px 10px", borderRadius: 6, display: "inline-block", marginBottom: 6 }}>{result.trackingId}</code>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>{result.crimeType}</h2>
                </div>
                <StatusBadge status={result.status} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <MapPin size={14} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{result.address}</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Calendar size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Submitted: {formatDate(result.submittedAt)}</span>
                </div>
              </div>

              {/* Timeline */}
              <h4 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Status Timeline</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {timeline.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: item.done ? `${item.color}20` : "rgba(255,255,255,0.04)", border: `1.5px solid ${item.done ? item.color : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={15} color={item.done ? item.color : "var(--text-muted)"} />
                        </div>
                        {i < timeline.length - 1 && <div style={{ width: 1.5, height: 28, background: item.done ? "var(--border-hover)" : "var(--border)", margin: "4px 0" }} />}
                      </div>
                      <div style={{ paddingTop: 6, paddingBottom: i < timeline.length - 1 ? 0 : 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: item.done ? "var(--text-primary)" : "var(--text-muted)" }}>{item.label}</p>
                        {item.date && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{formatDate(item.date)}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
