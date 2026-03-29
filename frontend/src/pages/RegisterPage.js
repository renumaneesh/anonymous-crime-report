import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { authAPI } from "../utils/api";

const RANKS = ["Constable", "Head Constable", "Sub-Inspector", "Inspector", "Deputy Superintendent", "Superintendent", "Deputy Inspector General", "Inspector General", "Director General"];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", badgeId: "", email: "", password: "", confirmPassword: "", rank: "", station: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const update = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 3) e.name = "Full name is required (min 3 chars).";
    if (!form.badgeId || !/^[A-Z]{2,5}-\d{3,6}$/.test(form.badgeId)) e.badgeId = "Format: XX-000 (e.g. HYD-001)";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email is required.";
    if (!form.password || form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    if (!form.rank) e.rank = "Select your rank.";
    if (!form.station || form.station.trim().length < 3) e.station = "Station name is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.register({ name: form.name, badgeId: form.badgeId.toUpperCase(), email: form.email, password: form.password, rank: form.rank, station: form.station });
      setSuccess(true);
      toast.success("Account registered! You can now login.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--gradient-hero)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="card animate-fadeInUp" style={{ maxWidth: 380, width: "100%", padding: 40, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-green-dim)", border: "2px solid rgba(52,211,153,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle size={32} color="var(--accent-green)" />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 8 }}>Account Registered!</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--gradient-hero)", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px 40px" }}>
      <div style={{ width: "100%", maxWidth: 480 }} className="animate-fadeInUp">
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13, textDecoration: "none", marginBottom: 24 }}>
          <ArrowLeft size={14} /> Back to home
        </Link>
        <div className="card" style={{ padding: 36 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Shield size={26} color="var(--accent-cyan)" />
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Official Registration</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Register your official credentials to access the crime reporting portal.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input className="form-control" placeholder="Your full official name" value={form.name} onChange={e => update("name", e.target.value)} />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Badge ID <span className="required">*</span></label>
                <input className="form-control" placeholder="HYD-001" value={form.badgeId} onChange={e => update("badgeId", e.target.value.toUpperCase())} />
                {errors.badgeId && <p className="form-error">{errors.badgeId}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Rank <span className="required">*</span></label>
                <select className="form-control" value={form.rank} onChange={e => update("rank", e.target.value)}>
                  <option value="">Select rank...</option>
                  {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.rank && <p className="form-error">{errors.rank}</p>}
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Official Email <span className="required">*</span></label>
                <input className="form-control" type="email" placeholder="you@police.gov.in" value={form.email} onChange={e => update("email", e.target.value)} />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Police Station <span className="required">*</span></label>
                <input className="form-control" placeholder="e.g. Banjara Hills Police Station" value={form.station} onChange={e => update("station", e.target.value)} />
                {errors.station && <p className="form-error">{errors.station}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Password <span className="required">*</span></label>
                <div style={{ position: "relative" }}>
                  <input className="form-control" style={{ paddingRight: 40 }} type={showPass ? "text" : "password"} placeholder="Min 8 characters" value={form.password} onChange={e => update("password", e.target.value)} />
                  <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password <span className="required">*</span></label>
                <input className="form-control" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} />
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)" }}>
              <AlertCircle size={14} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: 1 }} />
              False registration is a criminal offence. Credentials will be verified before dashboard access is granted.
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Registering...</> : <><Shield size={16} /> Register Official Account</>}
            </button>
          </form>

          <hr className="divider" />
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
            Already registered? <Link to="/login" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 500 }}>Login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
