import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, MapPin, FileText, AlertTriangle, CheckCircle, Copy, ArrowLeft, Lock } from "lucide-react";
import { toast } from "react-toastify";
import FileUpload from "../components/FileUpload";
import { reportAPI } from "../utils/api";

const CRIME_TYPES = ["Theft", "Assault", "Vandalism", "Fraud", "Drug Activity", "Harassment", "Robbery", "Domestic Violence", "Cybercrime", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export default function ReportPage() {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [submitResult, setSubmitResult] = useState(null);
  const [form, setForm] = useState({ crimeType: "", description: "", address: "", landmark: "", priority: "Medium" });
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.crimeType) e.crimeType = "Please select a crime type.";
    if (!form.address || form.address.trim().length < 10) e.address = "Please provide a detailed address (min 10 characters).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach(f => fd.append("files", f));
      const res = await reportAPI.submit(fd);
      setTrackingId(res.data.trackingId);
      setSubmitResult(res.data);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingId = () => {
    navigator.clipboard.writeText(trackingId);
    toast.success("Tracking ID copied to clipboard!");
  };

  // Step 3: Success
  if (step === 3) {
    if (submitResult && submitResult.likelyFake) {
      return (
        <div style={{ minHeight: "100vh", paddingTop: 80, background: "var(--gradient-hero)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ maxWidth: 480, width: "100%", margin: "0 auto", padding: "0 24px" }} className="animate-fadeInUp">
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(248,113,113,0.1)", border: "2px solid rgba(248,113,113,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <AlertTriangle size={36} color="var(--accent-red)" />
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--accent-red)", marginBottom: 12 }}>Low Credibility Report</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                Your complaint has been analyzed by our AI verification system and received a <strong>confidence score of {submitResult.confidenceScore}%</strong>, which is below the 50% threshold for officer review.
              </p>
              
              <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 12, padding: "20px 24px", marginBottom: 24, textAlign: "left" }}>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                  <strong style={{ color: "var(--accent-red)" }}>Why was this flagged?</strong><br />
                  This helps protect police officers' time by filtering unreliable or unverified complaints. If you believe this report is genuine, please resubmit with clear photographic or video evidence.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Link to="/" className="btn btn-outline" style={{ flex: 1 }}>Back to Home</Link>
                <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ flex: 1, background: "var(--accent-red)", borderColor: "var(--accent-red)", color: "white" }}>Try Again</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ minHeight: "100vh", paddingTop: 80, background: "var(--gradient-hero)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 480, width: "100%", margin: "0 auto", padding: "0 24px" }} className="animate-fadeInUp">
          <div className="card" style={{ textAlign: "center", padding: 40 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--accent-green-dim)", border: "2px solid rgba(52,211,153,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle size={36} color="var(--accent-green)" />
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, marginBottom: 8 }}>Report Submitted!</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              Your report has been securely submitted to the authorities. Your identity is completely protected.
            </p>
            <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your Anonymous Tracking ID</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 700, color: "var(--accent-green)", letterSpacing: "0.1em" }}>{trackingId}</span>
                <button onClick={copyTrackingId} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                  <Copy size={16} />
                </button>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Save this ID to track your report status. No personal info is linked to it.</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link to="/" className="btn btn-outline" style={{ flex: 1 }}>Back to Home</Link>
              <Link to="/track" className="btn btn-primary" style={{ flex: 1 }}>Track Report</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, background: "var(--gradient-hero)" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }} className="animate-fadeInUp">
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13, textDecoration: "none", marginBottom: 20 }}>
            <ArrowLeft size={14} /> Back to home
          </Link>
          <div className="section-tag"><Lock size={13} /> Anonymous Report</div>
          <h1 className="text-gradient" style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Submit a Crime Report</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Your identity is fully protected. No personal information is collected or stored.</p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {["Crime Details", "Evidence Upload"].map((label, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: step > i + 1 ? "var(--accent-cyan)" : step === i + 1 ? "var(--accent-cyan)" : "var(--border)", transition: "background 0.3s" }} />
          ))}
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); if (validate()) setStep(2); } : handleSubmit}>
          <div className="card animate-fadeInUp" style={{ animationDelay: "0.1s" }}>

            {step === 1 && (
              <>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={18} color="var(--accent-cyan)" /> Crime Details
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div className="form-group">
                    <label className="form-label">Type of Crime <span className="required">*</span></label>
                    <select className="form-control" value={form.crimeType} onChange={e => update("crimeType", e.target.value)}>
                      <option value="">Select crime type...</option>
                      {CRIME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.crimeType && <p className="form-error">{errors.crimeType}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority Level</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {PRIORITIES.map(p => (
                        <button key={p} type="button" onClick={() => update("priority", p)}
                          style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                            background: form.priority === p ? "var(--accent-cyan-dim)" : "transparent",
                            border: `1px solid ${form.priority === p ? "var(--accent-cyan)" : "var(--border)"}`,
                            color: form.priority === p ? "var(--accent-cyan)" : "var(--text-secondary)" }}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Optional but helpful)</span></label>
                    <textarea className="form-control" rows={4} placeholder="Describe what you witnessed. Include any relevant details about the incident, suspects, or timeline..." value={form.description} onChange={e => update("description", e.target.value)} style={{ minHeight: 110 }} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "right" }}>{form.description.length}/2000</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Crime Location / Address <span className="required">*</span></label>
                    <div style={{ position: "relative" }}>
                      <MapPin size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                      <input className="form-control" style={{ paddingLeft: 36 }} placeholder="e.g. Road No. 12, Banjara Hills, Hyderabad, Telangana 500034" value={form.address} onChange={e => update("address", e.target.value)} />
                    </div>
                    {errors.address && <p className="form-error">{errors.address}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nearest Landmark <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Optional)</span></label>
                    <input className="form-control" placeholder="e.g. Near Apollo Hospital, Opposite SBI Bank..." value={form.landmark} onChange={e => update("landmark", e.target.value)} />
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 8 }}>
                    <AlertTriangle size={15} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      <strong style={{ color: "var(--accent-amber)" }}>Privacy note:</strong> No IP address, browser data, or personal identifiers are collected or stored with this report.
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="btn btn-primary btn-lg">Continue to Evidence Upload →</button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <Shield size={18} color="var(--accent-cyan)" /> Upload Evidence
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
                  Upload photos or videos of the crime. Files are stored securely and only accessible to verified officials.
                </p>
                {files.length === 0 && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 8, marginBottom: 16 }}>
                    <AlertTriangle size={15} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                      <strong style={{ color: "var(--accent-red)" }}>No evidence attached.</strong> Submitting without any images or videos will set the report's credibility confidence to <strong>0%</strong>. Adding evidence significantly increases the chances of your report being taken seriously.
                    </p>
                  </div>
                )}
                <FileUpload files={files} setFiles={setFiles} maxFiles={5} />

                <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "space-between" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Submitting...</> : "Submit Report Anonymously"}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
