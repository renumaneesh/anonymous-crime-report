import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WeatherWidget from "../components/WeatherWidget";
import { Shield, ArrowRight, Lock, EyeOff, UserCheck, ChevronRight, Plus } from "lucide-react";

const CRIME_TYPES = ["Theft", "Assault", "Vandalism", "Fraud", "Drug Activity", "Harassment", "Cybercrime"];

const FAQ_ITEMS = [
  { q: "Is my identity really protected?", a: "Absolutely. We do not collect your name, email, IP address, or device location. The system is designed from the ground up to ensure your identity remains 100% anonymous and confidential." },
  { q: "What types of crimes can I report here?", a: "You can report a wide range of non-emergency criminal activities, including theft, vandalism, fraud, and suspicious behavior. Note: If you are witnessing an active crime or experiencing an immediate emergency, please call your local emergency services (e.g., 911) directly." },
  { q: "Can I provide photos or videos as evidence?", a: "Yes. You can securely upload up to 5 evidence files (images or videos) alongside your report. Files are encrypted and stored safely, accessible only to verified higher officials." },
  { q: "How do I know if the police are looking into my report?", a: "Once you submit a report, you will be given a unique Tracking ID. Save this ID! You can enter it on our 'Track Report' page at any time to see real-time status updates from the investigating officers." },
  { q: "Do I need to create an account to use this?", a: "No. Citizens do not need an account to report a crime or track it. The login portal is strictly reserved for verified police officials and administrators who review the submissions." },
];

function FAQItem({ q, a }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "24px 0" }}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer", textAlign: "left", padding: 0 }}
      >
        <span style={{ paddingRight: 20, lineHeight: 1.4, fontFamily: "var(--font-display)" }}>{q}</span>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: isOpen ? "var(--accent-cyan)" : "rgba(255,255,255,0.05)", color: isOpen ? "#000" : "var(--accent-cyan)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", flexShrink: 0 }}>
          <Plus size={18} />
        </div>
      </button>
      <div style={{ maxHeight: isOpen ? 500 : 0, overflow: "hidden", transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", opacity: isOpen ? 1 : 0 }}>
        <p style={{ paddingTop: 16, color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
          {a}
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [typedText, setTypedText] = useState("");
  const [typeIdx, setTypeIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = CRIME_TYPES[typeIdx];
    const delay = deleting ? 60 : charIdx === word.length ? 1400 : 80;
    const timer = setTimeout(() => {
      if (!deleting && charIdx < word.length) {
        setTypedText(word.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      } else if (!deleting && charIdx === word.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setTypedText(word.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      } else {
        setDeleting(false);
        setTypeIdx(i => (i + 1) % CRIME_TYPES.length);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [charIdx, deleting, typeIdx]);

  return (
    <div className="page-container" style={{ background: "var(--gradient-hero)", position: "relative", overflow: "hidden" }}>
      {/* Background grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
      {/* Glow orbs */}
      <div style={{ position: "absolute", top: "15%", left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "8%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,15,28,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
        <div className="content-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={18} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>
                Anonymous Crime <span style={{ color: "var(--accent-cyan)" }}>Reporting System</span>
              </div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.14em" }}>SECURE • ANONYMOUS • CONFIDENTIAL</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <WeatherWidget />
            <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", paddingTop: 64 }}>
        <div className="content-container" style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 60, alignItems: "center", padding: "80px 24px" }}>

          {/* Left: hero text */}
          <div className="animate-fadeInUp">
            <div className="section-tag">
              <Lock size={13} />
              Secure Portal
            </div>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
              Report Crime<br />
              <span style={{ color: "var(--accent-cyan)" }}>Safely &amp; Anonymously</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.7, maxWidth: 480, marginBottom: 12 }}>
              Your identity is always protected. Help keep your community safe by reporting{" "}
              <span style={{ color: "var(--accent-amber)", fontWeight: 500 }}>{typedText}<span style={{ animation: "pulse 1s infinite", opacity: 1 }}>|</span></span>{" "}
              directly to higher officials.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 36 }}>No login required • No personal data collected • End-to-end secure</p>

            {/* Trust badges */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { icon: Lock, label: "End-to-end encrypted" },
                { icon: EyeOff, label: "No identity collected" },
                { icon: UserCheck, label: "Verified officials only" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                  <Icon size={13} color="var(--accent-cyan)" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right: portal card (matches screenshot) */}
          <div className="animate-fadeInUp" style={{ animationDelay: "0.15s" }}>
            <div style={{ background: "rgba(13,21,38,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 36, backdropFilter: "blur(20px)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
              {/* Secure Portal tag */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(52,211,153,0.12)", color: "var(--accent-green)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 500 }}>
                  <Shield size={13} /> Secure Portal
                </span>
              </div>

              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 10 }}>Report Crime Safely</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, textAlign: "center", marginBottom: 28, lineHeight: 1.6 }}>
                Your identity is protected. Help keep your community safe by reporting criminal activities anonymously.
              </p>

              {/* Citizen card */}
              <Link to="/report" style={{ textDecoration: "none", display: "block", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, transition: "all 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)"; e.currentTarget.style.background = "rgba(56,189,248,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <UserCheck size={22} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>I am a Citizen</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Report a crime anonymously without login</div>
                  </div>
                  <ArrowRight size={18} color="var(--text-muted)" />
                </div>
              </Link>

              {/* Police card */}
              <Link to="/login" style={{ textDecoration: "none", display: "block", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, transition: "all 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)"; e.currentTarget.style.background = "rgba(56,189,248,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Shield size={22} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>Police / Higher Official</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Login to view and verify reports</div>
                  </div>
                  <ArrowRight size={18} color="var(--text-muted)" />
                </div>
              </Link>

              {/* Footer badges */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", justifyContent: "center" }}>
                  <Lock size={12} color="var(--accent-amber)" /> End-to-end encrypted
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", justifyContent: "center" }}>
                  <EyeOff size={12} color="var(--accent-amber)" /> No personal data collected
                </div>
              </div>

              {/* Track report link */}
              <div style={{ textAlign: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <Link to="/track" style={{ fontSize: 13, color: "var(--accent-cyan)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Already reported? Track your case <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div style={{ position: "relative", padding: "80px 24px 120px", background: "rgba(10,15,28,0.4)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="content-container" style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }} className="animate-fadeInUp">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Frequently Asked Questions</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 500, margin: "0 auto" }}>Everything you need to know about how our anonymous reporting system works and protects you.</p>
          </div>
          <div className="animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
            {FAQ_ITEMS.map((item, idx) => (
              <FAQItem key={idx} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
