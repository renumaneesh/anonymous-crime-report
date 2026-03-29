import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { authAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState({ badgeId: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.badgeId || !form.password) {
      setError("Badge ID and password are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.official);
      toast.success(`Welcome, ${res.data.official.rank} ${res.data.official.name.split(" ")[0]}!`);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--gradient-hero)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      {/* Background grid */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420 }} className="animate-fadeInUp">
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13, textDecoration: "none", marginBottom: 28 }}>
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="card" style={{ padding: 36 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(59,130,246,0.1))", border: "1px solid rgba(56,189,248,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Shield size={28} color="var(--accent-cyan)" />
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Official Login</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Access restricted to verified police officials and higher authorities.</p>
          </div>

          {/* Demo credentials hint */}
          <div style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "var(--text-secondary)" }}>
            <strong style={{ color: "var(--accent-cyan)" }}>Demo:</strong> Badge: <code style={{ color: "var(--accent-amber)" }}>HYD-001</code> &nbsp;|&nbsp; Password: <code style={{ color: "var(--accent-amber)" }}>Police@123</code>
          </div>

          {error && (
            <div style={{ display: "flex", gap: 8, padding: "10px 14px", background: "var(--accent-red-dim)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, marginBottom: 16, fontSize: 13, color: "var(--accent-red)" }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Badge ID</label>
              <div style={{ position: "relative" }}>
                <Shield size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input className="form-control" style={{ paddingLeft: 36 }} placeholder="e.g. HYD-001" value={form.badgeId} onChange={e => setForm(f => ({ ...f, badgeId: e.target.value.toUpperCase() }))} autoComplete="username" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input className="form-control" style={{ paddingLeft: 36, paddingRight: 40 }} type={showPass ? "text" : "password"} placeholder="Enter your password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 4 }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Authenticating...</> : <><Shield size={16} /> Login to Dashboard</>}
            </button>
          </form>

          <hr className="divider" />
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
            New official?{" "}
            <Link to="/register" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 500 }}>Request access →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
