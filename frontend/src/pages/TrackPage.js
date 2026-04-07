import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowLeft, Shield, Clock, CheckCircle, Eye, XCircle, MapPin, Calendar, AlertTriangle, Timer } from "lucide-react";
import { reportAPI, escalationAPI } from "../utils/api";
import { StatusBadge } from "../components/StatusBadge";
import { toast } from "react-toastify";

export default function TrackPage() {
  const [trackingId, setTrackingId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");
  const [escalating, setEscalating] = useState(false);
  const [escalationSuccess, setEscalationSuccess] = useState(null);
  const [inactionReason, setInactionReason] = useState("");
  const [inactionEscalating, setInactionEscalating] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);
    setEscalationSuccess(null);
    setEscalationReason("");
    setInactionReason("");
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

  const handleEscalate = async (e) => {
    e.preventDefault();
    if (escalationReason.length < 20) {
      toast.error("Reason must be at least 20 characters.");
      return;
    }
    setEscalating(true);
    try {
      const res = await escalationAPI.raise({ trackingId: result.trackingId, reason: escalationReason, type: "corruption" });
      setEscalationSuccess(res.data);
      setResult(prev => ({ ...prev, corruptionFlagRaised: true, currentLevel: res.data.newLevel, handledBy: res.data.newLevelFull, canEscalateForInaction: false }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to escalate report.");
    } finally {
      setEscalating(false);
    }
  };

  const handleInactionEscalate = async (e) => {
    e.preventDefault();
    if (inactionReason.length < 20) {
      toast.error("Reason must be at least 20 characters.");
      return;
    }
    setInactionEscalating(true);
    try {
      const res = await escalationAPI.raise({ trackingId: result.trackingId, reason: inactionReason, type: "inaction" });
      setEscalationSuccess(res.data);
      setResult(prev => ({ ...prev, corruptionFlagRaised: true, currentLevel: res.data.newLevel, handledBy: res.data.newLevelFull, canEscalateForInaction: false }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to file inaction complaint.");
    } finally {
      setInactionEscalating(false);
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

          {result && result.likelyFake && (
            <div className="card animate-fadeInUp" style={{ textAlign: "center", padding: "36px 28px" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(248,113,113,0.1)", border: "2px solid rgba(248,113,113,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <XCircle size={36} color="var(--accent-red)" />
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--accent-red)", marginBottom: 10 }}>
                Low Credibility Report
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>
                Your complaint has been analyzed by our AI verification system and received a <strong style={{ color: "var(--accent-red)" }}>confidence score of {result.confidenceScore}%</strong>, which is below the 50% threshold required for officer review.
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 24, padding: "16px 0" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "var(--accent-red)", fontFamily: "var(--font-display)" }}>{result.confidenceScore}%</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Confidence</div>
                </div>
                <div style={{ width: 1, background: "var(--border)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "var(--accent-green)", fontFamily: "var(--font-display)" }}>50%</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Required</div>
                </div>
              </div>

              <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: "14px 18px", marginBottom: 20, textAlign: "left" }}>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>
                  <strong style={{ color: "var(--accent-red)" }}>Why was this flagged?</strong><br />
                  This report was flagged as likely fake or low-quality because it didn't meet the credibility standards. 
                  This helps protect police officers' time by filtering unreliable complaints. 
                  If you believe this report is genuine, please <strong>resubmit with clear photographic or video evidence</strong> of the crime.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                <code style={{ fontSize: 13, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", padding: "3px 10px", borderRadius: 6 }}>{result.trackingId}</code>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                  {result.crimeType} • {result.address}
                </p>
              </div>
            </div>
          )}

          {result && !result.likelyFake && (
            <div className="card animate-fadeInUp">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <code style={{ fontSize: 13, color: "var(--accent-cyan)", background: "var(--accent-cyan-dim)", padding: "3px 10px", borderRadius: 6, display: "inline-block", marginBottom: 6 }}>{result.trackingId}</code>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>{result.crimeType}</h2>
                  <div style={{ marginTop: 8, display: "inline-block", padding: "4px 10px", background: "var(--accent-cyan-dim)", color: "var(--accent-cyan)", borderRadius: 4, fontSize: 13 }}>
                    Currently handled by: {result.handledBy}
                  </div>
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

              {/* Inaction Complaint Section */}
              {result.canEscalateForInaction && !result.corruptionFlagRaised && !escalationSuccess && (
                <div style={{ marginTop: 32, padding: 20, borderRadius: 12, border: "1px solid rgba(251,191,36,0.35)", background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.04))" }} className="animate-fadeIn">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(251,191,36,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Timer size={18} color="#fbbf24" />
                    </div>
                    <div>
                      <h4 style={{ color: "#fbbf24", fontSize: 16, fontWeight: 700, margin: 0 }}>Officer Inaction Detected</h4>
                      <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0 }}>{result.inactionMessage}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: 12, marginBottom: 16, padding: "12px 14px", background: "rgba(0,0,0,0.2)", borderRadius: 8, border: "1px solid rgba(251,191,36,0.15)" }}>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b", fontFamily: "var(--font-display)" }}>{result.inactionDaysElapsed}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Days Elapsed</div>
                    </div>
                    <div style={{ width: 1, background: "rgba(251,191,36,0.2)" }} />
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent-red)", fontFamily: "var(--font-display)" }}>{result.inactionDeadline}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Day Limit</div>
                    </div>
                    <div style={{ width: 1, background: "rgba(251,191,36,0.2)" }} />
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent-red)", fontFamily: "var(--font-display)" }}>{result.inactionDaysElapsed - result.inactionDeadline}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Days Overdue</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", background: "rgba(251,191,36,0.06)", borderRadius: 8, marginBottom: 16, border: "1px solid rgba(251,191,36,0.1)" }}>
                    <AlertTriangle size={14} color="#fbbf24" style={{ marginTop: 2, flexShrink: 0 }} />
                    <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                      The assigned officer has not taken timely action on your report. You have the right to escalate this to the next authority level for immediate attention.
                    </p>
                  </div>

                  <form onSubmit={handleInactionEscalate}>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label">Describe the impact of this delay <span className="required">*</span></label>
                      <textarea className="form-control" placeholder="Explain how the officer's inaction is affecting you or the community... (min 20 characters)" minLength={20} required value={inactionReason} onChange={(e) => setInactionReason(e.target.value)} rows={3} />
                    </div>
                    <button type="submit" className="btn" disabled={inactionEscalating} style={{ 
                      width: "100%", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000", 
                      fontWeight: 700, border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer",
                      fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      opacity: inactionEscalating ? 0.7 : 1, transition: "opacity 0.2s"
                    }}>
                      {inactionEscalating ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><AlertTriangle size={15} /> Raise Inaction Complaint</>}
                    </button>
                  </form>
                </div>
              )}

              {/* Days remaining info (when not yet eligible) */}
              {!result.canEscalateForInaction && result.inactionDaysRemaining && !result.corruptionFlagRaised && !escalationSuccess && (result.status === "Pending" || result.status === "Under Review") && (
                <div style={{ marginTop: 24, padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: 10 }}>
                  <Timer size={15} color="var(--text-muted)" />
                  <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
                    {result.inactionDaysRemaining} day{result.inactionDaysRemaining !== 1 ? "s" : ""} remaining before you can raise an inaction complaint
                    {result.status === "Pending" ? " (10-day limit for Pending reports)" : " (15-day limit for Under Review reports)"}
                  </p>
                </div>
              )}

              {/* Corruption Escalation Section (existing — for Rejected reports) */}
              {result.status === "Rejected" && result.currentLevel !== "dgp" && !result.corruptionFlagRaised && !escalationSuccess && (
                <div style={{ marginTop: 32, padding: 20, borderRadius: 12, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.05)" }}>
                  <h4 style={{ color: "var(--accent-red)", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><XCircle size={18} /> Do you believe this was rejected unfairly?</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16 }}>If you believe the officer is corrupt or suppressing evidence, you can escalate this report to the next authority.</p>
                  <form onSubmit={handleEscalate}>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label">Explain why you believe this rejection is corrupt <span className="required">*</span></label>
                      <textarea className="form-control" placeholder="Describe why you think the officer did not act correctly... (min 20 characters)" minLength={20} required value={escalationReason} onChange={(e) => setEscalationReason(e.target.value)} rows={3} />
                    </div>
                    <button type="submit" className="btn btn-danger" disabled={escalating}>
                      {escalating ? <span className="spinner" style={{ width: 14, height: 14 }} /> : "Raise Corruption Complaint"}
                    </button>
                  </form>
                </div>
              )}

              {escalationSuccess && (
                <div style={{ marginTop: 32, padding: 20, borderRadius: 12, border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.05)" }}>
                  <h4 style={{ color: "var(--accent-green)", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><CheckCircle size={18} /> Complaint filed successfully.</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                    Your {escalationSuccess.type === "inaction" ? "inaction" : "corruption"} complaint has been registered. Your report has been escalated to <strong style={{ color: "var(--text-primary)" }}>{escalationSuccess.newLevelFull}</strong>. They will review the case independently.
                  </p>
                </div>
              )}

              {result.corruptionFlagRaised && !escalationSuccess && (
                <div style={{ marginTop: 32, padding: 20, borderRadius: 12, border: "1px solid rgba(56,189,248,0.3)", background: "rgba(56,189,248,0.05)" }}>
                  <h4 style={{ color: "var(--accent-cyan)", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Shield size={18} /> Escalated Report</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>A complaint has already been filed for this report. It is currently under review by {result.handledBy}.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
