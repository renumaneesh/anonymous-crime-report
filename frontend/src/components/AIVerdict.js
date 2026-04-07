import React from "react";
import { Shield, ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle, Image as ImageIcon, Film, FileText, Cpu, AlertOctagon } from "lucide-react";

export default function AIVerdict({ verification }) {
  if (!verification) return null;

  const { overall, textAndImage, video, summary } = verification;
  
  const getOverallConfig = () => {
    switch(overall.verdict) {
      case "genuine": return { color: "var(--accent-green)", bg: "rgba(52,211,153,0.1)", icon: ShieldCheck, title: "Verified Genuine" };
      case "suspicious": return { color: "var(--accent-amber)", bg: "rgba(251,191,36,0.1)", icon: ShieldAlert, title: "Suspicious Activity" };
      case "fake": return { color: "var(--accent-red)", bg: "rgba(248,113,113,0.1)", icon: AlertOctagon, title: "Likely Fake / Manipulated" };
      case "no_evidence": return { color: "var(--accent-red)", bg: "rgba(248,113,113,0.1)", icon: AlertOctagon, title: "No Evidence Submitted — 0% Confidence" };
      default: return { color: "var(--text-muted)", bg: "rgba(255,255,255,0.05)", icon: Shield, title: "Unverified" };
    }
  };

  const config = getOverallConfig();
  const Icon = config.icon;

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return "var(--text-muted)";
    if (score >= 80) return "var(--accent-green)";
    if (score >= 50) return "var(--accent-amber)";
    return "var(--accent-red)";
  };

  const getRiskColor = (score) => {
    if (score === null || score === undefined) return "var(--text-muted)";
    if (score >= 80) return "var(--accent-red)";
    if (score >= 50) return "var(--accent-amber)";
    return "var(--accent-green)";
  };

  return (
    <div className="card animate-fadeInUp" style={{ padding: 24, borderLeft: `4px solid ${config.color}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ background: config.bg, padding: 8, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={24} color={config.color} />
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, margin: 0 }}>AI Verification Verdict</h3>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
            <span style={{ fontSize: 13, background: config.bg, color: config.color, padding: "4px 10px", borderRadius: 4, fontWeight: 600 }}>{config.title}</span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Overall Confidence: <strong style={{ color: getScoreColor(overall.overallScore) }}>{overall.overallScore}%</strong></span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Analyzed by</div>
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            {overall.verifiedBy.includes("openrouter") && <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 12 }}><Cpu size={12} color="var(--accent-cyan)" /> Gemini Flash</span>}
            {overall.verifiedBy.includes("gemini") && <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 12 }}><Film size={12} color="var(--accent-purple)" /> Gemini Video</span>}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 24 }}>
        
        {/* Text & Image Column */}
        <div style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: 16 }}>
          <h4 style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginBottom: 12, color: "var(--text-primary)" }}>
            <FileText size={14} color="var(--text-muted)" /> Narrative & Photos ({summary.totalImagesAnalyzed})
          </h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--text-secondary)" }}>Credibility</span>
              <strong style={{ color: getScoreColor(textAndImage.credibilityScore) }}>{textAndImage.credibilityScore}%</strong>
            </div>
            {summary.hasImageAnalysis && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Photo Match</span>
                  <strong style={{ color: getScoreColor(textAndImage.imageMatchScore) }}>{textAndImage.imageMatchScore}%</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-secondary)" }}>AI Gen Risk</span>
                  <strong style={{ color: getRiskColor(textAndImage.aiGeneratedImageRisk) }}>{textAndImage.aiGeneratedImageRisk}%</strong>
                </div>
              </>
            )}
          </div>

          {textAndImage.reasons && textAndImage.reasons.length > 0 && (
            <div style={{ fontSize: 12, color: "var(--text-secondary)", background: "rgba(0,0,0,0.2)", padding: 12, borderRadius: 6 }}>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {textAndImage.reasons.map((r, i) => <li key={i} style={{ marginBottom: 4 }}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Video Column */}
        {summary.hasVideoAnalysis ? (
          <div style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: 16 }}>
            <h4 style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginBottom: 12, color: "var(--text-primary)" }}>
              <Film size={14} color="var(--text-muted)" /> Video Evidence ({summary.totalVideosAnalyzed})
            </h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)" }}>Video Credibility</span>
                <strong style={{ color: getScoreColor(video.videoCredibilityScore) }}>{video.videoCredibilityScore}%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)" }}>Content Match</span>
                <strong style={{ color: getScoreColor(video.videoMatchScore) }}>
                  {video.videoMatchScore !== null && video.videoMatchScore !== undefined ? `${video.videoMatchScore}%` : "N/A"}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)" }}>Deepfake / AI Risk</span>
                <strong style={{ color: getRiskColor(video.aiGeneratedVideoRisk) }}>
                  {video.aiGeneratedVideoRisk !== null && video.aiGeneratedVideoRisk !== undefined ? `${video.aiGeneratedVideoRisk}%` : "N/A"}
                </strong>
              </div>
            </div>

            {video.manipulationDetected && (
              <div style={{ fontSize: 12, color: "var(--accent-red)", background: "var(--accent-red-dim)", padding: 8, borderRadius: 6, marginBottom: 12, display: "flex", gap: 6, alignItems: "center" }}>
                <AlertTriangle size={14} /> Digital manipulation detected in video
              </div>
            )}

            {video.videoReasons && video.videoReasons.length > 0 && (
              <div style={{ fontSize: 12, color: "var(--text-secondary)", background: "rgba(0,0,0,0.2)", padding: 12, borderRadius: 6 }}>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {video.videoReasons.map((r, i) => <li key={i} style={{ marginBottom: 4 }}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", border: "1px dashed var(--border)" }}>
            <Film size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
            <span style={{ fontSize: 13 }}>No video evidence provided</span>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: 20, fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 6, alignItems: "center" }}>
        <AlertCircle size={12} /> This is an automated AI analysis meant to assist officers, not replace human judgement.
      </div>
    </div>
  );
}
