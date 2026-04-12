import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Shield, FileText, Clock, Eye, CheckCircle, XCircle, Search, Filter, RefreshCw, AlertTriangle } from "lucide-react";
import { reportAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import { toast } from "react-toastify";

const CRIME_TYPES = ["", "Theft", "Assault", "Vandalism", "Fraud", "Drug Activity", "Harassment", "Robbery", "Domestic Violence", "Cybercrime", "Other"];
const STATUSES = ["", "Pending", "Under Review", "Resolved", "Rejected"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, underReview: 0, resolved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", crimeType: "", search: "", level: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, sRes] = await Promise.all([
        reportAPI.getAll({ status: filters.status || undefined, crimeType: filters.crimeType || undefined, search: filters.search || undefined, level: filters.level || undefined }),
        reportAPI.getStats(),
      ]);
      setReports(rRes.data.reports);
      setStats(sRes.data.stats);
    } catch {
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statCards = [
    { label: "Total Reports", value: stats.total, icon: FileText, color: "var(--accent-cyan)", bg: "var(--accent-cyan-dim)" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "var(--accent-amber)", bg: "var(--accent-amber-dim)" },
    { label: "Under Review", value: stats.underReview, icon: Eye, color: "var(--accent-cyan)", bg: "var(--accent-cyan-dim)" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "var(--accent-green)", bg: "var(--accent-green-dim)" },
  ];

  const formatDate = (iso) => new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ minHeight: "100vh", background: "var(--gradient-hero)", paddingTop: 80 }}>
      <div className="content-container" style={{ padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="section-tag" style={{ marginBottom: 8 }}><Shield size={13} /> Official Dashboard</div>
            <h1 className="text-gradient" style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800 }}>Crime Reports</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Welcome, {user?.rank} {user?.name} · {user?.station}</p>
          </div>
          <button className="btn btn-outline" onClick={fetchData} style={{ gap: 6 }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card" style={{ padding: "20px 22px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{value}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
            <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input className="form-control" style={{ paddingLeft: 34, height: 38, fontSize: 13 }} placeholder="Search by ID, location, type..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>
          {user?.role === "dgp" && (
            <select className="form-control" style={{ width: "auto", height: 38, fontSize: 13, flex: "0 1 120px" }} value={filters.level || ""} onChange={e => setFilters(f => ({ ...f, level: e.target.value }))}>
              <option value="">All Tiers</option>
              <option value="ci">CI Level</option>
              <option value="sp">SP Level</option>
              <option value="dgp">DGP Level</option>
            </select>
          )}
          <select className="form-control" style={{ width: "auto", height: 38, fontSize: 13, flex: "0 1 140px" }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            {STATUSES.map(s => <option key={s} value={s}>{s || "All Statuses"}</option>)}
          </select>
          <select className="form-control" style={{ width: "auto", height: 38, fontSize: 13, flex: "0 1 150px" }} value={filters.crimeType} onChange={e => setFilters(f => ({ ...f, crimeType: e.target.value }))}>
            {CRIME_TYPES.map(t => <option key={t} value={t}>{t || "All Types"}</option>)}
          </select>
          {(filters.search || filters.status || filters.crimeType || filters.level) && (
            <button className="btn btn-sm btn-outline" onClick={() => setFilters({ status: "", crimeType: "", search: "", level: "" })} style={{ whiteSpace: "nowrap" }}>Clear filters</button>
          )}
        </div>

        {/* Table */}
        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div className="spinner" style={{ width: 28, height: 28 }} />
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <AlertTriangle size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No reports found.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Crime Type</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Level</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td>
                      <code style={{ fontSize: 12, color: "var(--accent-cyan)", background: "var(--accent-cyan-dim)", padding: "2px 8px", borderRadius: 4 }}>{r.trackingId}</code>
                      {r.corruptionFlagRaised && <AlertTriangle size={14} color="var(--accent-amber)" style={{ marginLeft: 6, display: "inline-block", verticalAlign: "middle" }} title="Corruption Flag Escalated" />}
                    </td>
                    <td style={{ fontWeight: 500 }}>{r.crimeType}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.address}</td>
                    <td><PriorityBadge priority={r.priority} /></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12, textTransform: "uppercase", fontWeight: 600 }}>{r.currentLevel}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12, whiteSpace: "nowrap" }}>{formatDate(r.submittedAt)}</td>
                    <td>
                      <Link to={`/dashboard/report/${r.id}`} className="btn btn-outline btn-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 12, textAlign: "right" }}>
          Showing {reports.length} report{reports.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
