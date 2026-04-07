const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const officials = [
  {
    id: uuidv4(),
    name: "CI Ramesh Kumar",
    officerId: "CI-HYD-001",
    email: "ramesh.kumar@hyd.police.gov.in",
    password: bcrypt.hashSync("CI@123", 10),
    rank: "Circle Inspector",
    station: "Hyderabad Central",
    role: "ci",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "SP Priya Sharma",
    officerId: "SP-HYD-001",
    email: "priya.sharma@hyd.police.gov.in",
    password: bcrypt.hashSync("SP@123", 10),
    rank: "Superintendent of Police",
    station: "Hyderabad District",
    role: "sp",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "DGP Suresh Rao",
    officerId: "DGP-TS-001",
    email: "suresh.rao@ts.police.gov.in",
    password: bcrypt.hashSync("DGP@123", 10),
    rank: "Director General of Police",
    station: "Telangana State Police Headquarters",
    role: "dgp",
    createdAt: new Date().toISOString(),
  }
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
    statusChangedAt: new Date(Date.now() - 86400000).toISOString(),
    officerNotes: "",
    assignedTo: null,
    currentLevel: "ci",
    assignedOfficerId: "CI-HYD-001",
    escalationHistory: [],
    corruptionFlagRaised: false,
    corruptionFlagReason: "",
    aiVerification: null,
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
    statusChangedAt: new Date(Date.now() - 86400000).toISOString(),
    officerNotes: "",
    assignedTo: null,
    currentLevel: "ci",
    assignedOfficerId: "CI-HYD-001",
    escalationHistory: [],
    corruptionFlagRaised: false,
    corruptionFlagReason: "",
    aiVerification: null,
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
    statusChangedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    officerNotes: "",
    assignedTo: null,
    currentLevel: "ci",
    assignedOfficerId: "CI-HYD-001",
    escalationHistory: [],
    corruptionFlagRaised: false,
    corruptionFlagReason: "",
    aiVerification: null,
  },
  // --- Demo report: Pending for over 12 days (triggers 10-day inaction) ---
  {
    id: uuidv4(),
    trackingId: "CR-2025-004",
    crimeType: "Robbery",
    description: "An armed robbery occurred at a grocery store. The suspects fled in a white van heading east.",
    address: "Ameerpet, Hyderabad, Telangana 500016",
    landmark: "Near Ameerpet Metro Station",
    status: "Pending",
    priority: "High",
    files: [],
    submittedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    statusChangedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    officerNotes: "",
    assignedTo: null,
    currentLevel: "ci",
    assignedOfficerId: "CI-HYD-001",
    escalationHistory: [],
    corruptionFlagRaised: false,
    corruptionFlagReason: "",
    aiVerification: null,
  },
  // --- Demo report: Under Review for over 18 days (triggers 15-day inaction) ---
  {
    id: uuidv4(),
    trackingId: "CR-2025-005",
    crimeType: "Assault",
    description: "A group of individuals assaulted a street vendor over a payment dispute. Victim sustained serious injuries.",
    address: "Begumpet, Hyderabad, Telangana 500003",
    landmark: "Near Begumpet Railway Station",
    status: "Under Review",
    priority: "High",
    files: [],
    submittedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    statusChangedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    officerNotes: "",
    assignedTo: null,
    currentLevel: "ci",
    assignedOfficerId: "CI-HYD-001",
    escalationHistory: [],
    corruptionFlagRaised: false,
    corruptionFlagReason: "",
    aiVerification: null,
  },
  // --- Demo report: Low Credibility (0% Confidence due to no evidence) ---
  {
    id: uuidv4(),
    trackingId: "CR-2026-006",
    crimeType: "Theft",
    description: "Someone stole my bicycle from outside the library. I have no evidence.",
    address: "MG Road, Secunderabad, Telangana 500003",
    landmark: "Near Clock Tower",
    status: "Pending",
    priority: "Medium",
    files: [],
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusChangedAt: new Date().toISOString(),
    officerNotes: "",
    assignedTo: null,
    currentLevel: "ci",
    assignedOfficerId: "CI-HYD-001",
    escalationHistory: [],
    corruptionFlagRaised: false,
    corruptionFlagReason: "",
    aiVerification: {
      analyzedAt: new Date().toISOString(),
      reportId: "will-be-overridden", // placeholder
      textAndImage: {
        credibilityScore: 0,
        imageMatchScore: 0,
        aiGeneratedImageRisk: 0,
        verdict: "no_evidence",
        reasons: ["No images or videos were submitted as evidence. Confidence is 0%."],
        recommendation: "review",
        status: "completed",
        imagesAnalyzed: 0
      },
      video: null,
      overall: {
        verdict: "no_evidence",
        recommendation: "review",
        overallScore: 0,
        verifiedBy: []
      },
      summary: {
        totalImagesAnalyzed: 0,
        totalVideosAnalyzed: 0,
        hasVideoAnalysis: false,
        hasImageAnalysis: false
      }
    },
  }
];

let reportCounter = reports.length;

const db = {
  officials,
  reports,

  findOfficialByOfficerId(officerId) {
    return officials.find((o) => o.officerId === officerId);
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
    const now = new Date().toISOString();
    report.submittedAt = now;
    report.updatedAt = now;
    report.statusChangedAt = now;
    report.status = "Pending";
    report.officerNotes = "";
    report.assignedTo = null;
    report.currentLevel = "ci";
    report.assignedOfficerId = null;
    report.escalationHistory = [];
    report.corruptionFlagRaised = false;
    report.corruptionFlagReason = "";
    report.aiVerification = null;
    reports.push(report);
    return report;
  },
  updateReport(id, updates) {
    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    // If status is changing, update statusChangedAt
    if (updates.status && updates.status !== reports[idx].status) {
      updates.statusChangedAt = now;
    }
    reports[idx] = { ...reports[idx], ...updates, updatedAt: now };
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

  escalateReport(reportId, reason, type = "corruption") {
    const report = this.getReportById(reportId);
    if (!report) return null;

    const oldLevel = report.currentLevel;
    let newLevel = "sp";
    let nextOfficerId = "SP-HYD-001";
    
    if (oldLevel === "sp") {
      newLevel = "dgp";
      nextOfficerId = "DGP-TS-001";
    }

    const currentOfficer = officials.find(o => o.role === oldLevel);
    const actionLabel = type === "inaction"
      ? "Escalated due to Inaction Complaint"
      : "Escalated due to Corruption Complaint";
    
    report.escalationHistory.push({
      level: oldLevel,
      officerId: currentOfficer ? currentOfficer.officerId : null,
      officerName: currentOfficer ? currentOfficer.name : "Unknown Officer",
      action: actionLabel,
      reason: reason,
      type: type,
      timestamp: new Date().toISOString()
    });

    const now = new Date().toISOString();
    report.currentLevel = newLevel;
    report.assignedOfficerId = nextOfficerId;
    report.corruptionFlagRaised = true;
    report.corruptionFlagReason = reason;
    report.updatedAt = now;
    report.statusChangedAt = now;
    report.status = "Pending"; // Reset status for the next authority to review
    
    return report;
  },

  getReportsByLevel(level) {
    return this.getAllReports().filter(r => r.currentLevel === level);
  },

  flagCorruption(reportId, reason) {
    return this.escalateReport(reportId, reason, "corruption");
  },

  canEscalate(reportId) {
    const report = this.getReportById(reportId);
    if (!report) return false;
    return report.status === "Rejected" && report.currentLevel !== "dgp";
  },

  /**
   * Check if a report qualifies for inaction-based escalation.
   * - Pending > 10 days → eligible
   * - Under Review > 15 days → eligible
   * Returns { canEscalate, reason, daysElapsed, deadline }
   */
  canEscalateForInaction(reportId) {
    const report = this.getReportById(reportId);
    if (!report) return { canEscalate: false };

    // Cannot escalate if already at DGP or already flagged
    if (report.currentLevel === "dgp" || report.corruptionFlagRaised) {
      return { canEscalate: false };
    }

    const statusDate = new Date(report.statusChangedAt || report.submittedAt);
    const now = new Date();
    const daysElapsed = Math.floor((now - statusDate) / 86400000);

    if (report.status === "Pending" && daysElapsed > 10) {
      return {
        canEscalate: true,
        reason: "pending_inaction",
        daysElapsed,
        deadline: 10,
        message: `Report has been Pending for ${daysElapsed} days without any action (limit: 10 days).`
      };
    }

    if (report.status === "Under Review" && daysElapsed > 15) {
      return {
        canEscalate: true,
        reason: "review_inaction",
        daysElapsed,
        deadline: 15,
        message: `Report has been Under Review for ${daysElapsed} days without resolution (limit: 15 days).`
      };
    }

    // Return days remaining for info, even if not yet eligible
    let deadline = null;
    let daysRemaining = null;
    if (report.status === "Pending") {
      deadline = 10;
      daysRemaining = 10 - daysElapsed;
    } else if (report.status === "Under Review") {
      deadline = 15;
      daysRemaining = 15 - daysElapsed;
    }

    return {
      canEscalate: false,
      daysElapsed,
      deadline,
      daysRemaining: daysRemaining > 0 ? daysRemaining : null
    };
  }
};

module.exports = db;
