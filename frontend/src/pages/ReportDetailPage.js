import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Shield, FileText, Image, Film, Save, AlertTriangle, ExternalLink } from "lucide-react";
import { reportAPI } from "../utils/api";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import { toast } from "react-toastify";

const STATUSES = ["Pending", "Under Review", "Resolved", "Rejected"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ status: "", officerNotes: "", priority: "" });
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    reportAPI.getById(id)
      .then(res => {
        setReport(res.data.report);
        setForm({ status: res.data.report.status, officerNotes: res.data.report.officerNotes || "", priority: res.data.report.priority });
      })
      .catch(() => { toast.error("Report not found."); navigate("/dashboard"); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await reportAPI.update(id, form);
      setReport(res.data.report);
      toast.success("Report updated successfully.");
    } catch {
      toast.error("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString("en-IN", { weekday: "short", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!report) return null;

  const API_BASE = process.env.REACT_APP_API_URL?.replace("/api", "") || "http://localhost:5000";

  return (
    <div style={{ minHeight: "100vh", background: "var(--gradient-hero)", paddingTop: 80 }}>
      <div className="content-container" style={{ padding: "32px 24px" }}>
        <Link to="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13, textDecoration: "none", marginBottom: 24 }}>
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Header card */}
            <div className="card animate-fadeInUp">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                <div>
                  <code style={{ fontSize: 13, color: "var(--accent-cyan)", background: "var(--accent-cyan-dim)", padding: "4px 10px", borderRadius: 6, marginBottom: 8, display: "inline-block" }}>{report.trackingId}</code>
                  <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>{report.crimeType}</h1>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <StatusBadge status={report.status} />
                  <PriorityBadge priority={report.priority} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", alignItems: "start" }}>
                <MapPin size={14} color="var(--text-muted)" style={{ marginTop: 3 }} />
                <p style={{ fontSize: 14, color: "var(--text-primary)" }}>{report.address}{report.landmark && <span style={{ color: "var(--text-muted)" }}> · Near {report.landmark}</span>}</p>

                <Calendar size={14} color="var(--text-muted)" style={{ marginTop: 3 }} />
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Submitted {formatDate(report.submittedAt)}</p>
              </div>
            </div>

            {/* Description */}
            {report.description && (
              <div className="card animate-fadeInUp" style={{ animationDelay: "0.05s" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={16} color="var(--accent-cyan)" /> Incident Description
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{report.description}</p>
              </div>
            )}

            {/* Evidence files */}
            <div className="card animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Image size={16} color="var(--accent-cyan)" /> Evidence Files
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: 400 }}>{report.files?.length || 0} file(s)</span>
              </h3>
              {!report.files || report.files.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13, border: "1px dashed var(--border)", borderRadius: 8 }}>
                  No evidence files were uploaded with this report.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                  {report.files.map((file, i) => {
                    const isVideo = file.mimetype?.startsWith("video/");
                    const url = `${API_BASE}${file.url}`;
                    return (
                      <div key={i} onClick={() => setSelectedMedia({ url, isVideo, name: file.originalName })}
                        style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", cursor: "pointer", aspectRatio: "1", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, position: "relative" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent-cyan)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                        {isVideo
                          ? <><Film size={28} color="var(--accent-purple)" /><span style={{ fontSize: 11, color: "var(--text-muted)" }}>Video</span></>
                          : <img src={url} alt={file.originalName} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} onError={e => { e.target.style.display = "none"; }} />
                        }
                        <div style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.6)", borderRadius: 4, padding: "2px 4px" }}>
                          <ExternalLink size={10} color="#fff" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Action panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card animate-fadeInUp" style={{ animationDelay: "0.15s" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Shield size={16} color="var(--accent-cyan)" /> Officer Actions
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Update Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <select className="form-control" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Officer Notes <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Internal)</span></label>
                  <textarea className="form-control" rows={4} placeholder="Add internal investigation notes..." value={form.officerNotes} onChange={e => setForm(f => ({ ...f, officerNotes: e.target.value }))} style={{ minHeight: 100, fontSize: 13 }} />
                </div>

                <div style={{ padding: "10px 12px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 6 }}>
                  <AlertTriangle size={13} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: 1 }} />
                  Officer notes are confidential and not visible to the reporter.
                </div>

                <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ gap: 6 }}>
                  {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : <><Save size={14} /> Save Changes</>}
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Last updated</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{formatDate(report.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Media lightbox */}
      {selectedMedia && (
        <div onClick={() => setSelectedMedia(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, cursor: "pointer" }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 12, overflow: "hidden", background: "var(--bg-card)" }}>
            {selectedMedia.isVideo
              ? <video src={selectedMedia.url} controls autoPlay style={{ maxWidth: "100%", maxHeight: "80vh", display: "block" }} />
              : <img src={selectedMedia.url} alt={selectedMedia.name} style={{ maxWidth: "100%", maxHeight: "80vh", display: "block" }} />
            }
          </div>
        </div>
      )}
    </div>
  );
}
