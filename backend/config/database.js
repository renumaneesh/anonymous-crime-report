const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const officials = [
  {
    id: uuidv4(),
    name: "Superintendent Ramesh Kumar",
    badgeId: "HYD-001",
    email: "ramesh.kumar@hyd.police.gov.in",
    password: bcrypt.hashSync("Police@123", 10),
    rank: "Superintendent",
    station: "Hyderabad Central",
    role: "police",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Inspector Priya Sharma",
    badgeId: "HYD-002",
    email: "priya.sharma@hyd.police.gov.in",
    password: bcrypt.hashSync("Police@456", 10),
    rank: "Inspector",
    station: "Banjara Hills",
    role: "police",
    createdAt: new Date().toISOString(),
  },
];

const reports = [
  {
    id: uuidv4(),
    trackingId: "CR-2025-001",
    crimeType: "Theft",
    description: "A motorcycle was stolen from the parking area near the market. The incident happened around 11pm.",
    address: "Abids, Hyderabad, Telangana 500001",
    landmark: "Near Central Bank ATM",
    status: "Under Review",
    priority: "Medium",
    files: [],
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    officerNotes: "",
    assignedTo: null,
  },
  {
    id: uuidv4(),
    trackingId: "CR-2025-002",
    crimeType: "Vandalism",
    description: "Unknown individuals spray-painted offensive graffiti on the public wall near Film Nagar.",
    address: "Jubilee Hills Road No. 36, Hyderabad",
    landmark: "Near Film Nagar Club",
    status: "Pending",
    priority: "Low",
    files: [],
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    officerNotes: "",
    assignedTo: null,
  },
  {
    id: uuidv4(),
    trackingId: "CR-2025-003",
    crimeType: "Drug Activity",
    description: "Suspicious activity observed near the old warehouse. Individuals seen exchanging packages at night.",
    address: "Kukatpally Housing Board Colony, Hyderabad",
    landmark: "Opposite KPHB Metro Station",
    status: "Pending",
    priority: "High",
    files: [],
    submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    officerNotes: "",
    assignedTo: null,
  },
];

let reportCounter = reports.length;

const db = {
  officials,
  reports,

  findOfficialByBadge(badgeId) {
    return officials.find((o) => o.badgeId === badgeId);
  },
  findOfficialByEmail(email) {
    return officials.find((o) => o.email === email);
  },
  findOfficialById(id) {
    return officials.find((o) => o.id === id);
  },
  addOfficial(official) {
    official.id = uuidv4();
    official.createdAt = new Date().toISOString();
    officials.push(official);
    return official;
  },

  getAllReports() {
    return [...reports].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  },
  getReportById(id) {
    return reports.find((r) => r.id === id);
  },
  getReportByTrackingId(trackingId) {
    return reports.find((r) => r.trackingId === trackingId);
  },
  addReport(report) {
    reportCounter += 1;
    report.id = uuidv4();
    report.trackingId = `CR-${new Date().getFullYear()}-${String(reportCounter).padStart(3, "0")}`;
    report.submittedAt = new Date().toISOString();
    report.updatedAt = new Date().toISOString();
    report.status = "Pending";
    report.officerNotes = "";
    report.assignedTo = null;
    reports.push(report);
    return report;
  },
  updateReport(id, updates) {
    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    reports[idx] = { ...reports[idx], ...updates, updatedAt: new Date().toISOString() };
    return reports[idx];
  },
  getStats() {
    return {
      total: reports.length,
      pending: reports.filter((r) => r.status === "Pending").length,
      underReview: reports.filter((r) => r.status === "Under Review").length,
      resolved: reports.filter((r) => r.status === "Resolved").length,
      rejected: reports.filter((r) => r.status === "Rejected").length,
    };
  },
};

module.exports = db;
