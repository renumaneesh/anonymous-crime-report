import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import WeatherWidget from "./WeatherWidget";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,15,28,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
      <div className="content-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={18} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", lineHeight: 1.1 }}>
              Anonymous Crime <span style={{ color: "var(--accent-cyan)" }}>Reporting</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.12em" }}>SECURE • ANONYMOUS • CONFIDENTIAL</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <WeatherWidget />
          {!user ? (
            <>
              <Link to="/track" className="btn btn-outline btn-sm" style={isActive("/track") ? { borderColor: "var(--accent-cyan)", color: "var(--accent-cyan)" } : {}}>
                Track Report
              </Link>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--accent-cyan-dim)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 8, fontSize: 13 }}>
                <Shield size={14} color="var(--accent-cyan)" />
                <span style={{ color: "var(--accent-cyan)", fontWeight: 500 }}>{user.rank}</span>
                <span style={{ color: "var(--text-secondary)" }}>{user.badgeId}</span>
              </div>
              <Link to="/dashboard" className="btn btn-outline btn-sm" style={{ gap: 6 }}>
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout} style={{ gap: 6, color: "var(--accent-red)", borderColor: "rgba(248,113,113,0.3)" }}>
                <LogOut size={14} /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
